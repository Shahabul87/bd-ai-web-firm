# End-to-end tests (Playwright)

Smoke tests for the production flows. Unit tests (Jest) cover the libraries; these
prove the pieces work together through a real browser + HTTP.

## Running

```bash
npx playwright install chromium   # one-time: download the browser
npm run test:e2e                  # starts `npm run dev` and runs the suite
npm run test:e2e:ui               # interactive UI mode
```

By default Playwright starts the dev server on `http://localhost:3000`. To run
against an already-running or remote deployment:

```bash
E2E_BASE_URL=https://staging.craftsai.org npm run test:e2e
```

## What's covered now

`public-forms.spec.ts` — **DB-independent** smoke coverage that runs anywhere:

- Contact form UI round-trip (fill → submit → terminal status renders).
- Contact / quote / demo API validation returns `400` with field errors.
- Honeypot submissions return `200` without persisting.
- CORS preflight (`OPTIONS`) returns `200`.
- Quote multi-step wizard mounts.

> The contact UI test tolerates the graceful `503` "try again" path when no
> database is configured. Once you point it at a seeded test DB, tighten it to
> assert the success message specifically.

## What still needs a test environment (`authenticated-flows.spec.ts`)

These are `test.fixme` stubs. To implement them you need:

1. **A seeded test Postgres** with:
   - an admin email present in `ADMIN_EMAILS`,
   - a client with `enabled = true`, at least one project, and one invoice.
2. **Deterministic auth** — either rely on the built-in dev auth fallback
   (`src/app/lib/devAuth.ts`, active when notify-svc is unconfigured outside
   production) or a notify-svc **test tenant** whose challenge codes the test can
   read back.
3. Saved auth `storageState` per role (admin, client) to skip re-login per test.

Flows to implement: admin login (allowlisted + rejected), lead triage + status
change, client portal login + project scoping (incl. cross-client access denial),
and invoice create → send → client view.
