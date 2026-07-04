import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

// Short-lived, HMAC-signed cookie binding a challengeId to its email so the
// multi-step login flow never trusts the client for the email/challenge pair.
const NAME = 'adm_chal';

function sign(v: string): string {
  return createHmac('sha256', process.env.AUTH_SECRET ?? '').update(v).digest('hex');
}

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export type LoginStage = 'email' | 'verified';

export function setChallengeCookie(
  res: NextResponse,
  challengeId: string,
  email: string,
  stage: LoginStage,
): void {
  // email addresses and challenge ids never contain ':', so it is a safe delimiter.
  const v = `${challengeId}:${email}:${stage}`;
  res.cookies.set(NAME, `${v}.${sign(v)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });
}

export function readChallengeCookie(
  req: NextRequest,
): { challengeId: string; email: string; stage: LoginStage } | null {
  const raw = req.cookies.get(NAME)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return null;
  const v = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  if (!safeEq(sign(v), mac)) return null;
  const parts = v.split(':');
  if (parts.length < 3) return null;
  const challengeId = parts[0];
  const stage = parts[parts.length - 1] as LoginStage;
  const email = parts.slice(1, -1).join(':');
  if (stage !== 'email' && stage !== 'verified') return null;
  return { challengeId, email, stage };
}

export function clearChallengeCookie(res: NextResponse): void {
  res.cookies.set(NAME, '', { httpOnly: true, maxAge: 0, path: '/' });
}

// Trusted-device cookie ("remember me") — stores the notify-svc trust token.
const TRUST = 'adm_trust';

export function setTrustCookie(res: NextResponse, token: string): void {
  res.cookies.set(TRUST, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function readTrustCookie(req: NextRequest): string | null {
  return req.cookies.get(TRUST)?.value ?? null;
}
