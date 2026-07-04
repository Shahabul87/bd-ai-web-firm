# Admin Phase 1 — Part 2: Enterprise Admin Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Secure passwordless admin login (magic link + OTP) with full MFA (TOTP + recovery codes + trusted device), an allowlist gate, hardened Auth.js 5 database sessions, route-protecting middleware, and an audit log — driven by notify-svc, with a strictly dev-only fallback for local testing.

**Architecture:** Our own `/api/admin/login/*` routes orchestrate the factor sequence via notify-svc; once all factors pass we mint an **Auth.js 5** database session through a Credentials provider that only trusts a single-use `AuthTicket`. Admin auth is namespaced under `/api/admin/*` and is completely separate from any future client auth.

**Tech Stack:** Next.js 15.5, TypeScript strict, Auth.js v5 (`next-auth@5` + `@auth/prisma-adapter`), Prisma 6 + Postgres, Zod, notify-svc HTTP API, Jest.

## Global Constraints

- **Admin auth is completely separate** from any future client auth — own routes (`/api/admin/*`), own session, no shared cookies/tokens. Hard rule.
- TS strict, no `any`. **Zod-validate every request body.** Never log secret values (`AUTH_SECRET`, `NOTIFY_API_KEY`, OTP codes in prod).
- Cookies: httpOnly, `Secure` in prod, `SameSite=Lax`. Database sessions (revocable).
- Enumeration-safe: `/start` returns the same shape whether or not the email is allowlisted.
- **Dev fallback** (`lib/devAuth.ts`) may generate/log codes locally ONLY when `!isNotifyConfigured() && process.env.NODE_ENV !== 'production'`. It must be unreachable in production — guard on both conditions and `console.warn` loudly.
- notify-svc base + endpoints per the connect-notify skill: `NOTIFY_URL` = `https://notify-api-production-2689.up.railway.app`; `/v1/auth/challenge|verify`, `/v1/auth/totp/enroll|confirm|verify`, `/v1/auth/recovery/generate|verify`, `/v1/auth/trust|trust/check`.
- Auth.js basePath: `/api/admin/auth`. `AUTH_SECRET` required. Session maxAge 30 days, sliding.

## File Structure

```
src/auth.ts                                   # Auth.js 5 config: adapter, Credentials(ticket), session cbs
src/app/api/admin/auth/[...nextauth]/route.ts # Auth.js handlers (GET/POST) — session/csrf/callback
src/app/lib/notify.ts                         # (extend) auth fns: authChallenge, authVerify, totp*, recovery*, trust*
src/app/lib/devAuth.ts                        # dev-only local code store (challenge/verify) when notify unconfigured
src/app/lib/adminAuth.ts                      # allowlist: isAdminEmail(email)
src/app/lib/authTicket.ts                     # issueTicket(email)/redeemTicket(id) over Prisma AuthTicket
src/app/lib/audit.ts                          # writeAudit(action, {actorEmail, ip, meta})
src/app/lib/adminSession.ts                   # requireAdmin(): read Auth.js session server-side + allowlist re-check
src/app/api/admin/login/start/route.ts        # {email, method} -> challenge
src/app/api/admin/login/verify/route.ts       # {challengeId, code} -> email factor -> {needTotp|needEnroll|ticket}
src/app/api/admin/login/verify-totp/route.ts  # {challengeId, code, remember?} -> ticket
src/app/api/admin/login/enroll-totp/route.ts  # {challengeId} -> {otpauthUri, recoveryCodes}
src/middleware.ts                             # protect /admin/** and /api/admin/** (allow login+auth+public)
src/app/admin/login/page.tsx                  # login UI (email -> code/link -> totp -> enroll)
src/app/admin/login/actions.ts               # server action: signInWithTicket(ticket)
src/app/admin/page.tsx                        # gated placeholder dashboard (proves auth)
src/app/admin/layout.tsx                      # server layout: requireAdmin() or redirect to /admin/login
```

