# Runbook — Production migrations

## The rule

**Apply production DDL via the CLI, as the owner role, BEFORE deploying the code
that needs it. Never at container start.**

## Why (this has bitten this project repeatedly)

A migration applied at container start that fails is recorded as a **failed
migration**. Prisma then refuses every later migration (**P3009**). The deploy
fails, the platform keeps serving the **previous container**, and every
subsequent push silently does not ship — while the site looks perfectly fine.
The bug you "fixed" three deploys ago is still live and nothing told you.

`/api/health/ready` now reports `migrations: fail` when such a row exists, so the
trap surfaces in seconds instead of days.

## Expand → deploy → contract

Never rename or drop in one step. Old and new code must both work against the
schema at every instant.

1. **Expand** — additive + idempotent only: `ADD COLUMN IF NOT EXISTS` (nullable
   or defaulted), `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
2. **Backfill** — separately, in batches, safe to re-run.
3. **Deploy** the code that uses it.
4. **Contract** — only once nothing reads the old shape, and as its own change.

Adding a `NOT NULL` column with no default to a populated table is an outage.

## Applying a change

```bash
# 1. Reachable prod URL with OWNER creds — WITHOUT printing it.
#    app_runtime lacks DDL permission; using it is the usual cause of a failure.
PUBURL=$(railway run --service Postgres -- printenv DATABASE_PUBLIC_URL | tail -1)

# 2. Check the CURRENT state first (see the warning below).
docker exec -e U="$PUBURL" <local-pg-container> sh -c 'psql "$U" -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at FROM \"_prisma_migrations\" \
   WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL;"'

# 3. Apply idempotent DDL (URL via env, never argv — argv is visible in ps).
docker exec -e U="$PUBURL" <local-pg-container> sh -c 'psql "$U" -v ON_ERROR_STOP=1 -c \
  "ALTER TABLE \"X\" ADD COLUMN IF NOT EXISTS \"y\" TEXT;"'

# 4. Keep the schema source of truth in step: edit prisma/schema.prisma,
#    npx prisma generate. Keep the diff MINIMAL.

# 5. If a migration FILE exists for this change, mark it applied so the build
#    never re-runs it:
DATABASE_URL="$PUBURL" npx prisma migrate resolve --applied <migration_name>
```

> ### `migrate status` LIES
> It can report "up to date" while a **failed** row sits in `_prisma_migrations`.
> Trust the SQL in step 2 and `migrate deploy` — not `status`.
>
> **Done = `migrate status` says up to date AND
> `SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NULL AND rolled_back_at IS NULL` = 0.**
> Anything else is a latent P3009 trap.

## Unblocking a failed deploy (P3009)

1. Find the failed migration (the SQL above).
2. Decide what actually happened:
   - Its objects **already exist** → `prisma migrate resolve --applied <name>`
   - It applied **nothing** → `prisma migrate resolve --rolled-back <name>`
3. Repeat until zero unfinished rows, so the next deploy finds "no pending
   migrations" and boots clean.
4. Re-check `/api/health/ready` → `migrations: ok`.

Before any `ADD CONSTRAINT`, re-check for orphan rows: a FK validates existing
data and will hard-fail on one.

## Safety

- Every production write needs explicit confirmation. **Reads** (`SELECT`,
  `information_schema`, `_prisma_migrations`) are fine for diagnosis.
- Take a backup before schema work: `npm run backup`.
- Never `migrate reset`, `db push --accept-data-loss`, `DROP`, or `TRUNCATE`
  against production. Ever.

## Outstanding, operator-gated

- **`normalizedEmail` uniqueness** — the column is added and backfilled, but the
  UNIQUE constraint needs a duplicate audit first (`npm run report:dup-emails`)
  and a manual merge of anything it finds. Auto-merging identities is forbidden.
  See `email-identity-migration.md`.
