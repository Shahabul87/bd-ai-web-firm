-- Add a hashed bearer-token column to AuthTicket. The raw single-use token is
-- never persisted; only its SHA-256 hash is stored and looked up. Nullable so
-- pre-existing id-based rows remain valid (they expire within 2 minutes).
-- Idempotent/additive so it is safe to re-run and safe to apply in production.
ALTER TABLE "AuthTicket" ADD COLUMN IF NOT EXISTS "tokenHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "AuthTicket_tokenHash_key" ON "AuthTicket"("tokenHash");
