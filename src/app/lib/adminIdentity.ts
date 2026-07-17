import { prisma } from './db';
import { normalizeEmail } from './normalizeEmail';
import { reportError } from './report';

export interface AdminUserIdentity {
  id: string;
  email: string;
  totpEnrolled: boolean;
}

/**
 * Resolve the ONE admin User for an email, or null.
 *
 * Looks up `normalizedEmail` (exact match) rather than the case-sensitive
 * display `email`: normalizing only the INPUT would miss a row stored as
 * 'Bob@X.com' (verified), which would then be re-created as a second identity
 * with a fresh MFA state. Fails closed on ambiguity rather than guessing.
 */
export async function findAdminUser(email: string): Promise<AdminUserIdentity | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const matches = await prisma.user.findMany({
    where: { normalizedEmail },
    select: { id: true, email: true, totpEnrolled: true },
    take: 2,
  });
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    reportError('admin.identity.ambiguous', new Error('multiple users share a normalized email'), {
      severity: 'warn',
      meta: { userIds: matches.map((m) => m.id) },
    });
    return null;
  }
  return matches[0];
}

/**
 * Find the admin User for an email, creating it if absent. Replaces
 * `upsert({ where: { email } })`, which could not see a pre-existing
 * mixed-case row and so created a duplicate identity.
 */
export async function findOrCreateAdminUser(
  email: string,
  data: { totpEnrolled?: boolean } = {},
): Promise<AdminUserIdentity | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const existing = await findAdminUser(normalizedEmail);
  if (existing) {
    if (data.totpEnrolled !== undefined && data.totpEnrolled !== existing.totpEnrolled) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { totpEnrolled: data.totpEnrolled },
      });
      return { ...existing, totpEnrolled: data.totpEnrolled };
    }
    return existing;
  }

  // New identities are always stored canonically (email === normalizedEmail).
  return prisma.user.create({
    data: {
      email: normalizedEmail,
      normalizedEmail,
      role: 'ADMIN',
      totpEnrolled: data.totpEnrolled ?? false,
    },
    select: { id: true, email: true, totpEnrolled: true },
  });
}
