# Runbook — Incident response (solo operator)

Written for the realistic case: one person, possibly on a phone, possibly at
3am. Optimised for "what do I type first", not completeness.

## First 60 seconds

```bash
curl -s https://www.craftsai.org/api/health/live    # is the process up?
curl -s https://www.craftsai.org/api/health/ready   # can it serve? which checks fail?
```

`ready` tells you where to go:

| Response | Meaning | Go to |
|---|---|---|
| live 200, ready 200 | App is fine — suspect Cloudflare/DNS | §Cloudflare |
| live 200, ready 503 `database: fail` | Cannot reach Postgres | §Database |
| live 200, ready 503 `migrations: fail` | Failed migration (P3009) | `migrations.md` |
| live fails / no response | Process down or platform issue | §App down |
| `commit` ≠ what you deployed | The deploy never took effect | `release.md` |

For the *why*, add the operator token (never public):

```bash
curl -s -H "x-health-detail-token: $HEALTH_DETAIL_TOKEN" https://www.craftsai.org/api/health/ready
```

## Severity

| Sev | Looks like | Response |
|---|---|---|
| **1** | Site down, data loss, auth bypass, tenant data leak | Drop everything. Roll back first, diagnose after. |
| **2** | Revenue path broken (contact/quote fails), invoices not delivering, portal login down | Same session. |
| **3** | Degraded: notifications queued, slow, one page broken | Same day. |
| **4** | Cosmetic/minor | Backlog. |

**Roll back first, diagnose later.** A rollback is seconds and reversible; a live
investigation is not. See `rollback.md`.

## Provider access

| What | Where |
|---|---|
| App + Postgres | Railway dashboard → project → service |
| DNS/TLS/WAF | Cloudflare dashboard |
| Email/push | notify-svc (separate service — a DB outage does NOT stop alerts) |
| Failed-deploy logs | Railway GraphQL `deploymentLogs(deploymentId)` — the CLI will not show a *failed* deploy's logs. Token: `~/.railway/config.json` → `user.token` |

## §App down

1. Railway → Deployments. Is the latest FAILED? → the old container may still be
   serving; read the build log.
2. Crash loop? → `restartPolicyMaxRetries` is 3; check the deploy log for an env
   validation failure (the app **refuses to boot** on invalid config — by design).
3. Recent deploy? → roll back (`rollback.md`).

## §Database

1. Railway → Postgres → is the service up? Recently restarted?
2. Liveness stays 200 during a DB outage **by design** — the app is fine, its
   dependency is not. Do not restart the app hoping to fix Postgres.
3. Forms fail honestly (503) rather than pretending to succeed; leads are not
   silently lost.
4. When Postgres returns, readiness recovers on its own (**verified: ~1s**). No
   app restart needed.

## §Cloudflare

1. Cloudflare status page; is the origin reachable directly?
2. **If Cloudflare is bypassed, `CF-Connecting-IP` disappears and rate limiting
   falls back to one shared bucket** — see `deploy-contract.md`.

## Notify-svc outage

Do **not** panic: business data is safe. Since the transactional outbox
(`src/app/lib/outbox.ts`), a committed invoice/lead keeps its notification queued
as `PENDING` and the worker retries with backoff. Nothing is lost.

```bash
# What is stuck?
DATABASE_URL=… node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
p.outboxEvent.groupBy({by:['status'],_count:true}).then(r=>{console.log(r);return p.\$disconnect()})"
```

Dead-lettered events (`DEAD`) are retryable by an admin once notify is healthy.

## Compromised auth secret

1. Rotate `AUTH_SECRET` / `PORTAL_AUTH_SECRET` in Railway (they **must differ** —
   env validation enforces it). Rotating invalidates all sessions: that is the point.
2. Redeploy.
3. Expire outstanding challenges/tickets: `npm run retention -- --apply` clears
   expired/used auth tickets.
4. Review `AuditLog` for the exposure window (`mfa.*`, `login.*`).
5. Record it. See `incident-2026-07-16-magic-link-analytics.md` for the format.

## Evidence — before you fix it

Fixing destroys evidence. Cheap to capture, impossible to recover:

```bash
curl -s .../api/health/ready > /tmp/incident-health.json
railway logs > /tmp/incident-logs.txt          # or GraphQL for a failed deploy
# Incidents are already recorded in Postgres (/admin/incidents) with secrets redacted.
```

For suspected data damage: **back up the damaged database before touching it**.

## After

1. What broke, when, who/what noticed, how long.
2. **Why did no alert fire?** — usually the most valuable answer.
3. One concrete prevention, with an owner. Add a regression test if code was at fault.

---

## OPERATOR ACTIONS — OUTSTANDING

These cannot be done from the repo and are the founder's:

- [ ] **Independent uptime monitor** on `/api/health/ready` from outside
      Railway/Cloudflare. Monitoring that only runs on the founder's laptop is
      not monitoring. Alert on 503 and on the deployed `commit` changing unexpectedly.
- [ ] **Independent alert channel** for readiness failures, dead-letter events,
      auth abuse and elevated 5xx — reaching a phone, not an inbox nobody watches.
      (`OBSERVABILITY_WEBHOOK_URL` is the app-side hook; it needs a destination.)
- [ ] **Deploy annotation** into monitoring, so "it broke at 14:02" can be lined
      up against "I deployed at 14:01".
- [ ] **Who is contacted if the operator is unavailable?** Decide and write it here.
- [ ] **One tabletop exercise**: database outage, notify outage, bad migration,
      compromised auth secret. Walk this runbook and fix whatever is wrong in it.
- [ ] **First restore drill** (`rollback.md`) — still never performed.
