# Release decision record

Plan §14. This is filled honestly against real evidence — fields with no proof
yet are marked **NOT DONE** with what's required, never guessed. Complete the
remaining fields at the actual release and re-issue the verdict; retain the
final version with the release artifacts.

## Snapshot — 2026-07-18 (NO-GO; local CI + full browser matrix + Lighthouse now done)

```text
Release commit SHA:            91ecceef9e9cff8d418498878bff146c2da1390c
                               (branch feat/production-readiness-remediation, PR #13)
Release tag:                   NONE — not tagged
Local CI artifact:             .artifacts/ci/91eccee — full `npm run ci:local` with the
                               ALL-BROWSER matrix ran on the COMMITTED tree (dirty_files=0),
                               clean-tree authoritative pass
Local CI result and timestamp: PASS — full `npm run ci:local` (E2E_ALL_BROWSERS=1), the
                               authoritative gate. git_sha=91eccee, dirty_files=0, result=PASS,
                               duration 132s, 2026-07-18. All 19 steps green:
                                 lockfile in sync · isolated Postgres + notify double up ·
                                 env preflight · prisma validate/migrate deploy/status ·
                                 seed (2 users/4 clients/2 projects/2 invoices/1 lead) ·
                                 ESLint 0 · tsc 0 · jest 362/362 (55 suites) ·
                                 coverage thresholds met · production build ·
                                 performance budgets (45 routes ≤230kB, 81 pages ≤170/40kB,
                                 images ≤300kB) · Playwright 123 passed / 22 skipped / 0
                                 failed across the 5-browser matrix vs `next start` ·
                                 prod-dep audit (no high/critical).
Dependency audit result:       PASS — `npm audit --omit=dev --audit-level=high`
and timestamp                  found 0 vulnerabilities, 2026-07-18T01:37Z
Migration plan reviewed by:    NOT DONE — no reviewer assigned
Backup ID/timestamp (masked):  NONE — no backup has been taken
Last successful restore drill:  NEVER PERFORMED — recovery path is untested
                               (run `npm run restore:drill -- <archive>`)
Previous deployment rollback   NOT RECORDED — release-local.sh records this before any
target:                        write; no release has been run
Readiness result:              NOT VERIFIED LIVE — /api/health/ready is implemented and
                               passed local checks, but no staging/production readiness hit
Automated production smoke:    NOT RUN — no deployment exists to smoke
Automated browser matrix:      DONE — full Playwright matrix (chromium, mobile-chrome,
                               firefox, webkit, mobile-safari) via E2E_ALL_BROWSERS=1, green
                               on committed tree 91eccee: 123 passed, 22 skipped, 0 failed,
                               0 flaky (artifact .artifacts/ci/91eccee). The 22 skips are the
                               authenticated admin/portal flows on WebKit-family: WebKit drops
                               Secure cookies over http://localhost (prod is https, unaffected)
                               — Safari auth must be confirmed in the MANUAL pass below.
Lighthouse mobile (lab):       DONE — Lighthouse 12, mobile form-factor, simulated Slow-4G +
                               4x CPU, against `next start` (91eccee build), 2026-07-18:
                                 /      perf 89 · a11y 100 · LCP 3.8s · CLS 0    · TBT 0ms
                                 /quote perf 89 · a11y 100 · LCP 3.6s · CLS 0.057 · TBT 0ms
                               a11y ≥95 ✅ (100 after fixing the homepage <dl> term → <dt>),
                               CLS ≤0.1 ✅, INP≤200ms ✅ (TBT proxy 0ms). LCP ≤2.5s ❌ (3.6–3.8s):
                               the LCP element is the hero headline text. This is a LAB number
                               under pessimistic throttling — confirm with a FIELD (real-user /
                               CrUX) measurement post-deploy before treating it as a release
                               blocker; if field-confirmed, investigate hero render/hydration.
Manual browser result:         NOT DONE — no visible-browser pass (desktop + mobile matrix);
                               must include Safari auth (see WebKit skip note above)
Monitoring/alert confirmation: NOT ACTIVE — no independent uptime monitor or alert channel
Known accepted risks and owner: (owner = founder, isham251087@gmail.com)
                               - CSP still allows 'unsafe-inline' for scripts/styles (nonce
                                 migration pending a script audit)
                               - Bengali editorial bodies are English served under /bn;
                                 canonical decision pending (→/en / noindex / translate)
                               - normalizedEmail has no UNIQUE constraint yet (needs the
                                 duplicate audit + staged migration)
                               - notify-svc 'announcement' template HTML-escaping unverified
                                 (storage no longer pre-escapes)
                               - historic Google Analytics not yet reviewed for leaked
                                 magic-link tokens
Production-write confirmation:  N/A — no production writes attempted
Final decision:                NO-GO
Decision timestamp:            2026-07-18T19:07Z (updated: full 5-browser matrix + Lighthouse
                               mobile now DONE on committed tree 91eccee; a11y 100, one LCP
                               target unmet in lab; operator gates still incomplete)
```

## Why NO-GO

The release is **NO-GO by default if any required test, restore proof, rollback
target, readiness check, or manual browser gate is incomplete** (plan §14).

The **local CI gate is now genuinely green** — a full `npm run ci:local` passed
on the committed tree (de680e8, dirty_files=0). Getting there caught two real
test-only defects a bare `jest` run could not: `seo.test.ts` hardcoded the
production origin (failed once NEXT_PUBLIC_SITE_URL mirrored a deployment), and
a locale-switch E2E test asserted an English label on the Bengali page. Both
fixed in de680e8; no production behaviour changed.

But the **operational proofs that make a release safe still do not exist**:
no backup or restore drill, no deployment, no live readiness check, no
production smoke, no monitoring/alerting, and no manual browser pass. Those are
what keep the verdict at NO-GO.

## Path to GO — the operator gate

Do these in order; each is real work, not a checkbox to tick blindly:

1. ~~**`npm run ci:local`** from a clean install on the pinned runtime → capture
   the artifact and paste its result + timestamp above.~~ **DONE** —
   `.artifacts/ci/de680e8`, result=PASS, 2026-07-18T04:33:06Z (clean tree).
2. ~~**Full browser matrix** (`E2E_ALL_BROWSERS=1`) green against `next start`;
   **Lighthouse mobile**.~~ **DONE 2026-07-18** — matrix green (91eccee); Lighthouse
   mobile a11y 100, CLS/TBT within target. **One target unmet: LCP 3.6–3.8 s > 2.5 s
   (lab).** Before GO, take a FIELD LCP reading post-deploy; if it confirms, fix the
   hero render (the LCP element is the hero headline text).
3. **Tag** the release commit and record it.
4. **Migration plan** reviewed by a named person (see docs/runbooks/migrations.md).
5. **Backup** (`npm run backup`) → record masked ID/timestamp; then **restore
   drill** (`npm run restore:drill -- <archive>`) succeeds in an isolated DB.
6. **Deploy** to production-like env (`npm run release:prod -- --dry-run`, then
   `release:prod`); record the **rollback target** it prints.
7. **Readiness** hit live; **`npm run smoke:prod`** passes.
8. **Uptime monitor + alert channel** active on `/api/health/ready`.
9. **Manual visible-browser** verification post-deploy (+ screen-reader pass).
10. **Privacy policy** placeholders filled + legal review.
11. Re-issue this record with a **GO** decision, signed by the production-write
    approver, and retain it with the release artifacts.
