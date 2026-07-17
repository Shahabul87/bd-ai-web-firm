# Runbook — Email identity canonicalization (Phase 1 Task 1.2)

## What is already done (app layer, shipped)

Every admin/portal identity boundary now normalizes email through
`normalizeEmail()` (`src/app/lib/normalizeEmail.ts`) = trim + lowercase:
allowlist checks, auth challenges, tickets, challenge cookies, User upserts,
and the portal client lookup. `ADMIN_EMAILS` is validated (unique, valid) at
production startup. New logins therefore cannot create case-variant duplicates.

## What is operator-gated (needs the real database)

Adding a **unique** constraint on the normalized email cannot be done blindly:
if two rows already differ only by case, the constraint fails, and auto-merging
production identities is forbidden. Do this in order.

### 1. Audit duplicates (read-only)

```bash
DATABASE_URL=<prod-or-copy> npm run report:dup-emails
```

Exit 0 → no duplicates, safe to proceed. Exit 1 → merge the listed groups
manually first (reassign child rows, then remove the redundant identity through
the normal product workflow — never `DELETE` blindly).

### 2. Expand migration (additive, nullable — safe)

Add the column and backfill without a constraint yet:

```sql
ALTER TABLE "User"   ADD COLUMN IF NOT EXISTS "normalizedEmail" text;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "normalizedEmail" text;
UPDATE "User"   SET "normalizedEmail" = lower(btrim(email)) WHERE "normalizedEmail" IS NULL;
UPDATE "Client" SET "normalizedEmail" = lower(btrim(email)) WHERE "normalizedEmail" IS NULL;
```

Keep `prisma/domains`/`schema.prisma` in sync and `prisma generate`.

### 3. Verify no collisions, then add uniqueness (later migration)

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "User_normalizedEmail_key"   ON "User"("normalizedEmail");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "Client_normalizedEmail_key" ON "Client"("normalizedEmail");
```

### 4. Switch reads to `normalizedEmail`, then make it required

Only after uniqueness holds in prod. Follow the CLAUDE.md prod-migration rule:
apply idempotent DDL via CLI as the owner role, then `prisma migrate resolve`.

> All prod DB writes require explicit operator confirmation. Reads (the audit in
> step 1) are fine for diagnosis.
