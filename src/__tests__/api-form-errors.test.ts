/**
 * @jest-environment node
 *
 * The contact & quote API routes used to return English error/success PROSE that
 * the client rendered verbatim, so a Bengali visitor saw English server messages.
 * The routes now return stable CODES (client localizes them via the FormErrors
 * message namespace). These tests pin that contract: a validation failure must
 * return the machine code, not prose, and the rate-limit retry value must travel
 * as a number so the client can interpolate it.
 */
jest.mock('@/app/utils/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, resetIn: 0, remaining: 5 }),
  getClientIP: jest.fn().mockReturnValue('1.2.3.4'),
}));
jest.mock('@/app/lib/leads', () => ({
  createLead: jest.fn().mockResolvedValue({ id: 'lead_1' }),
}));
jest.mock('@/app/lib/notify', () => ({
  sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }),
  sendPush: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/app/lib/email', () => ({
  SITE_URL: 'https://www.craftsai.org',
  CONTACT_EMAIL: 'owner@craftsai.org',
}));

import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/app/utils/rateLimit';
import { POST as contactPOST } from '@/app/api/contact/route';
import { POST as quotePOST } from '@/app/api/quote/route';
import {
  CONTACT_FIELD_CODES,
  QUOTE_FIELD_CODES,
  RATE_LIMITED_SECONDS,
} from '@/app/lib/formErrors';

const rateLimitMock = checkRateLimit as jest.Mock;

function postJson(url: string, body: unknown): NextRequest {
  return new NextRequest(new URL(url), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  rateLimitMock.mockResolvedValue({ success: true, resetIn: 0, remaining: 5 });
});

describe('contact API returns codes, not prose', () => {
  it('returns the field CODE (not English prose) for a too-short name', async () => {
    const res = await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: 'a', // 1 char -> invalid
        email: 'ada@example.com',
        message: 'this is a sufficiently long message',
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors.name).toBe(CONTACT_FIELD_CODES.name); // 'name_too_short'
    expect(json.errors.name).toBe('name_too_short');
    // The old prose payload must be gone.
    expect(json.errors.name).not.toMatch(/at least/i);
    expect(json).not.toHaveProperty('message');
    // Valid fields carry no code.
    expect(json.errors).not.toHaveProperty('email');
    expect(json.errors).not.toHaveProperty('message');
  });

  it('returns a rate-limit CODE plus a numeric retrySeconds', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: false, resetIn: 42, remaining: 0 });

    const res = await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'this is a sufficiently long message',
      }),
    );

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.code).toBe(RATE_LIMITED_SECONDS);
    expect(json.retrySeconds).toBe(42);
    expect(typeof json.retrySeconds).toBe('number');
    expect(json).not.toHaveProperty('message');
  });
});

describe('quote API returns codes, not prose', () => {
  it('returns field CODES for missing required fields', async () => {
    const res = await quotePOST(
      postJson('https://www.craftsai.org/api/quote', {
        projectDetails: { services: [], projectType: '', description: '' },
        companyInfo: { companyName: '', contactName: '', email: 'not-an-email' },
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors.services).toBe(QUOTE_FIELD_CODES.services); // 'services_required'
    expect(json.errors.email).toBe(QUOTE_FIELD_CODES.email); // 'email_required'
    expect(json.errors.services).not.toMatch(/select/i);
    expect(json).not.toHaveProperty('message');
  });
});