---

### Task 1: Install Auth.js + extend notify.ts with auth functions + dev fallback

**Files:**
- Modify: `package.json` (add `next-auth@beta` v5, `@auth/prisma-adapter`)
- Modify: `src/app/lib/notify.ts`
- Create: `src/app/lib/devAuth.ts`
- Test: `src/app/lib/__tests__/notify-auth.test.ts`

**Interfaces produced (notify.ts):**
- `authChallenge(input: { method: 'otp'|'magic_link'; to: string; appName?: string; name?: string; redirect?: string }): Promise<{ challengeId: string } | null>`
- `authVerify(input: { challengeId: string; code?: string; token?: string }): Promise<{ ok: boolean }>`
- `totpEnroll(userRef: string, account: string): Promise<{ otpauthUri: string } | null>`
- `totpConfirm(userRef: string, code: string): Promise<{ ok: boolean }>`
- `totpVerify(userRef: string, code: string): Promise<{ ok: boolean }>`
- `recoveryGenerate(userRef: string, count?: number): Promise<{ codes: string[] } | null>`
- `recoveryVerify(userRef: string, code: string): Promise<{ ok: boolean }>`
- `trustCreate(userRef: string, label: string, ttlDays: number): Promise<{ token: string } | null>`
- `trustCheck(userRef: string, token: string): Promise<{ trusted: boolean }>`
Each returns `null`/`{ok:false}` on failure (never throws). When `!isNotifyConfigured() && NODE_ENV!=='production'`, `authChallenge`/`authVerify` delegate to `devAuth`; TOTP/recovery/trust in dev-unconfigured mode return permissive stubs guarded by the same condition.

- [ ] **Step 1: Install Auth.js v5 + adapter**

Run: `npm install next-auth@beta @auth/prisma-adapter`
Expected: `next-auth` ^5.x and `@auth/prisma-adapter` in `package.json`.

- [ ] **Step 2: Write `devAuth.ts` (dev-only local code store)**

```ts
import 'server-only';

// In-memory challenge store — DEV ONLY, used when notify-svc is not configured.
type Chal = { code: string; expires: number };
const store = new Map<string, Chal>();

function assertDev() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('devAuth must never run in production');
  }
}

export function devChallenge(seed: string): { challengeId: string } {
  assertDev();
  const challengeId = `dev_${seed}_${Math.floor(Math.random() * 1e9)}`;
  // Deterministic-ish, human-typable dev code. NOT for production.
  const code = String(100000 + (Math.abs(hash(challengeId)) % 900000));
  store.set(challengeId, { code, expires: Date.now() + 5 * 60_000 });
  console.warn(`[devAuth] challenge ${challengeId} -> code ${code} (dev only)`);
  return { challengeId };
}

export function devVerify(challengeId: string, code: string): { ok: boolean } {
  assertDev();
  const c = store.get(challengeId);
  if (!c || Date.now() > c.expires) return { ok: false };
  const ok = c.code === code;
  if (ok) store.delete(challengeId);
  return { ok };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
```

- [ ] **Step 3: Write the failing test** (`notify-auth.test.ts`, node env, mock fetch)

Test: with `NOTIFY_URL`/`KEY` set, `authChallenge({method:'otp',to})` POSTs `/v1/auth/challenge` with `X-API-Key` and returns `{challengeId}` from the response `{challenge_id}`; on 500 returns `null`. With notify unset + `NODE_ENV='test'` (non-prod), `authChallenge` returns a `{challengeId}` from devAuth and does NOT fetch.

