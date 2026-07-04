# CraftsAI Client-Ops Platform — Phase 2+ Roadmap

- **Date:** 2026-07-04
- **Status:** Roadmap (design-level). Each phase below gets its own brainstorm → spec → TDD plan → build → verify cycle before implementation.
- **Builds on:** Phase 1 (shipped) — Prisma/Postgres, Auth.js 5 admin auth, notify-svc comms, admin leads dashboard, Railway deploy, GA.

## Guiding principles (carried from Phase 1)

- **One subsystem per phase.** Sequenced by dependency (below). Each = feature branch → merge only after verified + env set.
- **TDD**: jest unit tests + real-DB integration + visible prod verification.
- **notify-svc is the single comms layer** — all email/push/auth flows through it. No new SMTP/SaaS.
- **HARD RULE — client auth is completely separate from admin auth.** Own routes (`/api/user/auth/*`), own session cookie, own user table, no shared tokens/sessions. Admin stays under `/api/admin/*`.
- **Additive, safe migrations** only. Fail-open on public paths. No secrets in logs.
- **Regional reality**: founder + clients may be in Bangladesh and worldwide → currency/payment/timezone choices matter (flagged where relevant).

## Dependency graph & recommended build order

```
Phase 2  Clients & Projects (admin)         ← foundational; everything needs it
   │
   ├── Phase 3  Client portal + client login  (clients view their projects)
   │        │
   │        └── Phase 4  Invoicing            (bill clients, optional online pay)
   │
   └── Phase 5  Push notifications            (cross-cutting; needs FCM setup)
```

**Recommended order: 2 → 3 → 4 → 5.** Rationale: Clients/Projects is the data backbone for the portal and invoicing; the portal gives clients a place to *see* invoices; push is cross-cutting and depends on real FCM credentials, so it lands last.

---

## Phase 2 — Clients & Projects (admin-side)

**Goal:** Convert won leads into Clients and track Projects per client — status, milestones, and an update timeline — all from the existing admin dashboard.

