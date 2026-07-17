import { prisma } from './db';
import { normalizeEmail } from './normalizeEmail';

/**
 * Single-use proof that ALL login factors passed for `email`. Auth.js's
 * Credentials provider trusts nothing except a freshly-redeemed ticket.
 * The email is stored normalized so the redeemed identity is always canonical.
 */
export async function issueTicket(
  email: string,
  scope: 'admin' | 'portal' = 'admin',
): Promise<string> {
  const t = await prisma.authTicket.create({
    data: { email: normalizeEmail(email), scope, expiresAt: new Date(Date.now() + 2 * 60_000) },
    select: { id: true },
  });
  return t.id;
}

/**
 * Returns the email and burns the ticket if fresh, unexpired, AND its scope
 * matches — so an admin ticket can never mint a portal session or vice-versa.
 * Else null.
 */
export async function redeemTicket(
  id: string,
  scope: 'admin' | 'portal' = 'admin',
): Promise<string | null> {
  const t = await prisma.authTicket.findUnique({ where: { id } });
  if (!t || t.usedAt || t.expiresAt.getTime() < Date.now() || t.scope !== scope) return null;
  await prisma.authTicket.update({ where: { id }, data: { usedAt: new Date() } });
  return t.email;
}
