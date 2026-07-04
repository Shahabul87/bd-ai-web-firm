# Client Portal (Phase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An invite-gated, login-protected client portal (separate auth stack) where clients see their projects/status/milestones/client-visible updates and message the firm per project.

**Architecture:** A second, fully isolated Auth.js v5 instance (`authPortal`, `portal.session-token`, `PORTAL_AUTH_SECRET`, basePath `/api/user/auth`) using the same JWT + Credentials(ticket) pattern as admin. Portal identity = the existing `Client` (invite-gated by `portalEnabled`); every portal query is scoped by the session's `clientId`.

**Tech Stack:** Next 15 App Router, Auth.js v5 (2nd instance), Prisma 6 + Postgres, notify-svc (passwordless), jose (via Auth.js), Zod, Jest.

## Global Constraints

- **HARD RULE — total admin/portal isolation:** distinct cookie name (`portal.session-token`), distinct secret (`PORTAL_AUTH_SECRET`), distinct routes (`/api/user/auth`, `/portal`), scoped tickets. A portal session must never satisfy `getAdmin()` and an admin session never `getPortalClient()`.
- Portal data access **always scoped by session `clientId`**; loading a project/message whose `clientId` ≠ session → not-found.
- Passwordless (notify-svc OTP/magic-link), **no mandatory MFA**. Enumeration-safe login.
- TS strict, no `any`. Zod on all inputs. Invites + messages audited. notify-svc for all email. No secrets logged.
- Additive migrations only. Middleware stays admin-only; portal guarded per-page via `getPortalClient()`.
- `PORTAL_AUTH_SECRET` must be set (local `.env` + Railway) before portal login works.
- Branch `feat/client-portal` (already created). Dev DB docker on 5438.

## File Structure

```
prisma/schema.prisma                       # AuthTicket.scope, Client.portalEnabled, Message + enum
src/authPortal.config.ts                   # edge-safe portal Auth.js config (new)
src/authPortal.ts                          # portal NextAuth instance (new)
src/types/next-auth.d.ts                   # add clientId to Session/JWT (new)
src/app/api/user/auth/[...nextauth]/route.ts  # portal auth handlers (new)
src/app/lib/authTicket.ts                  # + scope param
src/app/lib/portalSession.ts               # getPortalClient() (new)
src/app/lib/portalLoginCookie.ts           # signed portal_login challenge cookie (new)
src/app/lib/portal.ts                      # portal data layer (client's projects, scoped) (new)
src/app/lib/messages.ts                    # message thread data layer (new)
src/app/api/user/login/start/route.ts      # request code/link (new)
src/app/api/user/login/verify/route.ts     # verify OTP → session (new)
src/app/portal/auth/callback/route.ts      # magic-link callback (new)
src/app/portal/layout.tsx                  # portal chrome wrapper (new)
src/app/portal/PortalHeader.tsx            # portal header (new)
src/app/portal/login/page.tsx + PortalLoginFlow.tsx  # login UI (new)
src/app/portal/page.tsx                    # dashboard (new)
src/app/portal/projects/[id]/page.tsx      # project + thread (new)
src/app/portal/projects/[id]/MessageComposer.tsx  # client composer (new)
src/app/lib/clients.ts                     # + inviteClientToPortal()
src/app/admin/actions.ts                   # + invite + admin-reply actions
src/app/admin/projects/[id]/page.tsx       # + admin thread panel
src/app/admin/projects/AdminThread.tsx     # admin reply composer (new)
src/app/admin/clients/[id]/page.tsx + ClientControls.tsx  # + Invite to portal
src/app/components/MarketingChrome.tsx     # also suppress on /portal
```

---

### Task 1: Schema (ticket scope, portal flag, messages)

**Files:** Modify `prisma/schema.prisma`; migrate.

**Interfaces produced:** `AuthTicket.scope`, `Client.portalEnabled`, `Message` model, `MessageSender` enum.