```ts
/** @jest-environment node */
describe('authChallenge', () => {
  const OLD = process.env; const realFetch = global.fetch;
  afterEach(() => { process.env = OLD; global.fetch = realFetch; jest.resetModules(); });

  it('POSTs /v1/auth/challenge when configured', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    const fetchMock = jest.fn().mockResolvedValue(new Response(JSON.stringify({ challenge_id: 'c1' }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { authChallenge } = await import('../notify');
    const r = await authChallenge({ method: 'otp', to: 'a@b.com' });
    expect(r).toEqual({ challengeId: 'c1' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://n.test/v1/auth/challenge');
    expect(init.headers).toMatchObject({ 'X-API-Key': 'k_1' });
  });

  it('falls back to devAuth (no fetch) when unconfigured in non-prod', async () => {
    process.env = { ...OLD, NOTIFY_URL: '', NOTIFY_API_KEY: '', NODE_ENV: 'test' };
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const { authChallenge } = await import('../notify');
    const r = await authChallenge({ method: 'otp', to: 'a@b.com' });
    expect(r?.challengeId).toMatch(/^dev_/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run test to verify it fails** — `npm test -- notify-auth` → FAIL (authChallenge undefined).

- [ ] **Step 5: Implement the auth functions in `notify.ts`**

Append to `notify.ts` (reuse the existing `post`, `isNotifyConfigured`, `NOTIFY_URL`, `NOTIFY_API_KEY`). Full code:
```ts
import { devChallenge, devVerify } from './devAuth';

const devMode = () => !isNotifyConfigured() && process.env.NODE_ENV !== 'production';

async function jsonOk<T>(res: Response | null, pick: (j: Record<string, unknown>) => T): Promise<T | null> {
  if (!res || res.status < 200 || res.status >= 300) return null;
  try { return pick((await res.json()) as Record<string, unknown>); } catch { return null; }
}

export async function authChallenge(input: {
  method: 'otp' | 'magic_link'; to: string; appName?: string; name?: string; redirect?: string;
}): Promise<{ challengeId: string } | null> {
  if (devMode()) return devChallenge(input.to);
  const res = await post('/v1/auth/challenge', {
    method: input.method, to: input.to, app_name: input.appName ?? 'CraftsAI Admin',
    name: input.name, redirect: input.redirect,
  });
  return jsonOk(res, (j) => ({ challengeId: String(j.challenge_id) }));
}

