import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { prisma } from '@/app/lib/db';
import { trustCheck } from '@/app/lib/notify';
import { issueTicket } from '@/app/lib/authTicket';
import { startPortalLogin } from '@/app/lib/portalLogin';
import { normalizeEmail } from '@/app/lib/normalizeEmail';
import { setPortalChallenge, readPortalTrustCookie } from '@/app/lib/portalLoginCookie';
import { writeAudit } from '@/app/lib/audit';

export const runtime = 'nodejs';

const Body = z.object({ email: z.email(), method: z.enum(['magic_link', 'otp']) });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!(await checkRateLimit(`portallogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 })).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { method } = parsed.data;
  const email = normalizeEmail(parsed.data.email);

  // Trusted-device fast path: if a valid trust token maps to an enabled client,
  // mint a ticket directly (the portal Credentials provider re-checks the client).
  const trustTok = readPortalTrustCookie(req);
  if (trustTok) {
    const client = await prisma.client.findFirst({
      where: { email, status: 'ACTIVE', portalEnabled: true },
      select: { id: true },
    });
    if (client && (await trustCheck(email, trustTok)).trusted) {
      const ticket = await issueTicket(email, 'portal');
      await writeAudit('portal.login.trusted_device', { actorEmail: email, ip });
      return NextResponse.json({ ok: true, ticket });
    }
  }

  // Enumeration-safe: identical response whether or not the email is enabled.
  const res = NextResponse.json({ ok: true });
  const started = await startPortalLogin(email, method);
  if (started) {
    setPortalChallenge(res, started.challengeId, started.email);
    await writeAudit('portal.login.start', { actorEmail: email, ip });
  }
  return res;
}