- [ ] **Step 1: Edit `prisma/schema.prisma`.** Add to `AuthTicket` model: `scope String @default("admin")`. Add to `Client` model: `portalEnabled Boolean @default(false)` and `messages` is NOT on client; add relation on Project: `messages Message[]`. Append:
```prisma
enum MessageSender { ADMIN CLIENT }

model Message {
  id          String        @id @default(cuid())
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  senderType  MessageSender
  senderEmail String
  body        String        @db.Text
  readAt      DateTime?
  createdAt   DateTime      @default(now())
  @@index([projectId])
}
```
Add `messages Message[]` to the `Project` model's relation list.
- [ ] **Step 2: Migrate + generate.** Run: `docker compose -f docker-compose.dev.yml up -d && npm run db:migrate -- --name portal_and_messages && npm run db:generate`
Expected: migration applied, "in sync".
- [ ] **Step 3: type-check.** Run: `npm run type-check` → exit 0.
- [ ] **Step 4: Commit.** `git add prisma package-lock.json && git commit -m "feat(db): AuthTicket.scope, Client.portalEnabled, Message model"`

---

### Task 2: Ticket scoping

**Files:** Modify `src/app/lib/authTicket.ts`; Test `src/app/lib/__tests__/authTicket.test.ts`

**Interfaces produced:**
- `issueTicket(email: string, scope?: 'admin' | 'portal'): Promise<string>` (default `'admin'`)
- `redeemTicket(id: string, scope?: 'admin' | 'portal'): Promise<string | null>` (default `'admin'`)

- [ ] **Step 1: Failing test** (`authTicket.test.ts`, mock `../db`):
```ts
jest.mock('../db', () => ({ prisma: { authTicket: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } }));
import { prisma } from '../db';
import { issueTicket, redeemTicket } from '../authTicket';
const t = prisma.authTicket as unknown as { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
describe('authTicket scope', () => {
  beforeEach(() => jest.clearAllMocks());
  it('issues with scope', async () => {
    t.create.mockResolvedValue({ id: 'tk1' });
    await issueTicket('a@b.com', 'portal');
    expect(t.create.mock.calls[0][0].data).toEqual(expect.objectContaining({ email: 'a@b.com', scope: 'portal' }));
  });
  it('redeem rejects wrong scope', async () => {
    t.findUnique.mockResolvedValue({ id: 'tk1', email: 'a@b.com', usedAt: null, expiresAt: new Date(Date.now() + 60000), scope: 'admin' });
    const r = await redeemTicket('tk1', 'portal');
    expect(r).toBeNull();
    expect(t.update).not.toHaveBeenCalled();
  });
  it('redeem accepts matching scope + burns', async () => {
    t.findUnique.mockResolvedValue({ id: 'tk1', email: 'a@b.com', usedAt: null, expiresAt: new Date(Date.now() + 60000), scope: 'portal' });
    t.update.mockResolvedValue({});
    const r = await redeemTicket('tk1', 'portal');
    expect(r).toBe('a@b.com');
    expect(t.update).toHaveBeenCalled();
  });
});
```
- [ ] **Step 2: Run → FAIL** (`npm test -- authTicket.test`).
- [ ] **Step 3: Edit `authTicket.ts`:**
```ts
import { prisma } from './db';

export async function issueTicket(email: string, scope: 'admin' | 'portal' = 'admin'): Promise<string> {
  const t = await prisma.authTicket.create({
    data: { email, scope, expiresAt: new Date(Date.now() + 2 * 60_000) },
    select: { id: true },
  });
  return t.id;
}

export async function redeemTicket(id: string, scope: 'admin' | 'portal' = 'admin'): Promise<string | null> {
  const t = await prisma.authTicket.findUnique({ where: { id } });
  if (!t || t.usedAt || t.expiresAt.getTime() < Date.now() || t.scope !== scope) return null;
  await prisma.authTicket.update({ where: { id }, data: { usedAt: new Date() } });
  return t.email;
}
```
- [ ] **Step 4: Run → PASS. Commit** `git commit -m "feat(auth): scope single-use tickets (admin|portal)"`

---

### Task 3: Portal auth instance + session guard

**Files:** Create `src/authPortal.config.ts`, `src/authPortal.ts`, `src/types/next-auth.d.ts`, `src/app/api/user/auth/[...nextauth]/route.ts`, `src/app/lib/portalSession.ts`; Test `src/app/lib/__tests__/portalSession.test.ts`

**Interfaces produced:**
- `authPortal` (Auth.js `auth()` for portal), `handlers`, `signIn`, `signOut` from `authPortal.ts`
- `getPortalClient(): Promise<{ clientId: string; email: string; name: string } | null>`

