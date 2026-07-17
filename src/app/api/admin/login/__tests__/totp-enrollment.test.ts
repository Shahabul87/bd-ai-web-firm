/**
 * @jest-environment node
 *
 * Phase 1 Task 1.3 — TOTP enrollment must be stateful and authorized:
 *  - an already-enrolled account cannot re-enroll with only the email factor,
 *  - the pending secret is activated (and recovery codes issued) ONLY after a
 *    valid TOTP is confirmed,
 *  - normal MFA accepts an authenticator OR a one-time recovery code.
 */
jest.mock('@/app/utils/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, resetIn: 0, remaining: 5 }),
  getClientIP: jest.fn().mockReturnValue('1.2.3.4'),
}));
jest.mock('@/app/lib/adminLoginCookie', () => ({
  readChallengeCookie: jest.fn(),
  clearChallengeCookie: jest.fn(),
  setTrustCookie: jest.fn(),
}));
jest.mock('@/app/lib/notify', () => ({
  totpEnroll: jest.fn(),
  totpConfirm: jest.fn(),
  totpVerify: jest.fn(),
  recoveryVerify: jest.fn(),
  recoveryGenerate: jest.fn(),
  trustCreate: jest.fn(),
}));
jest.mock('@/app/lib/audit', () => ({ writeAudit: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/lib/authTicket', () => ({ issueTicket: jest.fn().mockResolvedValue('tk_1') }));
jest.mock('@/app/lib/db', () => ({
  prisma: { user: { findUnique: jest.fn(), upsert: jest.fn().mockResolvedValue({}) } },
}));

import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/app/utils/rateLimit';
import { readChallengeCookie } from '@/app/lib/adminLoginCookie';
import {
  totpEnroll,
  totpConfirm,
  totpVerify,
  recoveryVerify,
  recoveryGenerate,
} from '@/app/lib/notify';
import { prisma } from '@/app/lib/db';
import { POST as enrollPOST } from '../enroll-totp/route';
import { POST as verifyTotpPOST } from '../verify-totp/route';

const cookieMock = readChallengeCookie as jest.Mock;
const rlMock = checkRateLimit as jest.Mock;
const findUnique = (prisma.user as unknown as { findUnique: jest.Mock }).findUnique;
const upsert = (prisma.user as unknown as { upsert: jest.Mock }).upsert;

function post(url: string, body?: unknown): NextRequest {
  return new NextRequest(new URL(url), {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  rlMock.mockResolvedValue({ success: true, resetIn: 0, remaining: 5 });
  cookieMock.mockReturnValue({ challengeId: 'ch_1', email: 'admin@x.com', stage: 'verified' });
  (totpEnroll as jest.Mock).mockResolvedValue({ otpauthUri: 'otpauth://totp/x' });
  (totpConfirm as jest.Mock).mockResolvedValue({ ok: true });
  (totpVerify as jest.Mock).mockResolvedValue({ ok: false });
  (recoveryVerify as jest.Mock).mockResolvedValue({ ok: false });
  (recoveryGenerate as jest.Mock).mockResolvedValue({ codes: ['AAA-1', 'BBB-2'] });
});

describe('enroll-totp', () => {
  it('rejects re-enrollment for an already-enrolled account', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: true });
    const res = await enrollPOST(post('https://x/api/admin/login/enroll-totp', {}));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(expect.objectContaining({ code: 'ALREADY_ENROLLED' }));
    expect(totpEnroll).not.toHaveBeenCalled();
  });

  it('allows first-time enrollment and does NOT return recovery codes', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: false });
    const res = await enrollPOST(post('https://x/api/admin/login/enroll-totp', {}));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.otpauthUri).toBe('otpauth://totp/x');
    expect(json.recoveryCodes).toBeUndefined();
  });

  it('401s without a verified challenge', async () => {
    cookieMock.mockReturnValue(null);
    const res = await enrollPOST(post('https://x/api/admin/login/enroll-totp', {}));
    expect(res.status).toBe(401);
  });

  it('429s when rate limited', async () => {
    rlMock.mockResolvedValue({ success: false, resetIn: 60, remaining: 0 });
    findUnique.mockResolvedValue({ totpEnrolled: false });
    const res = await enrollPOST(post('https://x/api/admin/login/enroll-totp', {}));
    expect(res.status).toBe(429);
  });
});

describe('verify-totp', () => {
  it('confirms first enrollment and returns recovery codes once', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: false });
    const res = await verifyTotpPOST(post('https://x/api/admin/login/verify-totp', { code: '123456' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.ticket).toBe('tk_1');
    expect(json.recoveryCodes).toEqual(['AAA-1', 'BBB-2']);
    expect(totpConfirm).toHaveBeenCalledWith('admin@x.com', '123456');
    expect(recoveryGenerate).toHaveBeenCalledWith('admin@x.com');
    expect(upsert).toHaveBeenCalled();
    expect(totpVerify).not.toHaveBeenCalled();
  });

  it('rejects a bad enrollment-confirmation code without enrolling', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: false });
    (totpConfirm as jest.Mock).mockResolvedValue({ ok: false });
    const res = await verifyTotpPOST(post('https://x/api/admin/login/verify-totp', { code: '000000' }));
    expect(res.status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
    expect(recoveryGenerate).not.toHaveBeenCalled();
  });

  it('verifies an authenticator code for an enrolled account (no recovery codes)', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: true });
    (totpVerify as jest.Mock).mockResolvedValue({ ok: true });
    const res = await verifyTotpPOST(post('https://x/api/admin/login/verify-totp', { code: '654321' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ticket).toBe('tk_1');
    expect(json.recoveryCodes).toBeUndefined();
    expect(totpConfirm).not.toHaveBeenCalled();
  });

  it('accepts a one-time recovery code for an enrolled account', async () => {
    findUnique.mockResolvedValue({ totpEnrolled: true });
    (totpVerify as jest.Mock).mockResolvedValue({ ok: false });
    (recoveryVerify as jest.Mock).mockResolvedValue({ ok: true });
    const res = await verifyTotpPOST(post('https://x/api/admin/login/verify-totp', { code: 'RECOV-123' }));
    expect(res.status).toBe(200);
    expect((await res.json()).ticket).toBe('tk_1');
  });
});
