import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { totpVerify, recoveryVerify, trustCreate } from '@/app/lib/notify';
import {
  readChallengeCookie,
  clearChallengeCookie,
  setTrustCookie,
} from '@/app/lib/adminLoginCookie';
import { issueTicket } from '@/app/lib/authTicket';
import { writeAudit } from '@/app/lib/audit';
import { prisma } from '@/app/lib/db';

export const runtime = 'nodejs';

const Body = z.object({ code: z.string().min(6), remember: z.boolean().optional() });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!checkRateLimit(`adminlogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 }).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const chal = readChallengeCookie(req);
  if (!chal || chal.stage !== 'verified') {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { code, remember } = parsed.data;

  const ok =
    (await totpVerify(chal.email, code)).ok || (await recoveryVerify(chal.email, code)).ok;
  if (!ok) {
    await writeAudit('login.mfa.fail', { actorEmail: chal.email, ip });
    return NextResponse.json({ ok: false, message: 'Invalid authenticator code.' }, { status: 401 });
  }

  // First successful MFA also confirms enrollment.
  await prisma.user.upsert({
    where: { email: chal.email },
    update: { totpEnrolled: true },
    create: { email: chal.email, role: 'ADMIN', totpEnrolled: true },
  });

  const ticket = await issueTicket(chal.email);
  await writeAudit('login.mfa.success', { actorEmail: chal.email, ip });

  const res = NextResponse.json({ ok: true, ticket });
  clearChallengeCookie(res);
  if (remember) {
    const trust = await trustCreate(chal.email, 'admin device', 30);
    if (trust) setTrustCookie(res, trust.token);
  }
  return res;
}
