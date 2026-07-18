# Runbook — Local CI (`npm run ci:local`)

`ci:local` is the **authoritative** build/test gate. A release must pass it. It
runs entirely on this machine and is versioned in this repo, so a release never
depends on a hosted CI service being available.

## Prerequisites

| Requirement | Why |
|---|---|
| Node 22 (`.node-version`) | The pipeline refuses a major-version mismatch. `nvm use` picks it up. |
| Docker running | It starts an isolated Postgres + notify double. |
| Network (for `npm audit`) | The audit is an online gate; offline is reported, never silently passed. |

Nothing else. It does **not** use your `.env`, your dev database, or a running
dev server.

## Normal use

```bash
npm run check:fast   # seconds — lint + types + unit tests, before every push
npm run ci:local     # ~45s — the full gate, before every release
```

`check:fast` is deliberately **not** a substitute: it starts no containers and no
server, so it cannot catch a migration, browser, or integration failure.

## What it does, in order

1. Check Node/npm/docker versions and the daemon.
2. Report worktree state (CI may inspect a dirty tree; `release:prod` refuses one).
3. Verify the lockfile is in sync (`npm ci --dry-run`).
4. Start isolated Postgres (**5439**) + the notify double (**4010**) and wait for health.
5. **Fail-closed env preflight** — nothing that can write runs until this passes.
6–9. `prisma validate` → `migrate deploy` → `migrate status` → generate + velite + seed.
10–11. ESLint (zero warnings) → TypeScript.
12–13. Jest with open-handle detection → coverage thresholds.
14–16. Production build → `next start` → Playwright **against the production build**.
17. `npm audit` (production deps, high+).
18. Record evidence.

## Isolation guarantees

- **Its own database.** Postgres on 5439 with `tmpfs` storage — nothing survives a
  run, so one run's result can never depend on a previous one. Your dev DB
  (5438) is never touched.
- **No real email or push, ever.** `NOTIFY_URL` points at `scripts/notify-double.mjs`,
  which records requests and sends nothing. The preflight rejects any other
  notify host, and rejects real recipient domains (gmail, craftsai.org, …).
- **Writes are opt-in.** `ALLOW_TEST_WRITES=1` is granted by the script only
  *after* every safety check passes, and only for that run.
- **A non-test `DATABASE_URL` is neutralized in Jest** (`jest.setup.js`), so even
  a test that forgets to mock Prisma cannot reach a real database.

## Evidence

Each run writes to `.artifacts/ci/<git-sha>/` (gitignored):

```
summary.txt      step list, versions, git sha, duration, result
preflight.log    which checks ran (names + masked status — never a value)
jest.log  lint.log  typecheck.log  coverage.log  build.log
playwright.log  next-start.log  prisma.log  velite.log  audit.log  compose.log
```

## Diagnosing a failure

The script prints `FAILED at step N` and the log to read is named after the step.

| Symptom | Cause / fix |
|---|---|
| `REFUSING TO RUN — not safe for test writes` | Working as designed. Read `preflight.log`: a variable points somewhere real. Never "fix" this by loosening the guard. |
| `Node major mismatch` | `nvm use` (reads `.node-version`). |
| `lockfile out of sync` | `npm install`, commit `package-lock.json`. |
| `migrations pending or divergent` | A migration exists that `migrate deploy` will not apply — see `prisma.log`. |
| `production server did not become ready` | Read `next-start.log`. Usually env validation refusing to boot. |
| `tests` failed | Read `jest.log`. The **exit code** decides, not the assertion count. |
| Docker services unhealthy | `npm run ci:down` then retry; check ports 5439/4010 are free. |

## Cleanup

Automatic. A trap tears down containers, kills the server and frees the port on
success, failure **and** Ctrl-C — verified. If you ever need it manually:

```bash
npm run ci:down
```

## Things this pipeline deliberately does NOT do

- It does not deploy. Passing tests do not authorize a production write — that is
  `release:prod` (see `docs/runbooks/release.md`).
- It does not replace visible browser testing. See the manual browser test plan.
- It does not treat an offline `npm audit` as a pass.
