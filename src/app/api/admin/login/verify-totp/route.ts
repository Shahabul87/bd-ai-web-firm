import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { totpVerify, recoveryVerify, totpConfirm, recoveryGenerate, trustCreate } from '@/app/lib/notify';
import {
  readChallengeCookie,
  clearChallengeCookie,
  setTrustCookie,
} from '@/app/lib/adminLoginCookie';
import { issueTicket } from '@/app/lib/authTicket';
import { writeAudit } from '@/app/lib/audit';
import { findAdminUser, findOrCreateAdminUser } from '@/app/lib/adminIdentity';

export const runtime = 'nodejs';

const Body = z.object({ code: z.string().min(6).max(64), remember: z.boolean().optional() });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const chal = readChallengeCookie(req);
  if (!chal || chal.stage !== 'verified') {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Rate-limit by IP and by normalized account identity.
  const ipOk = (await checkRateLimit(`mfa:ip:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 })).success;
  const acctOk = (await checkRateLimit(`mfa:acct:${chal.email}`, { maxRequests: 10, windowMs: 5 * 60_000 })).success;
  if (!ipOk || !acctOk) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { code, remember } = parsed.data;

  const user = await findAdminUser(chal.email);

  let recoveryCodes: string[] | undefined;

  if (!user?.totpEnrolled) {
    // First-time enrollment confirmation: activate the pending secret with a
    // valid TOTP. Recovery codes are generated ONLY now, after confirmation.
    const confirmed = (await totpConfirm(chal.email, code)).ok;
    if (!confirmed) {
      await writeAudit('mfa.enroll.confirm.fail', { actorEmail: chal.email, ip });
      return NextResponse.json({ ok: false, message: 'Invalid authenticator code.' }, { status: 401 });
    }
    await findOrCreateAdminUser(chal.email, { totpEnrolled: true });
    const rec = await recoveryGenerate(chal.email);
    recoveryCodes = rec?.codes ?? [];
    await writeAudit('mfa.enroll.confirm', { actorEmail: chal.email, ip });
  } else {
    // Normal MFA: an authenticator code OR a one-time recovery code.
    const viaTotp = (await totpVerify(chal.email, code)).ok;
    const viaRecovery = viaTotp ? false : (await recoveryVerify(chal.email, code)).ok;
    if (!viaTotp && !viaRecovery) {
      await writeAudit('mfa.fail', { actorEmail: chal.email, ip });
      return NextResponse.json({ ok: false, message: 'Invalid authenticator code.' }, { status: 401 });
    }
    await writeAudit(viaRecovery ? 'mfa.recovery.success' : 'mfa.success', {
      actorEmail: chal.email,
      ip,
    });
  }

  const ticket = await issueTicket(chal.email);

  const res = NextResponse.json({ ok: true, ticket, ...(recoveryCodes ? { recoveryCodes } : {}) });
  clearChallengeCookie(res);
  if (remember) {
    const trust = await trustCreate(chal.email, 'admin device', 30);
    if (trust) setTrustCookie(res, trust.token);
  }
  return res;
}
