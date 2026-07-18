# Release decision record

Plan §14. This is filled honestly against real evidence — fields with no proof
yet are marked **NOT DONE** with what's required, never guessed. Complete the
remaining fields at the actual release and re-issue the verdict; retain the
final version with the release artifacts.

## Snapshot — 2026-07-18 (NO-GO)

```text
Release commit SHA:            2f3f160fe53e922f43d472522dc0e20d1270fb37
                               (branch feat/production-readiness-remediation, PR #13)
Release tag:                   NONE — not tagged
Local CI artifact:             NONE for this SHA — `npm run ci:local` has NOT run on 2f3f160
                               (.artifacts/ci/ holds only earlier commits 6608900, cb6c7bb)
Local CI result and timestamp: PARTIAL / not the authoritative gate.
                               Ran this session on the 2f3f160 tree (2026-07-18 ~01:37Z):
                                 ESLint --max-warnings=0 → 0
                                 tsc --noEmit           → 0
                                 jest                   → 362/362 passed
                                 next build             → success
                                 check:budgets          → all enforced budgets pass
                               NOT run: full `npm run ci:local` (isolated Postgres + notify
                               double + coverage ratchet + Playwright vs `next start`).
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
Decision timestamp:            2026-07-18T01:37Z
```

## Why NO-GO

The release is **NO-GO by default if any required test, restore proof, rollback
target, readiness check, or manual browser gate is incomplete** (plan §14). All
of those are currently incomplete. Implementation of Phases 1–7 is done and every
*local* gate is green, but the operational proofs that make a release safe do not
exist yet.

## Path to GO — the operator gate

Do these in order; each is real work, not a checkbox to tick blindly:

1. **`npm run ci:local`** from a clean install on the pinned runtime → capture
   `.artifacts/ci/2f3f160.../` and paste its result + timestamp above.
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
