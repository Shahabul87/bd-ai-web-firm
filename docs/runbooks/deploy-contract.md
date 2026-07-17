# Runbook — Deployment contract (Cloudflare → Railway)

What each layer owns, and the assumptions the code makes about them. When one of
these stops being true, something breaks quietly — so this is the reference to
check when behaviour looks impossible.

## Topology

```
visitor → Cloudflare (DNS, TLS, proxy/CDN) → Railway (app container) → Railway Postgres
                                                   ↘ notify-svc (separate service)
```

## Who owns what

| Concern | Owner | Notes |
|---|---|---|
| DNS + certificate | Cloudflare | Public TLS terminates here. |
| Origin TLS | Railway | Cloudflare → Railway is TLS; the app itself speaks HTTP inside the container. |
| Client IP | **Cloudflare** | Sets `CF-Connecting-IP`, overwriting any client-supplied value. |
| App runtime | Railway | Nixpacks; Node pinned by `.node-version`. |
| Database | Railway Postgres | Private network; public proxy URL exists for CLI work. |
| Email/push | notify-svc | A separate service — deliberately NOT in the app's failure domain. |
| Secrets | Railway env | Never in the repo. Validated at boot by `src/app/lib/env.ts`. |

## Assumptions the code makes

- **`CF-Connecting-IP` is trustworthy, `X-Forwarded-For` is not.**
  Rate limiting reads `CF-Connecting-IP` first (`src/app/utils/rateLimit.ts`).
  XFF is client-appendable, so its left-most value was spoofable — an attacker
  could rotate it to defeat per-IP limits. **If Cloudflare is ever bypassed (an
  origin URL hit directly), that header disappears and the limiter falls back to
  the shared `unknown` bucket.** Keep the origin unreachable except via Cloudflare.
- **`NEXT_PUBLIC_SITE_URL` is the canonical origin.** Emails, sitemap, RSS,
  canonical tags and JSON-LD all derive from it (`src/app/lib/siteUrl.ts`). Unset
  it on a staging deploy and staging will advertise production URLs.
- **`RAILWAY_GIT_COMMIT_SHA` identifies the build.** Health responses echo it, so
  "is the thing I deployed the thing that is serving?" is answerable.

## Health and restarts (`railway.json`)

- `healthcheckPath: /api/health/ready` — a new deploy must prove it can reach the
  database and that the schema has no failed migration **before** taking traffic.
  A broken deploy therefore never replaces a working one.
- `restartPolicyType: ON_FAILURE` — restarts on process exit only.
- **Liveness (`/api/health/live`) deliberately checks nothing.** If restarts were
  driven by dependency health, a brief database blip would restart a healthy
  container and turn a recoverable outage into a real one.

## Migrations are applied by CLI, never at container start

This is a hard-won rule (see `CLAUDE.md`): a build-time `prisma migrate deploy`
that fails is recorded as a FAILED migration, after which Prisma refuses every
later migration (**P3009**), the deploy fails, Railway keeps serving the previous
container, and **every subsequent push silently does not ship** while the app
looks fine.

So: apply idempotent, additive DDL via CLI as the owner role *before* deploying
the code that needs it (expand → deploy → contract later). `/api/health/ready`
reports a failed-migration row, so the trap surfaces in seconds rather than days.
See `docs/runbooks/migrations.md`.

## Rollback

Application rollback = redeploy the previous SHA (Railway keeps prior
deployments). `scripts/release-local.sh` records the current deployment as the
rollback target *before* it changes anything.

Prefer a **forward fix** for data. Restore only for corruption/data-loss, with
explicit confirmation — see `docs/runbooks/rollback.md`.

## Operator checklist when something looks impossible

1. `curl https://<host>/api/health/live` — is the process even up?
2. `curl https://<host>/api/health/ready` — database and migrations ok?
3. Compare the `commit` in that response with what you expect to be deployed.
   If they differ, a deploy failed and the OLD container is still serving.
4. If readiness says `migrations: fail`, go to `docs/runbooks/migrations.md`.