- [ ] **Step 1: `src/types/next-auth.d.ts`:**
```ts
import 'next-auth';
import 'next-auth/jwt';
declare module 'next-auth' {
  interface Session { clientId?: string }
}
declare module 'next-auth/jwt' {
  interface JWT { clientId?: string }
}
```
- [ ] **Step 2: `src/authPortal.config.ts`:**
```ts
import type { NextAuthConfig } from 'next-auth';

/** Edge-safe portal config — fully isolated from admin (distinct cookie + secret). */
export default {
  basePath: '/api/user/auth',
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.PORTAL_AUTH_SECRET,
  trustHost: true,
  providers: [],
  cookies: { sessionToken: { name: 'portal.session-token' } },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.clientId = user.id;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.clientId) session.clientId = String(token.clientId);
      if (token.email && session.user) session.user.email = String(token.email);
      return session;
    },
  },
  pages: { signIn: '/portal/login' },
} satisfies NextAuthConfig;
```
- [ ] **Step 3: `src/authPortal.ts`:**
```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authPortalConfig from './authPortal.config';
import { prisma } from '@/app/lib/db';
import { redeemTicket } from '@/app/lib/authTicket';

/** Portal auth (Node runtime). Trusts ONLY a freshly-redeemed 'portal'-scoped
 *  ticket; identity is an ACTIVE, portalEnabled Client resolved by email. */
export const { handlers, signIn, signOut, auth: authPortal } = NextAuth({
  ...authPortalConfig,
  providers: [
    Credentials({
      id: 'ticket',
      name: 'ticket',
      credentials: { ticket: {} },
      async authorize(creds) {
        const ticket = typeof creds?.ticket === 'string' ? creds.ticket : '';
        if (!ticket) return null;
        const email = await redeemTicket(ticket, 'portal');
        if (!email) return null;
        const client = await prisma.client.findFirst({
          where: { email, status: 'ACTIVE', portalEnabled: true },
          orderBy: { createdAt: 'asc' },
          select: { id: true, email: true },
        });
        if (!client) return null;
        return { id: client.id, email: client.email };
      },
    }),
  ],
});
```
- [ ] **Step 4: `src/app/api/user/auth/[...nextauth]/route.ts`:**
```ts
import { handlers } from '@/authPortal';
export const { GET, POST } = handlers;
```
- [ ] **Step 5: `src/app/lib/portalSession.ts`:**
```ts
import { authPortal } from '@/authPortal';
import { prisma } from './db';

/** Portal gate. Re-checks ACTIVE + portalEnabled on every call (so disabling a
 *  client or archiving revokes access immediately). Scoped to one client. */
export async function getPortalClient(): Promise<{ clientId: string; email: string; name: string } | null> {
  const session = await authPortal();
  const clientId = session?.clientId;
  if (!clientId) return null;
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, email: true, name: true, status: true, portalEnabled: true },
  });
  if (!c || c.status !== 'ACTIVE' || !c.portalEnabled) return null;
  return { clientId: c.id, email: c.email, name: c.name };
}
```
- [ ] **Step 6: Failing test** `portalSession.test.ts` (mock `@/authPortal` + `../db`):
```ts
jest.mock('@/authPortal', () => ({ authPortal: jest.fn() }));
jest.mock('../db', () => ({ prisma: { client: { findUnique: jest.fn() } } }));
import { authPortal } from '@/authPortal';
import { prisma } from '../db';
import { getPortalClient } from '../portalSession';
const authMock = authPortal as unknown as jest.Mock;
const find = (prisma.client as unknown as { findUnique: jest.Mock }).findUnique;
describe('getPortalClient', () => {
  beforeEach(() => jest.clearAllMocks());
  it('null when no session clientId', async () => { authMock.mockResolvedValue(null); expect(await getPortalClient()).toBeNull(); });
  it('null when client disabled', async () => {
    authMock.mockResolvedValue({ clientId: 'c1' });
    find.mockResolvedValue({ id: 'c1', email: 'a@b.com', name: 'A', status: 'ACTIVE', portalEnabled: false });
    expect(await getPortalClient()).toBeNull();
  });
  it('returns client when active + enabled', async () => {
    authMock.mockResolvedValue({ clientId: 'c1' });
    find.mockResolvedValue({ id: 'c1', email: 'a@b.com', name: 'A', status: 'ACTIVE', portalEnabled: true });
    expect(await getPortalClient()).toEqual({ clientId: 'c1', email: 'a@b.com', name: 'A' });
  });
});
```
- [ ] **Step 7: Run → PASS** (`npm test -- portalSession.test`) + `npm run type-check`.
- [ ] **Step 8: Commit** `git commit -m "feat(portal): isolated portal Auth.js instance + getPortalClient"`