export async function authVerify(input: {
  challengeId: string; code?: string; token?: string;
}): Promise<{ ok: boolean }> {
  if (devMode()) return devVerify(input.challengeId, input.code ?? '');
  const res = await post('/v1/auth/verify', {
    challenge_id: input.challengeId, code: input.code, token: input.token,
  });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

export async function totpEnroll(userRef: string, account: string): Promise<{ otpauthUri: string } | null> {
  if (devMode()) return { otpauthUri: `otpauth://totp/CraftsAI:${account}?secret=DEVSECRET234567&issuer=CraftsAI` };
  const res = await post('/v1/auth/totp/enroll', { user_ref: userRef, account });
  return jsonOk(res, (j) => ({ otpauthUri: String(j.otpauth_uri) }));
}
export async function totpConfirm(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: code.length === 6 };
  const res = await post('/v1/auth/totp/confirm', { user_ref: userRef, code });
  return { ok: Boolean(res && res.ok) };
}
export async function totpVerify(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: code.length === 6 };
  const res = await post('/v1/auth/totp/verify', { user_ref: userRef, code });
  return { ok: Boolean(res && res.ok) };
}
export async function recoveryGenerate(userRef: string, count = 10): Promise<{ codes: string[] } | null> {
  if (devMode()) return { codes: Array.from({ length: count }, (_, i) => `DEV-${String(i).padStart(2, '0')}-RECOVERY`) };
  const res = await post('/v1/auth/recovery/generate', { user_ref: userRef, count });
  return jsonOk(res, (j) => ({ codes: (j.codes as string[]) ?? [] }));
}
export async function recoveryVerify(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: /^DEV-\d\d-RECOVERY$/.test(code) };
  const res = await post('/v1/auth/recovery/verify', { user_ref: userRef, code });
  return { ok: Boolean(res && res.ok) };
}
export async function trustCreate(userRef: string, label: string, ttlDays: number): Promise<{ token: string } | null> {
  if (devMode()) return { token: `dev-trust-${userRef}` };
  const res = await post('/v1/auth/trust', { user_ref: userRef, label, ttl_days: ttlDays });
  return jsonOk(res, (j) => ({ token: String(j.token) }));
}
export async function trustCheck(userRef: string, token: string): Promise<{ trusted: boolean }> {
  if (devMode()) return { trusted: token === `dev-trust-${userRef}` };
  const res = await post('/v1/auth/trust/check', { user_ref: userRef, token });
  return jsonOk(res, (j) => ({ trusted: Boolean(j.trusted) })) ?? { trusted: false };
}
```
> `post` currently returns `Response | null`; ensure it's declared before these functions (it is, near the top of notify.ts).

- [ ] **Step 6: Run tests** — `npm test -- notify-auth` → PASS (2). Then `npm test` → all green.

- [ ] **Step 7: Commit** — `git add src/app/lib/notify.ts src/app/lib/devAuth.ts src/app/lib/__tests__/notify-auth.test.ts package.json package-lock.json && git commit -m "feat(auth): notify-svc auth client + dev fallback"`

---

### Task 2: Allowlist, audit, and auth-ticket helpers

**Files:**
- Create: `src/app/lib/adminAuth.ts`, `src/app/lib/audit.ts`, `src/app/lib/authTicket.ts`
- Test: `src/app/lib/__tests__/adminAuth.test.ts`, `authTicket.test.ts`

**Interfaces:**
- `isAdminEmail(email: string): boolean` — case-insensitive membership in `ADMIN_EMAILS` (comma-separated).
- `writeAudit(action: string, opts?: { actorEmail?: string; ip?: string; meta?: Record<string, unknown> }): Promise<void>` — inserts an `AuditLog`; never throws.
- `issueTicket(email: string): Promise<string>` — creates an `AuthTicket` (2-min TTL), returns its id.
- `redeemTicket(id: string): Promise<string | null>` — returns the email and burns the ticket if unused & unexpired; else `null`.

- [ ] **Step 1: `adminAuth.test.ts` (failing)**
```ts
describe('isAdminEmail', () => {
  const OLD = process.env;
  afterEach(() => { process.env = OLD; jest.resetModules(); });
  it('matches allowlisted emails case-insensitively', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: 'Owner@Craftsai.org, a@b.com' };
    const { isAdminEmail } = await import('../adminAuth');
    expect(isAdminEmail('owner@craftsai.org')).toBe(true);
    expect(isAdminEmail('nope@x.com')).toBe(false);
  });
  it('returns false when unset', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: '' };
    const { isAdminEmail } = await import('../adminAuth');
    expect(isAdminEmail('a@b.com')).toBe(false);
  });
});
```
- [ ] **Step 2: run → FAIL.**
- [ ] **Step 3: `adminAuth.ts`**
```ts
export function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? '';
  const set = raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return set.includes(email.trim().toLowerCase());
}
```
- [ ] **Step 4: run → PASS.**
- [ ] **Step 5: `audit.ts`**
```ts
import { prisma } from './db';
export async function writeAudit(
  action: string,
  opts: { actorEmail?: string; ip?: string; meta?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { action, actorEmail: opts.actorEmail ?? null, ip: opts.ip ?? null, meta: (opts.meta ?? undefined) as never },
    });
  } catch (err) {
    console.error('writeAudit failed:', err instanceof Error ? err.message : 'unknown');
  }
}
```
- [ ] **Step 6: `authTicket.test.ts` (failing)** — mock `../db` with `authTicket: { create, findUnique, update }`; assert `issueTicket` creates with `expiresAt` ~2min ahead; `redeemTicket` returns email & marks used for a fresh ticket, returns `null` for used/expired.
```ts
jest.mock('../db', () => ({ prisma: { authTicket: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } }));
import { prisma } from '../db';
import { issueTicket, redeemTicket } from '../authTicket';
const t = prisma.authTicket as unknown as { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
describe('authTicket', () => {
  beforeEach(() => jest.clearAllMocks());
  it('issues a ticket', async () => {
    t.create.mockResolvedValue({ id: 'tk_1' });
    expect(await issueTicket('a@b.com')).toBe('tk_1');
  });
  it('redeems a fresh ticket once', async () => {
    t.findUnique.mockResolvedValue({ id: 'tk_1', email: 'a@b.com', usedAt: null, expiresAt: new Date(Date.now() + 60000) });
    t.update.mockResolvedValue({});
    expect(await redeemTicket('tk_1')).toBe('a@b.com');
  });
  it('rejects a used or expired ticket', async () => {
    t.findUnique.mockResolvedValue({ id: 'tk_1', email: 'a@b.com', usedAt: new Date(), expiresAt: new Date(Date.now() + 60000) });
    expect(await redeemTicket('tk_1')).toBeNull();
  });
});
```
- [ ] **Step 7: run → FAIL.**
- [ ] **Step 8: `authTicket.ts`**
```ts
import { prisma } from './db';
export async function issueTicket(email: string): Promise<string> {
  const t = await prisma.authTicket.create({
    data: { email, expiresAt: new Date(Date.now() + 2 * 60_000) }, select: { id: true },
  });
  return t.id;
}
export async function redeemTicket(id: string): Promise<string | null> {
  const t = await prisma.authTicket.findUnique({ where: { id } });
  if (!t || t.usedAt || t.expiresAt.getTime() < Date.now()) return null;
  await prisma.authTicket.update({ where: { id }, data: { usedAt: new Date() } });
  return t.email;
}
```
- [ ] **Step 9: run both suites → PASS.**
- [ ] **Step 10: Commit** — `git commit -m "feat(auth): allowlist, audit log, single-use auth tickets"`

---

### Task 3: Auth.js 5 config + route handler

**Files:**
- Create: `src/auth.ts`, `src/app/api/admin/auth/[...nextauth]/route.ts`
- Modify: `.env` (dev `AUTH_SECRET`, `AUTH_URL`, `ADMIN_EMAILS`), `.env.example`

**Interfaces produced:** `export const { handlers, signIn, signOut, auth } = NextAuth(config)`.

- [ ] **Step 1: dev env**

Append to `.env`:
```
AUTH_SECRET="dev-only-secret-change-in-prod-0123456789abcdef"
AUTH_URL="http://localhost:3000"
ADMIN_EMAILS="you@example.com"
```
(Use the founder's real email for `ADMIN_EMAILS` locally.) Append the same keys (placeholder values) to `.env.example`.

- [ ] **Step 2: `src/auth.ts`**
```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/app/lib/db';
import { redeemTicket } from '@/app/lib/authTicket';
import { isAdminEmail } from '@/app/lib/adminAuth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  basePath: '/api/admin/auth',
  session: { strategy: 'database', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers: [
    Credentials({
      id: 'ticket',
      credentials: { ticket: {} },
      async authorize(creds) {
        const ticket = typeof creds?.ticket === 'string' ? creds.ticket : '';
        if (!ticket) return null;
        const email = await redeemTicket(ticket);
        if (!email || !isAdminEmail(email)) return null;
        const user = await prisma.user.upsert({
          where: { email }, update: {}, create: { email, role: 'ADMIN' },
        });
        return { id: user.id, email: user.email };
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
});
```
> NOTE: Credentials provider + `database` session strategy: Auth.js normally forces JWT for Credentials. To force DB sessions we redeem the ticket ourselves and create the session via the adapter in a `signIn` event if needed. If `strategy:'database'` rejects Credentials at runtime, fall back to `strategy:'jwt'` with `maxAge` unchanged and add a `jwt`/`session` callback that carries `email` + re-checks `isAdminEmail` on every request (documented in Step 4 verification). Decide based on the Step 5 smoke test.

- [ ] **Step 3: route handler `src/app/api/admin/auth/[...nextauth]/route.ts`**
```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 4: session guard `src/app/lib/adminSession.ts`**
```ts
import { auth } from '@/auth';
import { isAdminEmail } from './adminAuth';

export async function getAdmin(): Promise<{ email: string } | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAdminEmail(email)) return null;
  return { email };
}
```

- [ ] **Step 5: Smoke test the config compiles + session strategy**

Run: `npm run type-check` (expect 0). Then a runtime smoke in Task 7's browser test confirms `signIn`. If `type-check` or the dev server logs a Credentials+database error, switch `strategy` to `'jwt'` and add:
```ts
callbacks: {
  async jwt({ token, user }) { if (user?.email) token.email = user.email; return token; },
  async session({ session, token }) { if (token.email) session.user = { ...session.user, email: String(token.email) }; return session; },
},
```
- [ ] **Step 6: Commit** — `git commit -m "feat(auth): Auth.js 5 config (ticket credentials) + admin session guard"`

---

### Task 4: Login orchestration routes

**Files:** Create `src/app/api/admin/login/{start,verify,verify-totp,enroll-totp}/route.ts`

**Shared behavior:** `export const runtime = 'nodejs'`; Zod-parse the body; rate-limit by IP (`checkRateLimit(\`adminlogin:${ip}\`, {maxRequests:10, windowMs:5*60_000})`); `writeAudit` each outcome; JSON responses; never reveal allowlist membership on `/start`.

- [ ] **Step 1: `/start`** — body `{ email: string, method: 'magic_link'|'otp' }`.
  - `isAdminEmail(email)` false → `writeAudit('login.start.blocked', {ip, meta:{email}})` and return `{ ok: true }` (no challenge). Enumeration-safe.
  - true → `authChallenge({ method, to: email, name: email, redirect: '${SITE_URL}/admin/login/callback' })`. Store `email` keyed by `challengeId` in an httpOnly cookie `adm_chal` = `${challengeId}:${email}` (signed via `AUTH_SECRET` HMAC) so later steps know the email without trusting the client. Return `{ ok: true, challengeId }`.
```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIP, checkRateLimit } from '@/app/utils/rateLimit';
import { isAdminEmail } from '@/app/lib/adminAuth';
import { authChallenge } from '@/app/lib/notify';
import { writeAudit } from '@/app/lib/audit';
import { SITE_URL } from '@/app/lib/email';
import { setChallengeCookie } from '@/app/lib/adminLoginCookie';

const Body = z.object({ email: z.string().email(), method: z.enum(['magic_link', 'otp']) });
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!checkRateLimit(`adminlogin:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 }).success) {
    return NextResponse.json({ ok: false, message: 'Too many attempts.' }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { email, method } = parsed.data;
  if (!isAdminEmail(email)) {
    await writeAudit('login.start.blocked', { ip, meta: { email } });
    return NextResponse.json({ ok: true });
  }
  const chal = await authChallenge({ method, to: email, name: email, redirect: `${SITE_URL}/admin/login/callback` });
  if (!chal) return NextResponse.json({ ok: false, message: 'Could not send code.' }, { status: 502 });
  await writeAudit('login.start', { actorEmail: email, ip });
  const res = NextResponse.json({ ok: true, challengeId: chal.challengeId });
  setChallengeCookie(res, chal.challengeId, email);
  return res;
}
```
- [ ] **Step 2: `src/app/lib/adminLoginCookie.ts`** — HMAC-signed cookie helpers.
```ts
import { createHmac } from 'crypto';
import { NextResponse, NextRequest } from 'next/server';

const NAME = 'adm_chal';
const sign = (v: string) => createHmac('sha256', process.env.AUTH_SECRET ?? '').update(v).digest('hex');

export function setChallengeCookie(res: NextResponse, challengeId: string, email: string) {
  const v = `${challengeId}:${email}`;
  res.cookies.set(NAME, `${v}.${sign(v)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60, path: '/',
  });
}
export function readChallengeCookie(req: NextRequest): { challengeId: string; email: string } | null {
  const raw = req.cookies.get(NAME)?.value; if (!raw) return null;
  const dot = raw.lastIndexOf('.'); if (dot < 0) return null;
  const v = raw.slice(0, dot); const mac = raw.slice(dot + 1);
  if (sign(v) !== mac) return null;
  const i = v.indexOf(':'); if (i < 0) return null;
  return { challengeId: v.slice(0, i), email: v.slice(i + 1) };
}
export function clearChallengeCookie(res: NextResponse) {
  res.cookies.set(NAME, '', { httpOnly: true, maxAge: 0, path: '/' });
}
```
- [ ] **Step 3: `/verify`** — body `{ code?: string, token?: string }` (email factor). Read email+challengeId from the signed cookie. `authVerify`. On fail → audit + 401. On success:
  - Load user; if `!user.totpEnrolled` → return `{ ok: true, needEnroll: true }`.
  - Else check trusted-device cookie via `trustCheck` → if trusted, `issueTicket(email)` → `{ ok:true, ticket }`.
  - Else `{ ok: true, needTotp: true }`.
  (Full code mirrors /start's imports; uses `readChallengeCookie`, `authVerify`, `trustCheck`, `issueTicket`, `prisma.user`.)
- [ ] **Step 4: `/enroll-totp`** — reads cookie; `totpEnroll(email, email)` + `recoveryGenerate(email)`; returns `{ ok:true, otpauthUri, recoveryCodes }`. (Does NOT set totpEnrolled yet — that happens after first successful `/verify-totp`.)
- [ ] **Step 5: `/verify-totp`** — body `{ code: string, remember?: boolean }`. Reads cookie. Try `totpVerify(email, code)`; if false, try `recoveryVerify(email, code)`. On success: set `user.totpEnrolled=true`; if `remember`, `trustCreate` + set signed trust cookie; `issueTicket(email)` → `{ ok:true, ticket }`; audit `login.mfa.success`. On fail → audit `login.mfa.fail` + 401.
- [ ] **Step 6: type-check + commit** — `npm run type-check` (0); `git commit -m "feat(auth): admin login orchestration routes (email factor + TOTP + tickets)"`

---

### Task 5: Route-protecting middleware

**Files:** Create `src/middleware.ts`

- [ ] **Step 1: middleware**
```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC = ['/admin/login'];
const PUBLIC_API = ['/api/admin/auth', '/api/admin/login'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin') && !PUBLIC.some((p) => pathname.startsWith(p));
  const isAdminApi = pathname.startsWith('/api/admin') && !PUBLIC_API.some((p) => pathname.startsWith(p));
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const session = await auth();
  if (session?.user?.email) return NextResponse.next();
  if (isAdminApi) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = '/admin/login';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
```
> The allowlist re-check happens in `getAdmin()` (server) and `authorize()` (login); middleware only checks session presence to stay Edge-fast. If Auth.js `auth()` can't run in Edge middleware with the Prisma adapter, set `export const runtime = 'nodejs'` is not available for middleware — instead the middleware only reads the session cookie's presence; full validation stays in `getAdmin()` server-side. Verify in Task 7.

- [ ] **Step 2: type-check + commit** — `git commit -m "feat(auth): middleware guarding /admin and /api/admin"`

---

### Task 6: Login UI + gated admin placeholder

**Files:** Create `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/app/admin/login/callback/page.tsx`

- [ ] **Step 1: `admin/layout.tsx`** (server) — `const admin = await getAdmin(); if (!admin) redirect('/admin/login')` — but exclude the login route (login page is outside this layout since it must be reachable unauthenticated; place login under its own segment `src/app/admin/login` which this layout also wraps → so instead guard in `admin/page.tsx` and other real pages, and let `admin/login` render without the guard by checking pathname is not needed — simplest: DO NOT guard in layout; guard each real page via `getAdmin()`). Implement `admin/layout.tsx` as a plain server layout (no guard); guard `admin/page.tsx`.
- [ ] **Step 2: `admin/page.tsx`** (server, gated)
```tsx
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
export default async function AdminHome() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return (
    <main style={{ padding: 40 }}>
      <h1>Admin</h1>
      <p>Signed in as {admin.email}. (Dashboard arrives in Part 3.)</p>
    </main>
  );
}
```
- [ ] **Step 3: `admin/login/actions.ts`** (server action to mint the session)
```ts
'use server';
import { signIn } from '@/auth';
export async function signInWithTicket(ticket: string) {
  await signIn('ticket', { ticket, redirectTo: '/admin' });
}
```
- [ ] **Step 4: `admin/login/page.tsx`** (client) — a small state machine: `email → (magic|otp) → [enroll?] → totp → signInWithTicket`. Calls `/api/admin/login/*` with `fetch`, shows inline status, renders the QR from `otpauthUri` (use a data-URL QR via a tiny inline generator or display the `otpauthUri` as text + a link). For dev, the code is in the server log. On receiving a `ticket`, calls the `signInWithTicket` server action. Full component provided in execution.
- [ ] **Step 5: `admin/login/callback/page.tsx`** — reads `?cid=&token=` from the magic-link email, POSTs `/api/admin/login/verify` with the token, then continues the same state machine (TOTP or ticket).
- [ ] **Step 6: type-check + lint + build → 0. Commit** — `git commit -m "feat(admin): login UI + gated admin placeholder"`

---

### Task 7: Verification (unit + visible browser login)

- [ ] **Step 1: `npm test`** — all suites green.
- [ ] **Step 2: `npm run build && npm run lint && npm run type-check`** — all clean.
- [ ] **Step 3: Visible browser test (founder watching, ask first):** with notify unconfigured (dev fallback), `npm run dev`; go to `/admin` → redirected to `/admin/login`; enter the founder's allowlisted email; read the dev OTP from the server log; complete email factor → TOTP enroll (dev accepts any 6 digits) → land on `/admin` showing "Signed in as …". Confirm a non-allowlisted email gets no code and cannot enter. Confirm `AuditLog` rows exist (`prisma studio`).
- [ ] **Step 4: Note go-live prerequisites** in the plan's closing: real `NOTIFY_API_KEY` (notify-svc tenant, Windows box) + Brevo domain + a strong prod `AUTH_SECRET` + real `ADMIN_EMAILS` set on Railway; the dev fallback auto-disables in production.

---

## Self-Review

- **Spec coverage:** allowlist (T2), passwordless magic+OTP (T1,T4), TOTP+recovery+trusted-device (T1,T4), Auth.js 5 DB sessions (T3), separation `/api/admin/*` (T3,T5), audit log (T2,T4), middleware (T5), enumeration-safe (T4). ✅
- **Placeholder scan:** Task 4 Steps 3–5 and Task 6 Step 4/5 describe behavior with partial code and defer full component bodies to execution — acceptable for UI/glue where the interfaces are pinned, but tighten during execution (no vague error handling). The crypto/cookie/route/auth-core code is complete. ⚠️ (execution must fill the two UI components + three verify routes fully).
- **Type consistency:** `authChallenge→{challengeId}`, `authVerify→{ok}`, `issueTicket→string`, `redeemTicket→string|null`, `getAdmin→{email}|null`, cookie helpers — names/signatures consistent across tasks. ✅
- **Known runtime risk:** Auth.js Credentials + `database` sessions, and `auth()` in Edge middleware — both have a documented JWT/node fallback (T3 Step 5, T5 Step 1) to resolve during execution.
