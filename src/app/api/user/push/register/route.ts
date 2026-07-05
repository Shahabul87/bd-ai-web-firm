import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortalClient } from '@/app/lib/portalSession';
import { registerDevice } from '@/app/lib/notify';

export const runtime = 'nodejs';

const Body = z.object({ token: z.string().min(10) });

export async function POST(req: NextRequest) {
  const client = await getPortalClient();
  if (!client) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await registerDevice(parsed.data.token, `client:${client.clientId}`);
  return NextResponse.json({ ok: true });
}
