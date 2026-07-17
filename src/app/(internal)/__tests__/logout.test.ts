/**
 * @jest-environment node
 *
 * Phase 1 Task 1.4 — logout must revoke custom trusted-device state, not just
 * the Auth.js session cookie. After logout the trust cookie must be gone so the
 * next login cannot skip MFA / OTP.
 */
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/auth', () => ({ signIn: jest.fn(), signOut: jest.fn(), auth: jest.fn() }));
jest.mock('@/authPortal', () => ({ signIn: jest.fn(), signOut: jest.fn(), authPortal: jest.fn() }));
jest.mock('@/app/lib/notify', () => ({ trustRevoke: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/lib/audit', () => ({ writeAudit: jest.fn().mockResolvedValue(undefined) }));

import { cookies } from 'next/headers';
import { auth, signOut as adminSignOut } from '@/auth';
import { authPortal, signOut as portalSignOut } from '@/authPortal';
import { trustRevoke } from '@/app/lib/notify';
import { signOutAction } from '../admin/login/actions';
import { signOutPortal } from '../portal/login/actions';

function makeJar(cookieMap: Record<string, string>) {
  return {
    get: jest.fn((n: string) => (n in cookieMap ? { value: cookieMap[n] } : undefined)),
    delete: jest.fn(),
    set: jest.fn(),
  };
}

beforeEach(() => jest.clearAllMocks());

describe('admin logout', () => {
  it('revokes the trust token and clears trust + challenge cookies', async () => {
    const jar = makeJar({ adm_trust: 'tok-123' });
    (cookies as jest.Mock).mockResolvedValue(jar);
    (auth as jest.Mock).mockResolvedValue({ user: { email: 'admin@x.com' } });

    await signOutAction();

    expect(trustRevoke).toHaveBeenCalledWith('admin@x.com', 'tok-123');
    expect(jar.delete).toHaveBeenCalledWith('adm_trust');
    expect(jar.delete).toHaveBeenCalledWith('adm_chal');
    expect(adminSignOut).toHaveBeenCalledWith({ redirectTo: '/admin/login' });
  });

  it('still clears cookies when there is no trust token', async () => {
    const jar = makeJar({});
    (cookies as jest.Mock).mockResolvedValue(jar);
    (auth as jest.Mock).mockResolvedValue(null);

    await signOutAction();

    expect(trustRevoke).not.toHaveBeenCalled();
    expect(jar.delete).toHaveBeenCalledWith('adm_trust');
    expect(jar.delete).toHaveBeenCalledWith('adm_chal');
    expect(adminSignOut).toHaveBeenCalled();
  });
});

describe('portal logout', () => {
  it('revokes the trust token and clears trust + challenge cookies', async () => {
    const jar = makeJar({ portal_trust: 'ptok-9' });
    (cookies as jest.Mock).mockResolvedValue(jar);
    (authPortal as jest.Mock).mockResolvedValue({ user: { email: 'client@x.com' } });

    await signOutPortal();

    expect(trustRevoke).toHaveBeenCalledWith('client@x.com', 'ptok-9');
    expect(jar.delete).toHaveBeenCalledWith('portal_trust');
    expect(jar.delete).toHaveBeenCalledWith('portal_chal');
    expect(portalSignOut).toHaveBeenCalledWith({ redirectTo: '/portal/login' });
  });
});
