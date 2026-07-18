import { createHash, randomBytes } from 'crypto';
import { prisma } from './db';
import { normalizeEmail } from './normalizeEmail';

/** SHA-256 of the opaque bearer token. Only the hash is ever persisted. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Single-use proof that ALL login factors passed for `email`. Auth.js's
 * Credentials provider trusts nothing except a freshly-redeemed ticket.
 *
 * The returned value is a high-entropy random token; only its hash is stored,
 * so neither DB-read nor log access can redeem a live ticket. The email is
 * stored normalized so the redeemed identity is always canonical.
 */
export async function issueTicket(
  email: string,
  scope: 'admin' | 'portal' = 'admin',
): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.authTicket.create({
    data: {
      tokenHash: hashToken(token),
      email: normalizeEmail(email),
      scope,
      expiresAt: new Date(Date.now() + 2 * 60_000),
    },
    select: { id: true },
  });
  return token;
}

/**
 * Returns the email and burns the ticket if fresh, unexpired, AND its scope
 * matches — else null. The burn is a SINGLE atomic conditional update, so two
 * concurrent redemptions of the same ticket can never both succeed: exactly one
 * flips `usedAt` from null (affecting one row); the loser sees zero rows.
 */
export async function redeemTicket(
  token: string,
  scope: 'admin' | 'portal' = 'admin',
): Promise<string | null> {
  const tokenHash = hashToken(token);
  const burned = await prisma.authTicket.updateMany({
    where: { tokenHash, scope, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (burned.count !== 1) return null;
  const t = await prisma.authTicket.findUnique({
    where: { tokenHash },
    select: { email: true },
  });
  return t?.email ?? null;
}

/**
 * Delete used or expired tickets. Intended to be called by the retention job.
 * Returns the number of rows removed.
 */
export async function cleanupExpiredTickets(): Promise<number> {
  const res = await prisma.authTicket.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] },
  });
  return res.count;
}
