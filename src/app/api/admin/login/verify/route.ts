import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { authVerify, trustCheck } from '@/app/lib/notify';
import {
  readChallengeCookie,
  setChallengeCookie,
  readTrustCookie,
} from '@/app/lib/adminLoginCookie';
import { issueTicket } from '@/app/lib/authTicket';
import { writeAudit } from '@/app/lib/audit';
import { prisma } from '@/app/lib/db';

export const runtime = 'nodejs';

const Body = z.object({ code: z.string().optional(), token: z.string().optional() });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!(await checkRateLimit(`adminlogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 })).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const chal = readChallengeCookie(req);
  if (!chal) return NextResponse.json({ ok: false, message: 'Invalid or expired.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const v = await authVerify({ challengeId: chal.challengeId, code: parsed.data.code, token: parsed.data.token });
  if (!v.ok) {
    await writeAudit('login.email.fail', { actorEmail: chal.email, ip });
    return NextResponse.json({ ok: false, message: 'Invalid code.' }, { status: 401 });
  }
  await writeAudit('login.email.success', { actorEmail: chal.email, ip });

  const user = await prisma.user.findUnique({
    where: { email: chal.email },
    select: { totpEnrolled: true },
  });

  // Trusted device → skip TOTP.
  const trustTok = readTrustCookie(req);
  if (user?.totpEnrolled && trustTok) {
    const t = await trustCheck(chal.email, trustTok);
    if (t.trusted) {
      const ticket = await issueTicket(chal.email);
      await writeAudit('login.trusted_device', { actorEmail: chal.email, ip });
      return NextResponse.json({ ok: true, ticket });
    }
  }

  // Mark the email factor as passed (stage=verified) so /enroll-totp and
  // /verify-totp require it.
  const res = NextResponse.json({
    ok: true,
    needEnroll: !user?.totpEnrolled,
    needTotp: Boolean(user?.totpEnrolled),
  });
  setChallengeCookie(res, chal.challengeId, chal.email, 'verified');
  return res;
}
