# CraftsAI

Marketing site **and** client-operations platform for CraftsAI, an AI-assisted software studio. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Prisma/Postgres, and Auth.js 5.

Beyond the public marketing pages, the app runs the studio's lead funnel, an admin back office, and a client portal — all on one codebase.

## What's in here

- **Marketing site** — home, services, products, portfolio, resources (blog / case studies / guides), legal pages, and SEO surfaces (sitemap, robots, Open Graph images, web manifest, JSON-LD structured data).
- **Lead capture** — public contact, quote, and demo forms. Submissions are sanitized, validated, rate-limited, honeypot-protected, persisted to Postgres, and trigger a founder alert via notify-svc.
- **Admin back office** (`/admin`) — passwordless, allowlisted login (email OTP/magic link + optional TOTP, recovery codes, trusted devices) that mints a single-use `AuthTicket`; lead triage (list / filter / status / notes / CSV export) and lead-to-client conversion.
- **Client portal** (`/portal`) — separate passwordless auth for clients, scoped to their own projects, messages, and invoices.
- **Notifications** — all transactional email and web push (FCM) go through the self-hosted **notify-svc** (no direct SMTP path in this app).
- **Content pipeline** — MDX content under `content/` compiled by [Velite](https://velite.js.org/) into typed collections (blogs, case studies, guides, products).

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (single dark theme via CSS variables) |
| Animation | Framer Motion |
| Auth | Auth.js 5 (`next-auth`) — separate admin & portal instances |
| Database | PostgreSQL via Prisma |
| Content | Velite (MDX) |
| Email / Push / Auth OTP | notify-svc (external service) |
| Testing | Jest + Testing Library |

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted)

### Setup

```bash
npm install                 # install deps (also runs `prisma generate`)
cp .env.example .env        # then fill in real values (see below)
npm run db:migrate          # apply Prisma migrations to your dev DB
npm run dev                 # http://localhost:3000
```

In local development the app runs without notify-svc configured: auth flows fall
back to a dev challenge/verify (see `src/app/lib/devAuth.ts`) and emails/pushes
are logged to the console instead of sent.

## Environment variables

See [`.env.example`](./.env.example) for the full list. Required in production
(validated at server startup by `src/app/lib/env.ts`):

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Admin session/cookie signing secret (≥ 32 chars) |
| `PORTAL_AUTH_SECRET` | Client-portal signing secret — **must differ** from `AUTH_SECRET` (≥ 32 chars) |
| `AUTH_URL` | Canonical app URL |
| `ADMIN_EMAILS` | Comma-separated admin allowlist |
| `NOTIFY_URL`, `NOTIFY_API_KEY` | notify-svc endpoint + tenant key |

Optional: `CONTACT_EMAIL` (lead-alert recipient), `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` (distributed rate limiting),
`OBSERVABILITY_WEBHOOK_URL` (incident forwarding),
`NEXT_PUBLIC_GA_MEASUREMENT_ID` (analytics + cookie consent), and the
`NEXT_PUBLIC_FIREBASE_*` push variables (set only after FCM setup).

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run test         # Jest
npm run audit:ci     # Fail on high+ dependency vulnerabilities
npm run db:migrate   # prisma migrate dev
npm run db:deploy    # prisma migrate deploy (production)
npm run db:studio    # Prisma Studio
```

## Project structure

```
src/
├── app/
│   ├── (marketing pages)/       # home, services, products, resources, legal…
│   ├── admin/                   # admin back office (protected by middleware)
│   ├── portal/                  # client portal
│   ├── api/                     # contact/quote/demo + admin/user auth routes
│   ├── components/              # shared UI + StructuredData, AIChatbot…
│   └── lib/                     # env, db, leads, notify, audit, report, auth helpers
├── auth.ts / auth.config.ts     # admin Auth.js instance (+ edge config)
├── authPortal.ts / .config.ts   # isolated client-portal Auth.js instance
├── middleware.ts                # gates /admin and /api/admin
└── instrumentation.ts           # validates required env at startup
content/                         # MDX (Velite) — blogs, case-studies, guides, products
prisma/                          # schema + migrations
```

## Security & operations notes

- **Admin and portal auth are fully isolated** — distinct base paths, cookie
  names, and signing secrets; they share no tokens or state.
- **Fail-open helpers** (`notify`, `audit`, lead persistence) never throw, but
  every failure is funneled through `src/app/lib/report.ts` so it can be alerted
  on. Lead-persistence failure returns a 503 to the visitor and pages the founder.
- **Rate limiting** uses Upstash Redis when configured, falling back to an
  in-memory limiter otherwise.
- Run `npm run audit:ci` in CI. The app has no direct SMTP path; email is
  notify-svc only.

See `CLAUDE.md` for the full engineering conventions.

## License

Proprietary and confidential.

## Contact

For inquiries about CraftsAI's services, visit [craftsai.org](https://www.craftsai.org).
