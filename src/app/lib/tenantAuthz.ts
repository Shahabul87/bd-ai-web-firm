import type { Prisma } from '@prisma/client';

/**
 * Centralized tenant-relationship checks.
 *
 * Any operation that accepts a `clientId` AND a `projectId` (or similar pair)
 * must prove the relationship server-side, in the SAME transaction as the write.
 * The admin invoice builder only filters the project dropdown in the browser
 * (InvoiceBuilder.tsx), and server actions are plain POST endpoints — a crafted
 * payload, or even the `?clientId=A&projectId=B` prefill link, could otherwise
 * persist an invoice pairing one client with another client's project. Because
 * sendInvoice() emails and pushes the invoice, that mis-assignment would be
 * actively delivered to the wrong tenant.
 */
export class TenantMismatchError extends Error {
  constructor(message = 'That project does not belong to the selected client.') {
    super(message);
    this.name = 'TenantMismatchError';
  }
}

/**
 * Throws unless `projectId` (when provided) belongs to `clientId`.
 * Pass the transaction client so the check and the write cannot be separated by
 * a concurrent re-assignment.
 */
export async function assertProjectBelongsToClient(
  tx: Prisma.TransactionClient,
  clientId: string,
  projectId?: string | null,
): Promise<void> {
  if (!projectId) return; // no project is a valid, unambiguous pairing
  const project = await tx.project.findFirst({
    where: { id: projectId, clientId },
    select: { id: true },
  });
  if (!project) throw new TenantMismatchError();
}
