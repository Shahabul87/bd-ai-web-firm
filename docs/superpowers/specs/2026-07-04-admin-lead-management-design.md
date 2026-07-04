# Design Spec — Phase 1: Enterprise Admin & Lead Management

- **Date:** 2026-07-04
- **Status:** Approved (design), pending spec review
- **Project:** CraftsAI marketing site (Next.js 15.5, App Router) → adding client-operations backend
- **Author:** Claude (brainstormed with founder)

## 1. Context & Goal

The CraftsAI site is a marketing site whose contact/quote/demo forms currently email
submissions and best-effort append them to Google Sheets. The firm needs a real way to
**manage inbound clients**. This spec covers **Phase 1**: move leads into Postgres and give
the founder a **secure, enterprise-grade admin dashboard** to view and manage them.

Later phases (out of scope here): Clients/Projects model, external client portal + client
login, invoicing, messaging, push notifications.

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| First slice | **Admin-only.** Leads → Postgres; `/admin` dashboard; email alert to admin on new lead. |
| Admin login | **Passwordless** — magic link (default) + OTP code (fallback). |
| MFA | **Full now** — TOTP authenticator required + recovery codes + trusted-device "remember me". |
| Lead store | **Postgres is source of truth.** Drop Google Sheets + `googleapis`. Add CSV export in dashboard. |
| Auth stack | **Auth.js v5** (database sessions, Prisma adapter) for the session; **notify-svc** for all email/OTP/magic-link/TOTP delivery + verification. |
| Hosting | Railway `craftsai` project (existing Next app + Postgres). No new service. |

## 3. Architecture

Everything is added **inside the existing Next.js app**:

```
prisma/schema.prisma            # models + migrations → Railway Postgres
src/auth.ts                     # Auth.js 5 config (Prisma adapter, DB sessions)
src/middleware.ts               # guards /admin/** and /api/admin/**
src/app/lib/notify.ts           # server-only notify-svc client (email, OTP, magic, TOTP)
src/app/lib/db.ts               # PrismaClient singleton
src/app/lib/leads.ts            # createLead(), listLeads(), updateLeadStatus()...
src/app/lib/audit.ts            # writeAudit()
src/app/admin/                  # dashboard pages (login, leads, lead detail)
src/app/api/admin/auth/*        # admin login endpoints (SEPARATE from any client auth)
src/app/api/admin/leads/*       # lead data endpoints (behind auth)
src/app/api/admin/leads/export  # CSV export
```

### Unit boundaries (each independently testable)
- **notify.ts** — thin typed wrapper over notify-svc HTTP; knows nothing about leads/UI.
- **leads.ts** — CRUD/business logic over the `Lead` model; no HTTP/UI concerns.
- **audit.ts** — append-only audit writes.
- **auth (auth.ts + /api/admin/auth/*)** — orchestrates the factor sequence, mints session.
- **admin UI** — reads/writes through the API only.

## 4. Data Model (Prisma / Postgres)

```prisma
// Auth.js 5 adapter models (User, Account, Session, VerificationToken) — standard shape.
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(ADMIN)
  totpEnrolled Boolean @default(false)   // mirror of notify-svc enrollment for UI gating
  createdAt DateTime @default(now())
  sessions  Session[]
  accounts  Account[]
}
enum Role { ADMIN SUPERADMIN }

model Session {           // database sessions → revocable
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
model Account { /* Auth.js standard */ }
model VerificationToken { identifier String; token String @unique; expires DateTime; @@unique([identifier, token]) }

model Lead {
  id        String     @id @default(cuid())
  source    LeadSource
  name      String
  email     String
  company   String?
  message   String?    @db.Text
  payload   Json       // full sanitized submission (services, budget, etc.)
  status    LeadStatus @default(NEW)
  notes     LeadNote[]
  ip        String?
  userAgent String?    @db.Text
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  @@index([status]) @@index([source]) @@index([createdAt])
}
enum LeadSource { CONTACT QUOTE DEMO }
enum LeadStatus { NEW CONTACTED QUALIFIED PROPOSAL WON LOST }

