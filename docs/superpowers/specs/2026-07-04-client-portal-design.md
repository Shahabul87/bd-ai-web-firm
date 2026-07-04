# Design Spec — Phase 3: Client Portal + Client Login

- **Date:** 2026-07-04
- **Status:** Approved (design), pending spec review
- **Builds on:** Phase 1 (admin auth, notify-svc, audit) + Phase 2 (Client/Project/Milestone/ProjectUpdate).
- **Part of:** the Phase 2+ roadmap (`2026-07-04-phase2plus-roadmap.md`).

## 1. Context & Goal

Clients currently have no visibility into their work. Phase 3 gives each invited client a **login-gated portal** to see *their* projects — status, milestone progress, and the updates the admin marked **Client-visible** — plus a **per-project message thread** with the firm. The defining constraint: the client-auth stack is **completely separate** from admin auth (routes, cookie, secret, identity, guard).

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| Portal scope (v1) | Read-only project status/milestones/client-visible updates **+ per-project message thread** |
| Session mechanism | **Second Auth.js v5 instance** (isolated), JWT strategy, Credentials(ticket) |
| Access control | **Explicit invite** — `Client.portalEnabled` flag (default off); admin "Invite to portal" |
| Login friction | **Passwordless** (magic link **or** OTP via notify-svc), **no mandatory MFA**, remember-device |
| Portal identity | The **`Client`** record (single contact, v1) matched by email — no separate user table |
| Out of scope | Invoices (P4), push (P5), file sharing, multiple contacts, client TOTP |

## 3. Architecture & Isolation (the hard rule)

Two independent auth stacks, isolated **by construction**:

| Concern | Admin (exists) | Client portal (new) |
|---|---|---|
| App routes | `/admin/**` | `/portal/**` |
| Auth API basePath | `/api/admin/auth` | `/api/user/auth` |
| Login orchestration | `/api/admin/login/*` | `/api/user/login/*` |
| NextAuth instance | `src/auth.ts` | `src/authPortal.ts` (new) |
| Edge config | `src/auth.config.ts` | `src/authPortal.config.ts` (new) |
| Session cookie | `authjs.session-token` (default) | **`portal.session-token`** (explicit) |
| Signing secret | `AUTH_SECRET` | **`PORTAL_AUTH_SECRET`** (new, distinct) |
| Identity | `User` (allowlist) | `Client` (portalEnabled, by email) |
| Route guard | `middleware.ts` (edge) | per-page `getPortalClient()` in `/portal` |

**Isolation guarantees:**
- A portal JWT is signed with `PORTAL_AUTH_SECRET` and stored in `portal.session-token`; the admin instance only reads `authjs.session-token` signed with `AUTH_SECRET` → **cross-read impossible**. Same in reverse.
- `middleware.ts` stays **admin-only** (its matcher already targets `/admin`). The portal is guarded in-server (below), so the portal Auth.js instance never enters the edge bundle.
- All portal data access is **scoped by the session `clientId`** — a client can only ever load their own rows.

## 4. Auth stack details

- **`authPortal.config.ts`** (edge-safe): `basePath:'/api/user/auth'`, `providers:[]`, `session:{strategy:'jwt'}`, `secret: process.env.PORTAL_AUTH_SECRET`, `cookies.sessionToken.name:'portal.session-token'`, callbacks: `jwt` copies `clientId`+`email` into the token; `session` exposes them.
- **`authPortal.ts`**: imports the config, adds `Credentials` provider whose `authorize(ticket)` calls `redeemTicket(ticket,'portal')`; on success returns `{ id: clientId, email }`. Exports `handlers`, `auth` (as `authPortal`), `signIn`, `signOut`. **No `prisma.user.upsert`** — identity is the existing Client.
- **Ticket scoping:** `AuthTicket` gains a `scope String @default("admin")`. `issueTicket(email, scope)` and `redeemTicket(token, scope)` both enforce scope, so an admin ticket can never mint a portal session or vice-versa.
- **`portalLoginCookie.ts`**: HMAC-signed challenge cookie (`portal_login`) carrying the pending email + notify challenge id across the login steps (mirrors `adminLoginCookie.ts`, different cookie name + `PORTAL_AUTH_SECRET`).
- **`getPortalClient()`** (`lib/portalSession.ts`): `const s = await authPortal();` → if no `clientId`, return null; else load the Client (must still be `ACTIVE` + `portalEnabled`) and return `{ clientId, email, name }` or null. Every portal page/route calls it (defense in depth).
- **Route handler:** `src/app/api/user/auth/[...nextauth]/route.ts` re-exports `handlers`.

## 5. Data model additions

