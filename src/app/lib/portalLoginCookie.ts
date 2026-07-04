import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

// Short-lived, HMAC-signed cookie binding a challengeId to its email across the
// portal login steps. Signed with PORTAL_AUTH_SECRET (NOT the admin secret) so
// the two login flows share no signing material.
const NAME = 'portal_chal';

function sign(v: string): string {
  return createHmac('sha256', process.env.PORTAL_AUTH_SECRET ?? '').update(v).digest('hex');
}

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function setPortalChallenge(res: NextResponse, challengeId: string, email: string): void {
  // emails and challenge ids never contain ':', so it is a safe delimiter.
  const v = `${challengeId}:${email}`;
  res.cookies.set(NAME, `${v}.${sign(v)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });
}

export function readPortalChallenge(req: NextRequest): { challengeId: string; email: string } | null {
  const raw = req.cookies.get(NAME)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return null;
  const v = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  if (!safeEq(sign(v), mac)) return null;
  const idx = v.indexOf(':');
  if (idx < 0) return null;
  return { challengeId: v.slice(0, idx), email: v.slice(idx + 1) };
}

export function clearPortalChallenge(res: NextResponse): void {
  res.cookies.set(NAME, '', { httpOnly: true, maxAge: 0, path: '/' });
}

// Trusted-device cookie ("remember this device") — stores the notify-svc token.
const TRUST = 'portal_trust';

export function setPortalTrustCookie(res: NextResponse, token: string): void {
  res.cookies.set(TRUST, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function readPortalTrustCookie(req: NextRequest): string | null {
  return req.cookies.get(TRUST)?.value ?? null;
}