**Scope:** Client + Project CRUD in `/admin`; "Convert lead → client" action on a lead; project status pipeline; internal + client-visible update notes; milestones. *Out of scope:* anything client-facing (that's Phase 3).

**Data model (Prisma additions):**
```
Client   id, name, email, company?, phone?, status(ACTIVE|ARCHIVED),
         sourceLeadId? (→ Lead), createdAt, updatedAt
Project  id, clientId(→Client), title, description?, 
         status(DISCOVERY|BUILD|REVIEW|LAUNCHED|MAINTENANCE|ON_HOLD),
         startedAt?, targetDate?, createdAt, updatedAt
Milestone id, projectId, title, dueDate?, status(PENDING|DONE), order
ProjectUpdate id, projectId, authorEmail, body, 
              visibility(INTERNAL|CLIENT),  // CLIENT ones surface in the portal (Phase 3)
              createdAt
Lead     + convertedClientId?  (link so a lead isn't re-converted)
```

**Components / routes:** `lib/clients.ts`, `lib/projects.ts` (data layer, gated by `getAdmin`); server actions for create/convert/status/update/milestone; pages `/admin/clients`, `/admin/clients/[id]`, `/admin/projects/[id]`; a "Convert to client" button on `/admin/leads/[id]`. Reuse the `AdminNav`, `StatusBadge`, filter/table patterns from Phase 1.

**Auth:** admin-only (existing `getAdmin`). No new auth.

**notify-svc:** none new (internal). Client-visible updates trigger notifications in Phase 3.

**Key decisions (flag for founder):**
- Project status stages — the 6 above, or your own words?
- Milestones as structured rows vs just free-text updates? (Recommend both: lightweight milestones + a timeline.)
- One client = one contact, or multiple contacts per client? (Recommend single contact now; multi later.)

**Risks:** low. Pure additive schema + admin UI following Phase-1 patterns.
**Sizing:** M–L (2 data-layer modules, ~4 pages, actions).

---

## Phase 3 — Client Portal + Client Login

**Goal:** Clients log in to a portal to see **their** projects, status, client-visible updates, and (optionally) message the firm — reducing "what's the status?" emails.

**Scope:** Invite-based client accounts, passwordless client login (magic link / OTP via notify-svc), a `/portal` area showing the logged-in client's projects + updates. *Out of scope:* invoices (Phase 4), push (Phase 5).

**⚠️ Client auth is SEPARATE from admin (hard rule):**
- Own user table `PortalUser` (id, clientId→Client, email, createdAt) — **not** the admin `User` table.
- Own auth routes `/api/user/auth/*` and login orchestration `/api/user/login/*` (mirrors Phase-2-admin structure but isolated).
- Own session cookie (distinct name, e.g. `portal_session`) — a **second Auth.js instance** with `basePath:/api/user/auth`, OR a lightweight custom `jose` JWT session. **Decision below.**
- Own middleware matcher for `/portal/**` + `/api/user/**`; never shares tokens with admin.

**How clients get accounts:** admin **invites** from a `Client` record (Phase 2) → notify-svc magic link → client sets up their login. No public self-signup (keeps it controlled).

**MFA:** optional for clients (magic link/OTP is enough for a low-risk read-mostly portal). TOTP available if a client wants it. (Admin keeps mandatory MFA.)

**Data model additions:** `PortalUser` (above). `ProjectUpdate.visibility=CLIENT` rows drive the portal feed. Optional `Message` (id, projectId, senderType(ADMIN|CLIENT), senderRef, body, createdAt) if in-portal messaging is in scope.

**Components / routes:** `auth-portal.ts` / `auth-portal.config.ts` (isolated), `/api/user/login/*`, `middleware` update, `/portal` (client's projects), `/portal/projects/[id]`, `/portal/login`, invite action in admin. notify-svc client already exists (`lib/notify.ts`).

**notify-svc:** client login (magic link/OTP), client invite email, "your project was updated" notifications when an admin posts a CLIENT-visible update.

**Key decisions (flag for founder):**
- **Session tech:** second Auth.js instance (consistent with admin, more setup) vs a lean custom `jose` cookie (simpler, less machinery). *Recommend: lean custom `jose` session for the portal* — clients don't need the full Auth.js surface, and it keeps the two systems cleanly independent.
- In-portal **messaging** in v1, or just read-only status? (Recommend read-only first; messaging as a fast-follow.)
- Client MFA optional or off entirely for v1?

**Risks:** medium — the auth-separation must be airtight (no cookie/token bleed between admin and client). Covered by isolated routes + distinct cookie + tests asserting cross-access is blocked.
**Sizing:** L (a second, isolated auth stack + portal UI).

---

## Phase 4 — Invoicing

**Goal:** Create and send invoices per client/project; clients view them in the portal; optionally pay online.

**Scope:** Admin creates invoices (line items, amount, due date), sends them (notify-svc); clients view/download in the portal; payment status tracking. *Optional:* online payment.

**Data model additions:**
```
Invoice     id, clientId, projectId?, number(unique, sequential), 
            currency, status(DRAFT|SENT|PAID|OVERDUE|VOID),
            issuedAt?, dueDate?, notes?, createdAt
InvoiceLine id, invoiceId, description, quantity, unitPriceCents, // integer cents, no float money
            order
Payment     id, invoiceId, amountCents, method, reference?, paidAt   // present if payments enabled
```
**Money is stored in integer cents** (never floats). Totals derived from lines.

**Components / routes:** `lib/invoices.ts`; admin pages `/admin/invoices`, `/admin/invoices/new`, `/admin/invoices/[id]`; client `/portal/invoices` + `/portal/invoices/[id]`; PDF generation (server-side, e.g. a lightweight HTML→PDF) for download.

**notify-svc:** "invoice sent" email with a portal link; "payment received" confirmation; overdue reminders (notify-svc `reminder`/`announcement`).

**⚠️ Key decision — online payment (has a regional constraint):**
- **Option A — Offline/manual (recommended v1):** invoice shows bank/Wise/bKash details; admin marks it PAID manually. Zero payment-provider integration, works anywhere including Bangladesh. Fastest, no compliance surface.
- **Option B — Online payments:** integrate a provider. **Stripe is not available to *receive* payments in Bangladesh**, so options are Wise, Paddle/Lemon Squeezy (merchant-of-record, good for international SaaS/services), or a local gateway (SSLCommerz/bKash for BDT). This adds checkout + webhooks + reconciliation and a provider account.
- Currency: **USD** for international clients (recommend) with per-invoice currency; BDT if billing locally.
- Tax/VAT: does CraftsAI need to show VAT? (Bangladesh VAT considerations — flag for founder/accountant.)

**Risks:** medium–high if online payments (provider + webhooks + money correctness). Low if offline v1.
**Sizing:** M (offline) to L (online payments).

---

## Phase 5 — Push Notifications

**Goal:** Real-time push (web push via FCM through notify-svc) for key events — new lead (to admin), project update (to client), invoice sent, new message.

**Scope:** Register devices, subscribe to topics/user-refs, fire pushes on events. Web push first (PWA-capable). *Out of scope:* native mobile apps.

**Dependencies / prerequisites:**
- **FCM credentials configured in notify-svc** (maintainer/Windows step) — notify-svc's push requires real FCM creds; without them push silently no-ops.
- A **service worker** + FCM web SDK in the app to obtain a token and receive pushes; register the token with notify-svc `POST /v1/devices` (as `user:<ref>` for a specific admin/client, or `topic:<name>` for broadcast).

**Components:** `public/firebase-messaging-sw.js` (service worker), a small client hook to request permission + register the device, and server-side `sendPush` calls in `lib/notify.ts` on events (extends the existing notify client — `to: user:<ref>` or `topic:new-leads`).

**Event → push mapping:**
- New lead → push to admin topic/user (in addition to the existing email alert).
- Client-visible project update → push to that client's devices.
- Invoice sent / payment received → push to the relevant party.

**Key decisions (flag for founder):**
- Who gets push — admin only, clients only, or both?
- Which events warrant a push (vs just email)?
- Ask for notification permission where — on the admin dashboard, the portal, or both?

**Risks:** low–medium; main dependency is the one-time FCM setup in notify-svc (out of the app's control).
**Sizing:** M (once FCM creds exist).

---

## Cross-cutting foundations (apply to every phase)

- **Auth isolation tests:** each phase touching auth adds tests asserting admin↔client boundaries hold (a client session can't hit `/api/admin/*` and vice-versa).
- **Migrations:** additive; run `prisma migrate deploy` against prod Postgres via public proxy (as in Phase 1); commit migration files.
- **Deploy:** feature branch → verify locally (unit + build) → set any new Railway vars → merge to `main` → confirm deploy SUCCESS → visible prod verification.
- **notify-svc templates:** reuse `announcement`/`reminder`/auth templates; if a phase needs a bespoke template, that's a maintainer (Windows) `create-tenant` reseed step — plan for it.
- **Docs:** each phase writes its own `docs/superpowers/specs/…-design.md` + `plans/…-partN.md`.

## Open decisions to resolve before/at each phase (consolidated)

| # | Decision | Phase | Recommended default |
|---|---|---|---|
| 1 | Project status stages | 2 | DISCOVERY→BUILD→REVIEW→LAUNCHED→MAINTENANCE (+ON_HOLD) |
| 2 | Multiple contacts per client | 2 | Single contact v1 |
| 3 | Portal session tech | 3 | Lean custom `jose` cookie (isolated from admin) |
| 4 | In-portal messaging v1 | 3 | Read-only first, messaging fast-follow |
| 5 | Client MFA | 3 | Optional (off by default) |
| 6 | Online vs offline payments | 4 | Offline/manual v1 (Stripe can't receive in BD) |
| 7 | Invoice currency / VAT | 4 | USD default, per-invoice currency; VAT per accountant |
| 8 | Push audience & events | 5 | Both, on new-lead + project-update + invoice |
| 9 | FCM setup owner/timing | 5 | Maintainer machine, before Phase 5 build |

## Suggested first step

Greenlight **Phase 2 (Clients & Projects)** — it unblocks everything and is low-risk. When you say go, I'll run the full brainstorm → spec → TDD plan → build → prod-verify cycle for it, exactly like Phase 1.
