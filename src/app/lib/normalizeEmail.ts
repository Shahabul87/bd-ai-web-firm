/**
 * Canonical email normalization for identity.
 *
 * Every place that uses an email as an identity key — allowlist checks, auth
 * challenges, tickets, cookies, audit writes, trust-service calls, and Prisma
 * reads/writes — MUST normalize through this helper first. Without it,
 * `Bob@x.com` and `bob@x.com` resolve to different identities (PostgreSQL
 * treats the unique `email` string as case-sensitive), which lets a caller
 * create a second account or reopen MFA enrollment under a case variant.
 *
 * Normalization = trim surrounding whitespace + lowercase the whole address.
 * The local part is technically case-sensitive per RFC 5321, but every real
 * mail provider treats it case-insensitively, and the admin allowlist already
 * lowercased for comparison — this makes that behavior the single, explicit,
 * system-wide rule. It is idempotent: normalizeEmail(normalizeEmail(x)) === normalizeEmail(x).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
