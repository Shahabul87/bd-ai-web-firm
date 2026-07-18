# Runbook — Releasing to production

**Passing tests do not authorize a production write.** `ci:local` answers "is this
commit good?". This answers "am I allowed to ship it, do I know how to undo it,
and did it actually work?"

## The short version

```bash
npm run ci:local                  # must PASS on the exact commit you are shipping
npm run backup                    # fresh encrypted backup you hold
npm run release:prod -- --dry-run # every precondition, writes nothing
npm run release:prod              # asks you to type: deploy <sha>
```

## Before you start

| Requirement | Why |
|---|---|
| Clean tree, on `main`, in sync with origin | The thing released must be the thing reviewed. |
| `ci:local` PASS **for this SHA** | The script refuses otherwise; an older run's verdict would be releasing untested code. |
| Backup < 24h old | You cannot undo data you do not have. |
| `RAILWAY_TOKEN`, `railway` CLI | Deploy + rollback. |
| Schema changes already applied | Migrations are applied by CLI **before** the code that needs them — see `migrations.md`. |

## What the script does, and where it stops

1–2. Refuses a dirty tree, detached HEAD, wrong branch, out-of-sync branch, or an existing tag.
3. Requires a passing `ci:local` report for this exact SHA.
4. Checks production config **by name only** — never prints a value.
5. **Reads the currently-deployed commit and records it as the rollback target.** Before anything changes.
6. Requires a fresh backup; warns if no restore drill is recorded.
7. Shows migration status **read-only**.
   → `--dry-run` stops here. Nothing has been written.
8. **You type `deploy <sha>`.** Anything else aborts.
9–11. Deploys the immutable SHA and writes `.artifacts/releases/<sha>/manifest.txt`.
12. Polls readiness, and checks **the serving commit actually changed**.
13. Runs the read-only smoke suite.
14. **You look at it in a real browser** and type `verified`.
15. Tags the release only after all of the above.

Any failure from step 12 onward rolls back to the recorded target.

## Why the manual browser step is not optional

Automated checks prove the app responds. They do not prove the page is right.
"It compiles / tests pass" is not "I saw it work". For any user-facing change,
open a visible browser and use the thing you changed.

## After a release

Record in `.artifacts/releases/<sha>/manifest.txt` (the script writes most of it):

```text
Release commit SHA:        Release tag:
Local CI artifact:         Local CI result + timestamp:
Backup ID/timestamp (masked):   Last successful restore drill:
Previous deployment rollback target:
Readiness result:          Smoke result:        Manual browser result:
Monitoring/alert confirmation:
Known accepted risks + owner:
Production-write confirmed by:      Final decision: GO / NO-GO
```

Push the tag: `git push origin <tag>`.

## NO-GO by default

The release is **NO-GO** if any of these is missing: a P0/P1 item, a required
test, restore proof, a rollback target, the readiness check, or the manual
browser gate. Shipping without one of those is a decision to find out in
production.

## If something goes wrong

- Readiness/smoke failed → the script rolls back; see `rollback.md`.
- Deployed SHA ≠ expected → the deploy did **not** take effect and the old
  container is still serving. Check the build logs; a failed migration (P3009) is
  the usual cause — see `migrations.md`.
- Something is on fire → `incident-response.md`.
