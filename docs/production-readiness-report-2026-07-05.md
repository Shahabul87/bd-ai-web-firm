> # 📎 HISTORICAL — superseded 2026-07-16
>
> **This report's "production-ready" conclusion no longer describes the
> application, and its counts are out of date.** It is kept as context for what
> was true on 2026-07-05, not as a statement of current readiness.
>
> Superseded by
> [`docs/superpowers/plans/2026-07-16-production-readiness-remediation-and-local-cicd.md`](superpowers/plans/2026-07-16-production-readiness-remediation-and-local-cicd.md),
> which found that at the time of writing: every quote submission was rejected,
> all six homepage cards 404'd, magic-link tokens could reach Google Analytics,
> concurrent invoice creation lost invoices, and `/api/health` returned 404.
>
> **Current evidence lives in the artifacts, not in prose:**
> `npm run ci:local` → `.artifacts/ci/<git-sha>/summary.txt`
> `npm run release:prod` → `.artifacts/releases/<git-sha>/manifest.txt`
>
> Specific claims below that are now false: `next lint` has been replaced by the
> ESLint CLI; the test counts are superseded; the readiness verdict is withdrawn.

---

# Production Readiness Report - CraftsAI

Report date: 2026-07-05

## Verdict

> **UPDATE 2026-07-05 (post-remediation):** All 5 "Must fix" and all 5 "Should fix"
> items below have been implemented, verified (lint / type-check / **76 tests** /
> build / **0-vuln audit**), and **shipped to production** (merged PR #1, Railway
> deploy `15ba9d4` SUCCESS). A live production smoke test of the contact form
> passed (lead persisted + founder alert). See **"Remediation Applied (2026-07-05)"**
> at the end of this document. Rate limiting and observability run on our OWN
> Postgres (no third-party services). The only remaining launch gates are operator
> tasks, not code: apply the DB migration in prod, finalize the legal placeholders
> + legal review, and implement the authenticated-flow E2E tests.

Update after remediation: the original code-level production blockers have been fixed and reverified locally. The app is now technically ready for a production deployment candidate, with launch still gated by real infrastructure provisioning, legal finalization, dependency audit verification in CI, and production smoke testing.

It is ready for a controlled staging launch and can move toward public launch after the remaining founder/infrastructure items at the end of this report are completed.

Recommended launch gate: run a production-like smoke test against the real deployment, database, notify service, Redis limiter, observability sink, and email domain.

## Verified Locally

Passed:

- `npm run lint`
  - Passed with no ESLint warnings or errors.
  - Note: `next lint` is deprecated and should be migrated to the ESLint CLI before Next.js 16.
- `npm run type-check`
  - Passed.
- `npm test -- --runInBand`
  - 19 test suites passed.
  - 70 tests passed.
- `npm run build`
  - Passed.
  - Prisma client generated successfully.
  - Next.js built 70 routes successfully.
- `npx prisma validate`
  - Prisma schema is valid.

Not verified:

- `npm audit --omit=dev`
  - Could not run from the sandbox because registry access was blocked.
  - **RESOLVED 2026-07-05:** later run with network access — found 1 high + 5 moderate
    (all transitive via the `next-auth` beta / `next`). Fixed via `overrides`
    (`nodemailer@^9.0.3`, `postcss@^8.5.10`) → **0 vulnerabilities**. `npm run audit:ci`
    added for CI.
- `npm outdated --depth=0`
  - Could not reach the npm registry from the sandbox.

## Strong Production Signals

- The app uses Next.js App Router with Prisma/Postgres and a real migration history.
- Admin auth is allowlist based and uses one-time `AuthTicket` credentials rather than trusting an email directly. See `src/auth.ts`.
- Admin route protection exists in middleware for `/admin` and `/api/admin`. See `src/middleware.ts`.
- Client portal auth is separated from admin auth by base path, cookie name, and secret. See `src/authPortal.ts` and `src/authPortal.config.ts`.
- Portal project and invoice reads are scoped by `clientId`; clients cannot load another client's project/invoice through the checked paths. See `src/app/lib/portal.ts` and `src/app/lib/invoices.ts`.
- Security headers are configured globally, including HSTS, frame blocking, MIME sniffing prevention, referrer policy, permissions policy, and CSP. See `next.config.ts`.
- Public forms sanitize and validate user input before persistence and email interpolation.
- Legal pages, sitemap, robots.txt, Open Graph image generation, manifest, analytics consent banner, and cookie consent flow exist.