```prisma
model Client {
  // ...existing...
  portalEnabled Boolean @default(false)   // invite gate
}

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
Additive/optional → safe migration. `Message` cascades from `Project`.

## 6. Auth & invite flow

1. **Invite** (admin): `/admin/clients/[id]` → "Invite to portal" → `inviteClientToPortal(clientId, actor)` sets `portalEnabled=true`, sends notify-svc `announcement` email with the portal URL, audits `client.portal.invite`. A "Re-send invite" appears once enabled.
2. **Login** (client): `/portal/login` → enters email →
   `POST /api/user/login/start`: find `ACTIVE` client with `portalEnabled=true` and this email; if none, return the same generic "check your email" (enumeration-safe) but send nothing. If found, notify-svc `challenge` (method `otp` or `magic_link`), set signed `portal_login` cookie.
   `POST /api/user/login/verify` (OTP path) **or** the magic-link callback page `/portal/auth/callback?cid=&token=` (which calls the same verify logic server-side): notify-svc `verify` → on ok, `issueTicket(email,'portal')` → `signIn('credentials',{ticket})` on the **portal** instance → `portal.session-token` set. Optional notify-svc trusted-device ("remember this device").
3. All portal pages call `getPortalClient()`; null → redirect `/portal/login`.

## 7. Portal UI

- **`/portal/login`** — email → code/link (its own minimal centered card, like admin login but portal-branded).
- **`/portal`** (dashboard) — the client's projects: title, `ProjectStatusBadge`, milestone progress (`done/total`). Empty state if none.
- **`/portal/projects/[id]`** — **scoped to session clientId** (404/redirect if the project isn't theirs): status, milestones (read-only checklist), **Client-visible** updates timeline (INTERNAL updates never queried), and the **message thread** + composer.
- **Portal chrome:** new `PortalHeader` (logo + client name + sign out). `MarketingChrome` currently returns null when the path starts with `/admin`; **extend that check to also suppress on `/portal`** so marketing FABs never appear in the portal. Not the admin nav.

## 8. Messaging

- Per-project thread (`Message`). Client composer on `/portal/projects/[id]` posts `senderType=CLIENT, senderEmail=session.email`. Admin replies from a **new thread panel** on `/admin/projects/[id]` (`senderType=ADMIN, senderEmail=admin.email`).
- Data layer `lib/messages.ts`: `listMessages(projectId)`, `addMessage(projectId, senderType, senderEmail, body)` (scoped callers enforce ownership).
- **Notifications:** new CLIENT message → notify-svc email to `CONTACT_EMAIL` (founder); new ADMIN message → email to the client. Fire-and-forget.
- Both parties always see all messages in the thread (that is the thread's purpose; distinct from ProjectUpdate visibility).

## 9. Security & Testing

- Portal pages/routes re-check `getPortalClient()`; admin pages keep `getAdmin()`. No shared cookie/secret.
- **Scoping:** every portal query filters by `clientId` from the session; project/message loads assert the project's `clientId` matches, else not-found.
- Zod on all inputs; invites + messages audited; notify-svc for all email; enumeration-safe login; no secrets logged.
- **Tests (unit, mocked Prisma/notify):**
  - Cross-stack isolation: a `portal.session-token` yields no `getAdmin()`; an admin token yields no `getPortalClient()`.
  - Ticket scope: `redeemTicket(adminTicket,'portal')` fails; `redeemTicket(portalTicket,'admin')` fails.
  - Invite gate: `login/start` for a client with `portalEnabled=false` sends nothing.
  - clientId scoping: loading a project whose `clientId` ≠ session → not found.
  - Message round-trip + sender typing.
- **Visible browser test:** admin invites a client → client logs in (dev OTP) → sees their project + status/milestones/client-visible update → posts a message → admin sees it on the project page + replies → client sees the reply. Confirm a client **cannot** open `/admin` and an admin session **cannot** read `/portal`.

## 10. Rollout

Branch `feat/client-portal`. Order: schema+migration → ticket-scope + portal auth stack + tests → login routes + `/portal/login` → portal pages (dashboard, project, scoping) → messaging (model already in schema; data layer + admin panel + portal composer + notifications) → invite action + admin button → isolation/scoping tests → build/lint/type-check → local visible verify → **set `PORTAL_AUTH_SECRET` on Railway** → migrate prod (additive) → merge → prod verify.

## 11. Risks

- **Auth isolation is the critical risk** — mitigated by distinct cookie name + distinct secret + scoped tickets + per-page guards, all covered by isolation tests. This is the one thing to get provably right.
- Second NextAuth instance interplay (cookie collisions) — avoided via explicit `cookies.sessionToken.name`.
- Enumeration on login — same generic-response pattern as admin.
