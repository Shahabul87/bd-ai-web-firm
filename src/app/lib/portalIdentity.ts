import { prisma } from './db';
import { normalizeEmail } from './normalizeEmail';
import { reportError } from './report';

export interface PortalIdentity {
  id: string;
  email: string;
  name: string;
}

/**
 * Resolve the ONE portal identity for an email, or null.
 *
 * `Client.email` has no unique constraint, and portal auth used
 * `findFirst({ where: { email, status, portalEnabled } })` — which silently
 * picks whichever row sorts first when two active, portal-enabled clients share
 * an address. The login gate and the session could then resolve to DIFFERENT
 * tenants. This resolver instead requires an unambiguous match and fails closed:
 *
 *   0 matches  -> null (unknown / not portal-enabled / archived)
 *   >1 matches -> null + an incident, so an operator merges them deliberately
 *                 rather than the system guessing a tenant
 *   1 match    -> that identity
 *
 * Matching is an exact comparison on `normalizedEmail` (see the migration for
 * why `email` and Prisma's ILIKE-based `mode:'insensitive'` are both unsafe here).
 */
export async function resolvePortalClient(email: string): Promise<PortalIdentity | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const matches = await prisma.client.findMany({
    where: { normalizedEmail, status: 'ACTIVE', portalEnabled: true },
    select: { id: true, email: true, name: true },
    take: 2, // one extra is enough to detect ambiguity
  });

  if (matches.length === 0) return null;
  if (matches.length > 1) {
    // Never guess which tenant the caller meant.
    reportError('portal.identity.ambiguous', new Error('multiple active portal clients share an email'), {
      severity: 'warn',
      meta: { clientIds: matches.map((m) => m.id) },
    });
    return null;
  }
  return matches[0];
}
