import { authPortal } from '@/authPortal';
import { prisma } from './db';

/**
 * Server-side portal gate. Returns the client identity only when there is a
 * valid portal session AND the client is still ACTIVE and portalEnabled
 * (re-checked every call, so disabling/archiving a client revokes access
 * immediately). Every portal query is scoped to the returned clientId.
 */
export async function getPortalClient(): Promise<{ clientId: string; email: string; name: string } | null> {
  const session = await authPortal();
  const clientId = session?.clientId;
  if (!clientId) return null;
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, email: true, name: true, status: true, portalEnabled: true },
  });
  if (!c || c.status !== 'ACTIVE' || !c.portalEnabled) return null;
  return { clientId: c.id, email: c.email, name: c.name };
}