model LeadNote {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  authorEmail String
  body      String   @db.Text
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  actorEmail String?
  action     String   // e.g. "login.success", "login.fail", "lead.status.change"
  ip         String?
  meta       Json?
  createdAt  DateTime @default(now())
  @@index([createdAt])
}

model AuthTicket {          // single-use proof that ALL login factors passed for `email`
  id        String   @id @default(cuid())
  email     String
  usedAt    DateTime?
  expiresAt DateTime         // ≤ 2 minutes
  createdAt DateTime @default(now())
  @@index([expiresAt])
}
```

**We store zero auth secrets.** TOTP secrets, OTP/magic codes, recovery codes, and
trusted-device tokens are held by **notify-svc**. All new fields are optional / defaulted
(safe additive migrations per project standards).

## 5. Enterprise Login Flow

Endpoints under `/api/admin/auth/*` (POST, JSON, Zod-validated, rate-limited):

1. **`start` `{ email, method: "magic_link"|"otp" }`** — if `email` ∉ `ADMIN_EMAILS`, return a
   generic success anyway (enumeration-safe) but do nothing. Else call notify-svc
   `challenge {method, to:email, app_name:"CraftsAI Admin", redirect}` → return `{ challengeId }`.
2. **`verify-email` `{ challengeId, code|token }`** — notify-svc `verify`. On success:
   - If a valid **trusted-device** cookie is present (`notify-svc trust/check`) → issue final
     single-use **auth ticket**, skip TOTP.
   - Else if user not yet `totpEnrolled` → return `{ needEnroll:true, enroll }` where `enroll`
     comes from notify-svc `totp/enroll` (otpauth URI → QR) + 10 recovery codes (shown once).
   - Else → return `{ needTotp:true }`.
3. **`verify-totp` `{ challengeId, code }`** — notify-svc `totp/verify` (accept recovery code via
   `recovery/verify` fallback). On success → issue final auth ticket. Optionally
   `trust { label, ttl_days:30 }` if "remember this device" checked → set httpOnly cookie.
4. **Session mint** — client calls Auth.js `signIn("credentials", { ticket })`. The Credentials
   provider's `authorize()` validates the ticket (single-use, ≤2-min TTL, server-side store),
   loads/creates the `User`, returns it → **Auth.js mints a database session** (httpOnly, Secure,
   SameSite=Lax, ~30-day sliding). Ticket is burned.
5. **Every step** writes `AuditLog` (`login.start/success/fail`, `mfa.fail`, IP, UA).

**Ticket** = a single-use `AuthTicket` row (opaque id, ≤2-min TTL, `usedAt` burned on redeem)
marking "all factors passed for email X"; the ONLY thing `authorize()` trusts. This keeps the
multi-factor orchestration outside Auth.js while Auth.js owns the session.

Security: notify-svc enforces short TTLs (OTP 5m / link 15m / 5-attempt lockout / 30s resend
throttle); we add our own IP rate-limit and full separation from any client auth.

## 6. Lead Capture Changes

Each existing route (`/api/contact`, `/api/quote`, `/api/demo`) after validation/sanitization:
1. `await createLead({ source, name, email, company?, message?, payload, ip, userAgent })`
   (wrapped in try/catch — a DB failure is logged but **never blocks the visitor's success response**).
2. Fire notify-svc email alert to `CONTACT_EMAIL`: "New {SOURCE} lead from {name}".
3. Remove `appendToSheet(...)` calls; delete `lib/sheets.ts` + `googleapis` dep +
   `GOOGLE_SHEETS_*` env usage.
4. Existing SMTP auto-reply to the *client* is left unchanged in Phase 1 (migrate to notify-svc later).

## 7. Admin Dashboard (`/admin`)

- **`/admin/login`** — email input, "Email me a magic link" (default) + "Use a code instead";
  TOTP step; first-run enrollment (QR + recovery codes).
- **`/admin`** (leads list) — table: date, source, name, email, status; filter by status/source;
  text search; newest-first; unread indicator; **Download CSV** button.
- **`/admin/leads/[id]`** — full submission, status dropdown (writes + audits), internal notes
  timeline, `mailto:` reply button.
- **`/api/admin/leads/export`** — streams CSV of the current filter.
- All `/admin/**` + `/api/admin/**` protected by `middleware.ts`: valid session **AND** email in
  allowlist **AND** role — else redirect to `/admin/login` (pages) or `401` (APIs).
- UI matches the existing Drafting-Room design system (ink/signal/bone tokens).

## 8. Notifications (notify-svc)

- Auth emails (magic link, OTP) — notify-svc `challenge`.
- New-lead alert to founder — notify-svc `/v1/notify` (`announcement` template or a small custom
  `new_lead` template: subject "New {source} lead", body with name/email/summary + link to
  `/admin/leads/[id]`).
- `lib/notify.ts` is `import "server-only"`; `NOTIFY_API_KEY` never reaches the browser.

## 9. Infrastructure & Env Vars (Railway `craftsai`)

Link this repo to the `craftsai` project; set (values never printed/echoed):
`DATABASE_URL` (Railway Postgres), `AUTH_SECRET` (generated), `AUTH_URL`,
`ADMIN_EMAILS` (comma-separated allowlist), `NOTIFY_URL`
(`https://notify-api-production-2689.up.railway.app`), `NOTIFY_API_KEY`, plus existing
`CONTACT_EMAIL` / `SMTP_*`. Prisma migrations applied to Postgres (additive; per project
DB-safety rules — no destructive ops without explicit approval).

**Go-live prerequisites (do NOT block building — code degrades gracefully, logging the
link/code to the server in dev until ready):**
1. **Onboard CraftsAI as a notify-svc tenant** to obtain `NOTIFY_API_KEY` — run on the founder's
   **Windows maintainer machine** (has the notify-svc repo): `create-tenant craftsai --from
   "CraftsAI <no-reply@craftsai.org>"`. One-time.
2. **Verify craftsai.org in Brevo** (DKIM/DMARC/TXT via Cloudflare) so auth email reaches inbox.

## 10. Security Requirements (enterprise)

- Admin auth **completely separate** from any future client auth (own routes, own cookies, no
  shared tokens). Hard rule.
- Zod validation on every endpoint; typed throughout; no `any`.
- httpOnly + Secure + SameSite cookies; DB sessions (revocable); CSRF protection (Auth.js built-in).
- Allowlist gate; enumeration-safe responses; IP rate-limiting; notify-svc lockout/throttle.
- Full audit log of auth + sensitive actions.
- No secret values ever logged. `NOTIFY_API_KEY`/`AUTH_SECRET` server-only.

## 11. Testing & Verification

- Prisma migrate + `npm run build` + `npm run lint` + `npm run type-check` all clean.
- Unit-level: `leads.ts` and `notify.ts` exercised against a test/dev DB and notify-svc dev
  fallback (link/code read from server log or notify-svc Postgres proxy per skill tips).
- **Visible browser test (founder watching):** full flow — request magic link → verify → TOTP
  enroll → dashboard → submit a test lead via a public form → see it appear → change status →
  export CSV → log out → re-login with OTP + trusted device.

## 12. Rollout Order

1. Prisma + Postgres wiring + schema + first migration.
2. `notify.ts` client + `lib/db.ts`.
3. Lead capture → Postgres + admin alert; remove Sheets.
4. Auth.js 5 + `/api/admin/auth/*` factor flow + middleware.
5. Admin dashboard pages + CSV export.
6. Env vars on Railway; migrate; deploy; visible browser verification.

## 13. Risks / Open Items

- notify-svc tenant + Brevo domain are external prerequisites for live email (mitigated by dev
  fallback logging).
- Auth.js v5 Credentials-ticket pattern is the crux; must be single-use + short-TTL + audited.
- Postgres availability must never block public form submission (fail-open for the visitor).
