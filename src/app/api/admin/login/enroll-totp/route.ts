import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { readChallengeCookie } from '@/app/lib/adminLoginCookie';
import { totpEnroll } from '@/app/lib/notify';
import { writeAudit } from '@/app/lib/audit';
import { findAdminUser } from '@/app/lib/adminIdentity';

export const runtime = 'nodejs';

/**
 * Begin TOTP enrollment. Only permitted when:
 *  - the email factor has passed (challenge cookie stage === 'verified'), AND
 *  - the canonical account is NOT already enrolled.
 *
 * The second condition is the security invariant: an already-enrolled account
 * must never be able to rotate/replace its TOTP secret using email access alone.
 * The pending secret is activated (and recovery codes issued) only after a valid
 * TOTP is confirmed in /verify-totp — never here.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const chal = readChallengeCookie(req);
  if (!chal || chal.stage !== 'verified') {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Rate-limit by IP and by normalized account identity.
  const ipOk = (await checkRateLimit(`mfa-enroll:ip:${ip}`, { maxRequests: 10, windowMs: 15 * 60_000 })).success;
  const acctOk = (await checkRateLimit(`mfa-enroll:acct:${chal.email}`, { maxRequests: 5, windowMs: 15 * 60_000 })).success;
  if (!ipOk || !acctOk) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }

  const user = await findAdminUser(chal.email);
  if (user?.totpEnrolled) {
    await writeAudit('mfa.enroll.blocked', { actorEmail: chal.email, ip });
    return NextResponse.json({ ok: false, code: 'ALREADY_ENROLLED' }, { status: 409 });
  }

  const enroll = await totpEnroll(chal.email, chal.email);
  if (!enroll) return NextResponse.json({ ok: false, message: 'Enrollment failed.' }, { status: 502 });

  await writeAudit('mfa.enroll.start', { actorEmail: chal.email, ip });
  return NextResponse.json({ ok: true, otpauthUri: enroll.otpauthUri });
}