---

### Task 4: Portal login routes

**Files:** Create `src/app/lib/portalLoginCookie.ts`, `src/app/api/user/login/start/route.ts`, `src/app/api/user/login/verify/route.ts`, `src/app/portal/auth/callback/route.ts`; Test `src/app/lib/__tests__/portalLogin.test.ts`

**Interfaces consumed:** `authChallenge`, `authVerify` from `lib/notify.ts`; `issueTicket(email,'portal')`; `signIn` from `@/authPortal`.
**Interfaces produced:** `findPortalClientByEmail(email): Promise<{ id: string } | null>` (exported helper in `lib/portal.ts`, Task 6 — define here if built first: put it in `portalLoginCookie.ts`? No — put the gate query inline in the route).

- [ ] **Step 1: `portalLoginCookie.ts`** — HMAC-signed cookie carrying `{ email, challengeId }`, keyed by `PORTAL_AUTH_SECRET`, mirroring `adminLoginCookie.ts`. Read `adminLoginCookie.ts` first and replicate with cookie name `portal_login` and `PORTAL_AUTH_SECRET`. Functions: `setPortalChallenge(email, challengeId)`, `readPortalChallenge(): { email, challengeId } | null`, `clearPortalChallenge()`.
- [ ] **Step 2: `/api/user/login/start/route.ts`** — Zod `{ email, method: 'otp'|'magic_link' }`. Look up `prisma.client.findFirst({ where: { email, status:'ACTIVE', portalEnabled:true } })`. **Always** return `{ ok: true }` (enumeration-safe). Only if found: `authChallenge({ method, to: email, app_name: 'CraftsAI', name: client.name, redirect: SITE_URL + '/portal/auth/callback' })`, then `setPortalChallenge(email, challengeId)`.
- [ ] **Step 3: `/api/user/login/verify/route.ts`** — Zod `{ code }`. Read `portal_login` cookie; if none → 400. `authVerify({ challenge_id, code })`; if ok → `issueTicket(email,'portal')`, `clearPortalChallenge()`, return `{ ok: true, ticket }`. The client page then calls `signIn('ticket', { ticket })`.
- [ ] **Step 4: `/portal/auth/callback/route.ts`** — magic-link GET `?cid=&token=`: `authVerify({ challenge_id: cid, token })`; if ok → resolve email (from the `portal_login` cookie), `issueTicket(email,'portal')`, then redirect to a small client page that completes `signIn('ticket',{ticket})`, or set the session server-side via `signIn`. (Use `signIn('ticket', { ticket, redirectTo: '/portal' })` from `@/authPortal`.)
- [ ] **Step 5: Failing test** `portalLogin.test.ts` — assert the **invite gate**: `login/start` for a client with `portalEnabled=false` does NOT call `authChallenge`. Mock `../notify`, `../db`, `../portalLoginCookie`.
```ts
jest.mock('../notify', () => ({ authChallenge: jest.fn(), authVerify: jest.fn() }));
jest.mock('../db', () => ({ prisma: { client: { findFirst: jest.fn() } } }));
jest.mock('../portalLoginCookie', () => ({ setPortalChallenge: jest.fn() }));
// import the extracted start handler logic (factor the gate into a testable fn `startPortalLogin(email, method)` in portalLoginCookie.ts or a lib/portalLogin.ts)
```
> **Implementation note:** factor the start logic into `lib/portalLogin.ts` `startPortalLogin(email, method): Promise<void>` so it's unit-testable; the route calls it. Test: disabled client → `authChallenge` not called; enabled client → called once. (Route stays a thin wrapper.)
- [ ] **Step 6: Run → PASS + type-check. Commit** `git commit -m "feat(portal): passwordless login routes (invite-gated, enumeration-safe)"`

---

### Task 5: Portal chrome + login page

**Files:** Create `src/app/portal/layout.tsx`, `src/app/portal/PortalHeader.tsx`, `src/app/portal/login/page.tsx`, `src/app/portal/login/PortalLoginFlow.tsx`; Modify `src/app/components/MarketingChrome.tsx`.

