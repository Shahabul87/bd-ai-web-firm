import { prisma } from './db';

/**
 * Single-use proof that ALL login factors passed for `email`. Auth.js's
 * Credentials provider trusts nothing except a freshly-redeemed ticket.
 */
export async function issueTicket(email: string): Promise<string> {
  const t = await prisma.authTicket.create({
    data: { email, expiresAt: new Date(Date.now() + 2 * 60_000) },
    select: { id: true },
  });
  return t.id;
}

/** Returns the email and burns the ticket if fresh & unexpired; else null. */
export async function redeemTicket(id: string): Promise<string | null> {
  const t = await prisma.authTicket.findUnique({ where: { id } });
  if (!t || t.usedAt || t.expiresAt.getTime() < Date.now()) return null;
  await prisma.authTicket.update({ where: { id }, data: { usedAt: new Date() } });
  return t.email;
}