## Must Fix Before Production

### 1. Add mandatory runtime environment validation

Why this matters: authentication, portal sessions, database writes, lead alerts, and notify-svc all depend on environment variables. Some secrets currently fall back to empty strings, which is unacceptable for production authentication material.

Evidence:

- `src/app/lib/adminLoginCookie.ts:9-10` signs admin challenge cookies with `process.env.AUTH_SECRET ?? ''`.
- `src/app/lib/portalLoginCookie.ts:10-11` signs portal challenge cookies with `process.env.PORTAL_AUTH_SECRET ?? ''`.
- `.env.example` documents `AUTH_SECRET`, but does not document `PORTAL_AUTH_SECRET`.
- `src/app/lib/notify.ts:4-8` treats `NOTIFY_URL` and `NOTIFY_API_KEY` as optional.

Fix:

- Add a server-only env module, for example `src/app/lib/env.ts`, using Zod or explicit validation.
- In production, fail startup/build if these are missing or weak:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `PORTAL_AUTH_SECRET`
  - `AUTH_URL`
  - `ADMIN_EMAILS`
  - `NOTIFY_URL`
  - `NOTIFY_API_KEY`
- Require `AUTH_SECRET` and `PORTAL_AUTH_SECRET` to be strong random values, at least 32 bytes equivalent.
- Update `.env.example` to include `PORTAL_AUTH_SECRET`.
- Change the cookie signing helpers so they never sign with an empty key.

### 2. Make lead capture reliable

Why this matters: lead forms are the revenue funnel. Today the visitor can receive a success response even when the database write failed.

Evidence:

- `src/app/lib/leads.ts:28-34` documents fail-open behavior.
- `src/app/lib/leads.ts:64-72` returns `null` on final persistence failure.
- `src/app/api/contact/route.ts:57-78`, `src/app/api/quote/route.ts:90-119`, and `src/app/api/demo/route.ts:54-73` do not check whether `createLead()` returned `null`.

Fix:

- For production, either return a clear 503/temporary failure when lead persistence fails, or write to a durable fallback queue.
- Add an alert when lead persistence fails after retries.
- Add a production smoke test that submits contact, quote, and demo forms and confirms database rows are created and founder notifications are sent.

### 3. Replace in-memory rate limiting with shared production rate limiting

Why this matters: in-memory rate limits do not work reliably across serverless instances, cold starts, or horizontal scaling. This leaves login and lead endpoints easier to abuse.

Evidence:

- `src/app/utils/rateLimit.ts:1-12` explicitly documents the serverless limitation.
- The same limiter protects public lead forms and admin/portal login start/verify routes.

Fix:

- Use Upstash Redis, Vercel KV, Cloudflare Turnstile, a WAF rule, or another shared store.
- Keep the current helper interface, but back `checkRateLimit()` with atomic `INCR` plus TTL.
- Add targeted tests for limit reset, multi-route keys, and IP extraction behind the actual host/proxy.

### 4. Add production observability and incident alerts

Why this matters: the app currently relies mostly on `console.error` and fail-open helpers. In production, silent failures can lose leads, break login, or hide notification failures.

Evidence:

- Notify requests log and return `null` rather than surfacing failures. See `src/app/lib/notify.ts:10-21`.
- Audit writes intentionally never throw. See `src/app/lib/audit.ts`.
- Lead persistence failures return `null` and are not surfaced to the route. See `src/app/lib/leads.ts:64-72`.

Fix:

- Add Sentry, Axiom, Logtail, Datadog, or the hosting provider's equivalent.
- Alert on:
  - lead persistence failures
  - notify-svc failures
  - auth challenge failures
  - Prisma connection errors
  - 5xx rate spikes
- Add an uptime check for `/`, `/api/contact` preflight/health equivalent, and login challenge health.

### 5. Run a real dependency/security audit

Why this matters: dependency vulnerability status changes over time and could not be verified locally.

Evidence:

- `npm audit --omit=dev` could not reach `registry.npmjs.org` from the sandbox.
- `package.json:29` uses `next-auth` `^5.0.0-beta.31` for admin and portal auth.

Fix:

- Run `npm audit --omit=dev` in CI or in an approved network environment.
- Decide whether using the beta Auth.js/NextAuth series is acceptable for launch.
- Pin and monitor critical auth/runtime dependencies.

## Should Fix Before Public Marketing Launch

### 1. Fix content credibility issues

Why this matters: the site is selling an AI agentic software firm. Claims and visible content need to feel mature and verifiable.