- [ ] **Step 1: `MarketingChrome.tsx`** — change the suppression check to also cover portal: `if (pathname.startsWith('/admin') || pathname.startsWith('/portal')) return null;`.
- [ ] **Step 2: `PortalHeader.tsx`** (server or client) — logo "CRAFTS.AI▮ CLIENT", the client name, and a Sign out button posting to portal `signOut` (a small client component calling `signOut()` from `@/authPortal` via a server action, or a form to `/api/user/auth/signout`). Mirror `AdminNav`'s sign-out approach.
- [ ] **Step 3: `portal/layout.tsx`** — server layout: renders `{children}` inside portal chrome. (Does NOT itself gate — each page calls `getPortalClient()`; the login page must render without a session.)
- [ ] **Step 4: `login/page.tsx` + `PortalLoginFlow.tsx`** — mirror admin `LoginFlow` but simpler (no TOTP): email → choose magic link or code → enter code → on verify success call `signIn('ticket',{ticket, redirectTo:'/portal'})`. Portal-branded centered card, design tokens.
- [ ] **Step 5: build + type-check + lint. Commit** `git commit -m "feat(portal): chrome + passwordless login page"`

---

### Task 6: Portal dashboard + project page (scoped)

**Files:** Create `src/app/lib/portal.ts`, `src/app/portal/page.tsx`, `src/app/portal/projects/[id]/page.tsx`; Test `src/app/lib/__tests__/portal.test.ts`

**Interfaces produced:**
- `listClientProjects(clientId): Promise<{ id; title; status; done: number; total: number }[]>`
- `getClientProject(clientId, projectId): Promise<(Project & { milestones; updates(CLIENT only); messages }) | null>` — **returns null if project.clientId ≠ clientId**

- [ ] **Step 1: Failing test** `portal.test.ts` — `getClientProject` returns null when the project belongs to another client (scoping). Mock `../db`:
```ts
jest.mock('../db', () => ({ prisma: { project: { findFirst: jest.fn() } } }));
import { prisma } from '../db';
import { getClientProject } from '../portal';
const ff = (prisma.project as unknown as { findFirst: jest.Mock }).findFirst;
it('scopes by clientId (null for other client)', async () => {
  ff.mockResolvedValue(null); // findFirst with where clientId won't match
  expect(await getClientProject('c1', 'pX')).toBeNull();
  expect(ff.mock.calls[0][0].where).toEqual(expect.objectContaining({ id: 'pX', clientId: 'c1' }));
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `portal.ts`:**
```ts
import { prisma } from './db';

export async function listClientProjects(clientId: string) {
  const rows = await prisma.project.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, _count: { select: { milestones: true } },
      milestones: { where: { status: 'DONE' }, select: { id: true } } },
  });
  return rows.map((r) => ({ id: r.id, title: r.title, status: r.status, done: r.milestones.length, total: r._count.milestones }));
}

