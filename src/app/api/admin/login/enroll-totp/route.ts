import { NextRequest, NextResponse } from 'next/server';
import { readChallengeCookie } from '@/app/lib/adminLoginCookie';
import { totpEnroll, recoveryGenerate } from '@/app/lib/notify';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const chal = readChallengeCookie(req);
  if (!chal || chal.stage !== 'verified') {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const enroll = await totpEnroll(chal.email, chal.email);
  if (!enroll) return NextResponse.json({ ok: false, message: 'Enrollment failed.' }, { status: 502 });
  const rec = await recoveryGenerate(chal.email);
  return NextResponse.json({
    ok: true,
    otpauthUri: enroll.otpauthUri,
    recoveryCodes: rec?.codes ?? [],
  });
}
