-- Canonical identity key for User and Client: lower(btrim(email)).
--
-- Why: PostgreSQL string equality is case-sensitive, so a row stored as
-- 'Bob@Example.COM' is NOT found by the normalized login email — verified: an
-- existing mixed-case client could no longer sign in. Prisma's
-- mode:'insensitive' is not a safe alternative for identity because it compiles
-- to ILIKE, where '_' and '%' inside an address act as wildcards (verified:
-- equals 'wild_test@x.com' matched 'wildXtest@x.com'), which could resolve to a
-- DIFFERENT tenant's row.
--
-- Additive and idempotent: nullable column + backfill, NO unique constraint yet.
-- Uniqueness requires the duplicate audit first (npm run report:dup-emails) —
-- see docs/runbooks/email-identity-migration.md. Backfilling a derived column
-- neither merges nor deletes any identity.
ALTER TABLE "User"   ADD COLUMN IF NOT EXISTS "normalizedEmail" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "normalizedEmail" TEXT;

UPDATE "User"   SET "normalizedEmail" = lower(btrim(email)) WHERE "normalizedEmail" IS NULL;
UPDATE "Client" SET "normalizedEmail" = lower(btrim(email)) WHERE "normalizedEmail" IS NULL;

CREATE INDEX IF NOT EXISTS "User_normalizedEmail_idx"   ON "User"("normalizedEmail");
CREATE INDEX IF NOT EXISTS "Client_normalizedEmail_idx" ON "Client"("normalizedEmail");