export async function getClientProject(clientId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, clientId },   // <-- scoping: cannot load another client's project
    include: {
      milestones: { orderBy: { order: 'asc' } },
      updates: { where: { visibility: 'CLIENT' }, orderBy: { createdAt: 'desc' } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}
```
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: `portal/page.tsx`** — `const c = await getPortalClient(); if (!c) redirect('/portal/login');` → `listClientProjects(c.clientId)` → cards (title, `ProjectStatusBadge`, `done/total` progress). Empty state.
- [ ] **Step 6: `portal/projects/[id]/page.tsx`** — `getPortalClient()` gate → `getClientProject(c.clientId, id)`; null → `notFound()`. Render status, milestones (read-only), client-visible updates timeline, and the message thread + `<MessageComposer projectId=... />` (Task 7).
- [ ] **Step 7: build + type-check. Commit** `git commit -m "feat(portal): dashboard + scoped project view"`

---

### Task 7: Messaging

**Files:** Create `src/app/lib/messages.ts`, `src/app/portal/projects/[id]/MessageComposer.tsx`, `src/app/admin/projects/AdminThread.tsx`; Modify `src/app/admin/actions.ts` (+ portal action file), `src/app/admin/projects/[id]/page.tsx`; Test `src/app/lib/__tests__/messages.test.ts`

**Interfaces produced:**
- `listMessages(projectId): Promise<Message[]>`
- `addMessage(projectId, senderType: 'ADMIN'|'CLIENT', senderEmail, body): Promise<void>`
- Portal action `sendClientMessage(projectId, body)` (gated by `getPortalClient`, asserts project ownership)
- Admin action `sendAdminMessage(projectId, body)` (gated by `getAdmin`)

- [ ] **Step 1: Failing test** `messages.test.ts` — `addMessage` writes with correct sender typing; mock `../db` + `../notify`:
```ts
jest.mock('../db', () => ({ prisma: { message: { create: jest.fn() } } }));
import { prisma } from '../db';
import { addMessage } from '../messages';
it('creates message with sender type', async () => {
  (prisma.message as unknown as { create: jest.Mock }).create.mockResolvedValue({});
  await addMessage('p1', 'CLIENT', 'a@b.com', 'hi');
  expect(prisma.message.create).toHaveBeenCalledWith({ data: { projectId: 'p1', senderType: 'CLIENT', senderEmail: 'a@b.com', body: 'hi' } });
});
```
- [ ] **Step 2: Run → FAIL. Implement `messages.ts`:**
```ts
import { prisma } from './db';
export async function listMessages(projectId: string) {
  return prisma.message.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } });
}
export async function addMessage(projectId: string, senderType: 'ADMIN' | 'CLIENT', senderEmail: string, body: string): Promise<void> {
  await prisma.message.create({ data: { projectId, senderType, senderEmail, body } });
}
```
- [ ] **Step 3: Run → PASS.**
- [ ] **Step 4: Portal action** — create `src/app/portal/actions.ts`:
```ts
'use server';
import { revalidatePath } from 'next/cache';
import { getPortalClient } from '@/app/lib/portalSession';
import { getClientProject } from '@/app/lib/portal';
import { addMessage } from '@/app/lib/messages';
import { sendAnnouncement } from '@/app/lib/notify';
import { CONTACT_EMAIL } from '@/app/lib/email';
export async function sendClientMessage(projectId: string, body: string): Promise<void> {
  const c = await getPortalClient();
  if (!c) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty');
  const project = await getClientProject(c.clientId, projectId);   // ownership assert
  if (!project) throw new Error('not found');
  await addMessage(projectId, 'CLIENT', c.email, body.trim());
  void sendAnnouncement(CONTACT_EMAIL, `New portal message — ${project.title}`, `${c.name} sent a message on "${project.title}".`);
  revalidatePath(`/portal/projects/${projectId}`);
}
```
- [ ] **Step 5: Admin reply action** in `src/app/admin/actions.ts` (append):
```ts
export async function sendAdminMessage(projectId: string, body: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty');
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true, client: { select: { email: true } } } });
  if (!project) throw new Error('not found');
  await addMessage(projectId, 'ADMIN', admin.email, body.trim());
  void sendAnnouncement(project.client.email, `Reply from CraftsAI — ${project.title}`, `You have a new message on "${project.title}". Sign in to your portal to view it.`);
  revalidatePath(`/admin/projects/${projectId}`);
}
```
> Add imports to `actions.ts`: `prisma` from `@/app/lib/db`, `addMessage` from `@/app/lib/messages`, `sendAnnouncement` from `@/app/lib/notify`.
- [ ] **Step 6: `MessageComposer.tsx`** (portal, client) — textarea + send → `sendClientMessage`. `AdminThread.tsx` (admin, client) — thread list + textarea → `sendAdminMessage`. Add `AdminThread` + message list to `admin/projects/[id]/page.tsx` (fetch messages via the already-included `getProject` — extend `getProject` include to add `messages: { orderBy: { createdAt: 'asc' } }`).
- [ ] **Step 7: build + type-check + lint. Commit** `git commit -m "feat(portal): per-project message threads + notifications"`

---

### Task 8: Invite to portal

**Files:** Modify `src/app/lib/clients.ts`, `src/app/admin/actions.ts`, `src/app/admin/clients/[id]/page.tsx`, `src/app/admin/clients/ClientControls.tsx`; Test `src/app/lib/__tests__/invite.test.ts`

**Interfaces produced:** `inviteClientToPortal(clientId, actorEmail): Promise<{ ok: true } | { error: string }>`

- [ ] **Step 1: Failing test** `invite.test.ts` — sets `portalEnabled=true`, sends email, audits. Mock `../db`, `../notify`, `../audit`, `../email`:
```ts
jest.mock('../db', () => ({ prisma: { client: { update: jest.fn(), findUnique: jest.fn() } } }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org' }));
import { prisma } from '../db';
import { inviteClientToPortal } from '../clients';
import { sendAnnouncement } from '../notify';
it('enables portal + emails + audits', async () => {
  (prisma.client as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ id: 'c1', name: 'A', email: 'a@b.com' });
  (prisma.client as unknown as { update: jest.Mock }).update.mockResolvedValue({});
  const r = await inviteClientToPortal('c1', 'admin@x.com');
  expect(r).toEqual({ ok: true });
  expect(prisma.client.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { portalEnabled: true } });
  expect(sendAnnouncement).toHaveBeenCalled();
});
```
- [ ] **Step 2: Run → FAIL. Implement in `clients.ts`:**
```ts
import { sendAnnouncement } from './notify';
import { SITE_URL } from './email';
// ...append:
export async function inviteClientToPortal(clientId: string, actorEmail: string): Promise<{ ok: true } | { error: string }> {
  const c = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, name: true, email: true } });
  if (!c) return { error: 'Client not found.' };
  await prisma.client.update({ where: { id: clientId }, data: { portalEnabled: true } });
  await writeAudit('client.portal.invite', { actorEmail, meta: { clientId } });
  void sendAnnouncement(c.email, 'Your CraftsAI project portal is ready', `Hi ${c.name},\n\nYou can now track your project and message us at ${SITE_URL}/portal/login (sign in with this email address).\n\n— The CraftsAI Team`);
  return { ok: true };
}
```
- [ ] **Step 3: Run → PASS.**
- [ ] **Step 4: Admin action** `inviteToPortalAction(clientId)` in `actions.ts` (gated, calls `inviteClientToPortal`, throws on error, `revalidatePath`).
- [ ] **Step 5: UI** — in `ClientControls.tsx` add an "Invite to portal" button (or "Re-send invite" if already enabled) calling `inviteToPortalAction`; pass a `portalEnabled` prop from the client detail page.
- [ ] **Step 6: build + type-check + lint. Commit** `git commit -m "feat(admin): invite client to portal"`

---

### Task 9: Verification

- [ ] `npm test` (all green) + `npm run build && npm run lint && npm run type-check`.
- [ ] **Set `PORTAL_AUTH_SECRET`** locally (`.env`: `openssl rand -base64 32`) for the browser test.
- [ ] **Visible browser test (ask first):** admin logs in → opens a client → **Invite to portal** → sign out → `/portal/login` → client requests code → (dev OTP from log) → lands on `/portal` → opens their project (status/milestones/client-visible update visible; INTERNAL update NOT shown) → posts a message → sign out → admin logs in → `/admin/projects/[id]` shows the client message → admin replies → (optional) client sees reply. **Isolation checks:** while signed into the portal, navigating to `/admin` redirects to admin login (no access); a fresh `/portal` visit without portal session redirects to `/portal/login`.
- [ ] Deploy: **set `PORTAL_AUTH_SECRET` on Railway** (bd-ai-web-firm), migrate prod (additive) via CLI, merge `feat/client-portal` → main, confirm deploy SUCCESS, prod smoke (portal login page renders; `/portal` redirects to login).

## Self-Review

**Spec coverage:** §3 isolation → T2 (scope), T3 (instance/cookie/secret/guard); §4 auth stack → T3; §5 data model → T1; §6 flow → T4 (login) + T8 (invite); §7 UI → T5/T6; §8 messaging → T7; §9 security/testing → T2/T3/T6/T7 unit + T9 browser; §10 rollout → T1/T9. ✅
**Placeholders:** T5 (chrome/login UI) + parts of T6/T7 UI defer JSX to execution with interfaces + patterns pinned (mirror admin `LoginFlow`/`AdminNav`); all auth/data/action code complete. `portalLoginCookie.ts` says "mirror adminLoginCookie.ts" — read that file at execution and replicate with the portal cookie name + `PORTAL_AUTH_SECRET`. ⚠️ acceptable (pattern file exists in-repo).
**Type consistency:** `issueTicket/redeemTicket(email,scope)`, `getPortalClient→{clientId,email,name}`, `listClientProjects/getClientProject(clientId,…)`, `listMessages/addMessage`, `inviteClientToPortal→{ok}|{error}`, actions `sendClientMessage/sendAdminMessage/inviteToPortalAction` — consistent across tasks + matched to spec. ✅
