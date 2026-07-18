# Release decision record

Plan §14. This is filled honestly against real evidence — fields with no proof
yet are marked **NOT DONE** with what's required, never guessed. Complete the
remaining fields at the actual release and re-issue the verdict; retain the
final version with the release artifacts.

## Snapshot — 2026-07-18 (NO-GO; local CI gate now green)

```text
Release commit SHA:            de680e8b5cff964631a29763f6d846f6b0faa57c
                               (branch feat/production-readiness-remediation, PR #13)
Release tag:                   NONE — not tagged
Local CI artifact:             .artifacts/ci/de680e8 — full `npm run ci:local` ran on the
                               COMMITTED tree (dirty_files=0), clean-tree authoritative pass
Local CI result and timestamp: PASS — full `npm run ci:local`, the authoritative gate.
                               git_sha=de680e8, dirty_files=0, result=PASS, duration 77s,
                               started 2026-07-18T04:31:49Z / finished 2026-07-18T04:33:06Z.
                               All 19 steps green:
                                 lockfile in sync · isolated Postgres + notify double up ·
                                 env preflight · prisma validate/migrate deploy/status ·
                                 seed (2 users/4 clients/2 projects/2 invoices/1 lead) ·
                                 ESLint 0 · tsc 0 · jest 362/362 (55 suites) ·
                                 coverage thresholds met · production build ·
                                 performance budgets (45 routes ≤230kB, 81 pages ≤170/40kB,
                                 images ≤300kB) · Playwright 58/58 vs `next start` ·
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
Manual browser result:         NOT DONE — no visible-browser pass (desktop + mobile matrix)
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
Decision timestamp:            2026-07-18T04:33Z (updated: local CI gate now PASS on
                               committed tree de680e8; operator gates still incomplete)
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
2. **Full browser matrix** (`E2E_ALL_BROWSERS=1`, after `npx playwright install
   firefox webkit`) green against `next start`; **Lighthouse mobile** LCP ≤ 2.5 s,
   CLS ≤ 0.1, INP ≤ 200 ms, a11y ≥ 95.
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
