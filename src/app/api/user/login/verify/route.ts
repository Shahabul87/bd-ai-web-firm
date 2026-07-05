import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { authVerify, trustCreate } from '@/app/lib/notify';
import { issueTicket } from '@/app/lib/authTicket';
import {
  readPortalChallenge,
  clearPortalChallenge,
  setPortalTrustCookie,
} from '@/app/lib/portalLoginCookie';
import { writeAudit } from '@/app/lib/audit';

export const runtime = 'nodejs';

const Body = z.object({
  code: z.string().optional(),
  token: z.string().optional(),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!(await checkRateLimit(`portallogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 })).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const chal = readPortalChallenge(req);
  if (!chal) return NextResponse.json({ ok: false, message: 'Invalid or expired.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const v = await authVerify({
    challengeId: chal.challengeId,
    code: parsed.data.code,
    token: parsed.data.token,
  });
  if (!v.ok) {
    await writeAudit('portal.login.fail', { actorEmail: chal.email, ip });
    return NextResponse.json({ ok: false, message: 'Invalid code.' }, { status: 401 });
  }

  const ticket = await issueTicket(chal.email, 'portal');
  await writeAudit('portal.login.success', { actorEmail: chal.email, ip });

  const res = NextResponse.json({ ok: true, ticket });
  clearPortalChallenge(res);

  if (parsed.data.remember) {
    const tr = await trustCreate(chal.email, 'portal device', 30);
    if (tr) setPortalTrustCookie(res, tr.token);
  }
  return res;
}
