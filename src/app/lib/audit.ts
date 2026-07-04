import { Prisma } from '@prisma/client';
import { prisma } from './db';

/**
 * Append an entry to the audit log. Never throws — audit failures must not
 * break the action being audited.
 */
export async function writeAudit(
  action: string,
  opts: { actorEmail?: string; ip?: string; meta?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorEmail: opts.actorEmail ?? null,
        ip: opts.ip ?? null,
        meta: opts.meta ? (opts.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error('writeAudit failed:', err instanceof Error ? err.message : 'unknown');
  }
}
