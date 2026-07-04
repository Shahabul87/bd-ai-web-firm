import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { isAdminEmail } from '@/app/lib/adminAuth';
import { authChallenge } from '@/app/lib/notify';
import { writeAudit } from '@/app/lib/audit';
import { SITE_URL } from '@/app/lib/email';
import { setChallengeCookie } from '@/app/lib/adminLoginCookie';

export const runtime = 'nodejs';

const Body = z.object({ email: z.email(), method: z.enum(['magic_link', 'otp']) });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!checkRateLimit(`adminlogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 }).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { email, method } = parsed.data;

  // Enumeration-safe: identical body regardless of allowlist membership. The
  // challengeId is returned only via the httpOnly cookie, never in the body.
  const res = NextResponse.json({ ok: true });
  if (isAdminEmail(email)) {
    const chal = await authChallenge({
      method,
      to: email,
      name: email,
      redirect: `${SITE_URL}/admin/login/callback`,
    });
    if (chal) {
      setChallengeCookie(res, chal.challengeId, email, 'email');
      await writeAudit('login.start', { actorEmail: email, ip });
    } else {
      console.error('admin login: challenge failed for an allowlisted email');
    }
  } else {
    await writeAudit('login.start.blocked', { ip, meta: { email } });
  }
  return res;
}
