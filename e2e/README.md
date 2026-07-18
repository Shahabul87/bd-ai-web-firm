# End-to-end tests (Playwright)

These prove the pieces work together through a real browser + HTTP, against the
**production build** (`next start`) — never `next dev`. Dev mode differs from
what ships (route caching, error overlays, no minification, different
prerendering), so a green dev-mode suite proves nothing about the artifact being
released. Unit tests (Jest) cover the libraries.

## Running

The supported way is the full gate, which builds the app, brings up the isolated
services, seeds fixtures, and points the suite at the production server:

```bash
npm run ci:local
```

To iterate on a spec by hand, start the services first — the authenticated specs
**skip themselves** (loudly) if the notify double is not reachable:

```bash
npm run ci:up                       # isolated Postgres (5439) + notify double (4010)
npx playwright install chromium     # one-time
npm run test:e2e                    # builds + starts the production server
npm run test:e2e:ui                 # interactive
npm run ci:down                     # tear down
```

Against a deployed environment:

```bash
E2E_BASE_URL=https://staging.craftsai.org npm run test:e2e
```

## Browser matrix

`chromium` and `mobile-chrome` (Pixel 7) run by default. The rest are opt-in
because they need an extra download and triple the runtime:

```bash
npx playwright install firefox webkit
E2E_ALL_BROWSERS=1 npm run test:e2e   # + firefox, webkit, mobile-safari
```

## What's covered

`public-forms.spec.ts` — DB-independent smoke coverage: contact UI round-trip,
contact/quote/demo validation, honeypot, CORS preflight, quote wizard mount.

`authenticated-flows.spec.ts` — real multi-factor login driven through the UI (no
session is forged):

| Scenario | Asserts |
|---|---|
| Admin OTP login | email factor alone is not enough; the second factor is demanded |
| Non-allowlisted email | enumeration-safe response, yet **no challenge is issued** and a guessed code fails |
| Already-enrolled admin | never offered enrollment — email access alone cannot reset MFA |
| Lead triage | the seeded lead lists on `/admin` and its detail opens |
| Portal login | a client sees only their OWN project |
| Cross-tenant project | Client A gets 404 for Client B's project id |
| Portal-disabled client | no challenge issued; cannot sign in |
| Draft invoice | a client sees their SENT invoice, never the DRAFT — by list or direct URL |
| Cross-tenant invoice | Client B gets 404 for Client A's invoice |
| notify isolation | every recipient the suite touches is a `.test` address |

## How authentication is testable

`scripts/notify-double.mjs` stands in for notify-svc: it records every request,
**sends nothing**, and issues a deterministic challenge code that the test reads
back via `__captured/latest`. Fixtures come from `scripts/seed-ci.mjs` (fixed
`ci_*` ids). See `e2e/helpers/auth.ts`.

## Gotchas worth knowing

- **Serial by necessity.** Every test drives a real login from the same loopback
  IP and shares the double's captured state, so the file runs `mode: 'serial'`
  and `ci:local` sets `CI=1` (single worker). Concurrent *projects* otherwise
  stomp on each other's challenges.
- **Rate limits are reset per test.** Login allows 10 requests / 5 min per IP;
  the suite would throttle itself and report false failures.
- **Wait for the UI before inspecting the double.** A click fires an async POST;
  querying `__captured` immediately races the request.
- **Wait for the post-login redirect.** Sign-in completes via a server action; a
  `goto()` straight after can race the session cookie and land back on login.