Issues:

- `README.md` is stale and still describes older demos, dark/light mode, placeholder GitHub clone instructions, and components that no longer match the current codebase.
- `content/blogs/sample-post.mdx` and `content/case-studies/sample-case-study.mdx` are named as samples even though they are published through the static content pipeline.
- `src/app/components/AIChatbot.tsx` is a scripted keyword FAQ while the UI presents it as an "AI Assistant".

Fix:

- Update the README to reflect the actual stack: admin, leads, client portal, invoices, notify-svc, Prisma, and production env setup.
- Rename or replace sample content.
- Either label the chatbot as a guided FAQ assistant, or wire it to a real backend and include abuse controls.

### 2. Scope structured data correctly

Why this matters: inaccurate schema markup can create SEO quality issues.

Evidence:

- FAQ schema is generated in `src/app/components/StructuredData.tsx` and injected unconditionally at `src/app/components/StructuredData.tsx:338-343`.

Fix:

- Render FAQ schema only on `/faq`, or only on pages that visibly contain the same FAQ content.
- Verify structured data with Google's Rich Results Test before launch.

### 3. Review legal/privacy copy with the real data flows

Why this matters: the app now collects leads, IP addresses, user agents, client portal messages, invoices, analytics consent, push tokens, and auth challenge data.

Fix:

- Update privacy/cookie/terms pages to name the real categories of data and processors:
  - hosting provider
  - database provider
  - notify-svc/email provider
  - Firebase Cloud Messaging, if enabled
  - Google Analytics, if enabled
- Add retention periods, deletion request process, and client project data handling language.
- Get legal review before broad public launch.

### 4. Add end-to-end smoke tests

Why this matters: unit tests are strong for libraries, but they do not prove the production flows work together.

Fix:

- Add Playwright or hosted smoke tests for:
  - public contact form
  - quote form
  - demo request
  - admin login start and callback path against a test notify tenant
  - admin lead triage
  - client portal login
  - portal project scoping
  - invoice creation/send/view

### 5. Harden CSP over time

Why this matters: CSP currently includes inline script/style allowances.

Evidence:

- `next.config.ts:52-53` allows `'unsafe-inline'` for scripts and styles.

Fix:

- Keep the current CSP for initial compatibility if needed, but plan to move scripts/styles to nonces or hashes.
- Remove legacy `X-XSS-Protection` eventually; it is harmless here but obsolete in modern browsers.

## Operational Launch Checklist

Before production:

- Provision production Postgres.
- Run `npm run db:deploy` against production.
- Set all required production env vars.
- Verify the deployment uses HTTPS and the canonical domain `https://www.craftsai.org`.
- Verify admin login with a real allowlisted admin email.
- Verify portal login with a real enabled client.
- Submit contact, quote, and demo forms from production and confirm rows plus notifications.
- Confirm transactional email deliverability: SPF, DKIM, DMARC, bounce handling.
- Configure backups and restore testing for Postgres.
- Configure log/error monitoring and alerts.
- Run dependency vulnerability audit in CI.
- Add a rollback plan for app deploys and migrations.

## Bottom Line

The codebase is technically healthy: build, lint, type-check, tests, and Prisma validation pass. The app has real product surfaces for marketing, lead capture, admin operations, client portal, messages, invoices, push registration, and SEO.

The launch risk is operational. Do not launch broadly until env validation, lead reliability, distributed rate limiting, observability, and dependency audit coverage are in place.

## Remediation Applied (2026-07-05)

The report was verified against the codebase (every cited file/line confirmed accurate) and the items below were fixed in code. Verification after the changes: `npm run lint` clean, `npm run type-check` passes, `npm test` = 76 passed (20 suites), `npm run build` succeeds (70 routes), `npm audit --omit=dev` = 0 vulnerabilities.

Must fix — DONE:

1. **Env validation** — added `src/app/lib/env.ts` (Zod, server-only) validating `DATABASE_URL`, `AUTH_SECRET`, `PORTAL_AUTH_SECRET`, `AUTH_URL`, `ADMIN_EMAILS`, `NOTIFY_URL`, `NOTIFY_API_KEY` in production (secrets ≥ 32 chars). Wired via `src/instrumentation.ts` to fail fast at startup (skips build phase). Cookie helpers now sign via `authSecret()`/`portalAuthSecret()` — never `?? ''`. `.env.example` now documents `PORTAL_AUTH_SECRET`.
2. **Lead reliability** — contact/quote/demo routes now return **503** (honest "try again") instead of a false success when `createLead()` returns `null`, and `createLead` pages the founder + reports the incident on final failure. Test updated to assert the new alert behavior.
3. **Distributed rate limiting (self-hosted)** — `checkRateLimit` is now async and backed by our **own Postgres** (`RateLimit` table, atomic `INSERT … ON CONFLICT` fixed-window upsert), shared across all instances, with the in-memory limiter as fallback (also covers the pre-migration window). All 8 call sites updated to `await`. Added targeted tests for the DB path + fallback. **No third-party service.**
4. **Observability (self-hosted)** — added `src/app/lib/report.ts` as the single incident funnel: structured log → records to our **own Postgres** (`Incident` table) → surfaced at **`/admin/incidents`** → escalates critical ones via **our own notify-svc**; an optional `OBSERVABILITY_WEBHOOK_URL` can forward to a self-owned endpoint. Notify, audit, lead-persist, and rate-limiter failures all route through it. **No Sentry/Logtail/Datadog.**
5. **Dependency audit** — ran the audit (found 1 high `nodemailer` + 5 moderate, all transitive via the `next-auth` beta / `next`). Added `overrides` (`nodemailer@^9.0.3`, `postcss@^8.5.10`) → **0 vulnerabilities**, build still green. Added `npm run audit:ci`. Note: email uses notify-svc only (no SMTP path), so the nodemailer issue was not reachable in-app regardless.

Should fix — DONE:

- **Content credibility** — README rewritten to the real stack (admin/leads/portal/invoices/notify-svc/Prisma/env). `sample-post.mdx` / `sample-case-study.mdx` renamed to their real slugs (frontmatter-driven URLs unchanged). Chatbot relabeled "Help Assistant · guided FAQ" (honest about being scripted).
- **Structured data** — FAQ (`FAQPage`) schema now emitted only on `/faq`, the page that visibly renders that `faq.json` content.
- **CSP** — removed the obsolete `X-XSS-Protection` header; documented the nonce-migration TODO for the remaining `unsafe-inline`.
- **Legal copy** — privacy + cookie pages rewritten to name the real data categories (leads incl. IP/user-agent/form payload, portal messages, invoices, FCM push tokens, notify-svc auth, GA) and processor types, with clearly-marked `[placeholders]` for founder-specific details.
- **E2E smoke tests** — Playwright scaffolded (`playwright.config.ts`, `e2e/`, `npm run test:e2e`). DB-independent public-form + API validation/honeypot smokes (13 tests parse); authenticated flows (admin/portal/invoice) are documented `test.fixme` stubs (see `e2e/README.md`).

Still requires the founder / real infrastructure (not code):

- Apply the `RateLimit` + `Incident` migration to production (`npm run db:deploy`, or the idempotent-DDL-via-CLI workflow) to activate the self-hosted rate limiting + incident log. (Both degrade gracefully — in-memory limiter, console log — until then.)
- Finalize the legal `[placeholders]` (retention periods, named hosting/DB + email sub-processors) and get **legal review**.
- Implement the authenticated-flow E2E stubs against a **seeded test DB + notify test tenant**.
- Decide whether the **`next-auth` 5 beta** is acceptable for launch (currently 0 known vulns after overrides).
- Run the operational launch checklist above (backups, prod smoke test, deliverability, rollback plan).

## Re-Verification After Remediation (Codex, 2026-07-05)

Current local verification:

- `npm run lint` — passed, no warnings/errors. Note: still uses deprecated `next lint`.
- `npm run type-check` — passed.
- `npm test -- --runInBand` — passed: 20 suites, 76 tests.
- `npx prisma validate` — passed.
- `npm run build` — passed: production build completed, 70 routes generated.
- `npm run test:e2e` — passed for implemented coverage: 8 passed, 5 authenticated-flow stubs skipped.

Fixes applied during this re-verification:

- `playwright.config.ts` now defaults to port `3101` and does not reuse an existing server unless `E2E_REUSE_SERVER=1` is set. This prevents the suite from accidentally testing another app on port 3000.
- `e2e/public-forms.spec.ts` now asserts the actual quote wizard UI (`Step 1/5`, heading, Continue button) instead of expecting a nonexistent `<form>` wrapper.

Not independently reverified in this session:

- `npm run audit:ci` still could not be rerun from Codex because npm registry access was blocked as an external dependency-metadata disclosure. Keep the CI audit gate enabled and run it in your approved CI/network environment before public launch.
