import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { sendAnnouncement, sendPush } from './notify';
import { reportError } from './report';

/**
 * Transactional outbox.
 *
 * Founder alerts, invoice emails and portal invitations were dispatched
 * fire-and-forget (`void sendAnnouncement(...)`). If notify-svc was unreachable
 * — or the process exited — at that instant, the notification was lost while the
 * business row stayed committed: a lead nobody heard about, an invoice the
 * client never received.
 *
 * enqueueOutbox() writes the event with the SAME transaction client as the
 * business mutation, so the two commit or roll back together. dispatchOutbox()
 * then delivers with bounded retries, independently of the request.
 */

export type OutboxEventType =
  | 'lead.alert'
  | 'lead.ack'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'portal.invite'
  | 'project.message'
  | 'incident.escalation';

/** Delivery instructions only — never tokens, auth codes, or extra personal data. */
export interface OutboxPayload {
  channel: 'email' | 'push';
  to: string;
  subject: string;
  body: string;
}

export interface EnqueueInput {
  type: OutboxEventType;
  aggregateId?: string;
  /**
   * Stable key for at-most-once delivery. Derive it from the business fact
   * (e.g. `invoice.sent:<invoiceId>`), NOT from a timestamp — a retry of the
   * same fact must collide rather than send a second email.
   */
  idempotencyKey: string;
  payload: OutboxPayload;
}

/** Max delivery attempts before an event is dead-lettered for an operator. */
export const MAX_ATTEMPTS = 6;
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 60 * 60_000;

/**
 * Exponential backoff with jitter, so a notify-svc outage does not produce a
 * synchronized retry stampede when it recovers.
 */
export function backoffMs(attempts: number, random: () => number = Math.random): number {
  const exponential = Math.min(BASE_BACKOFF_MS * 2 ** (attempts - 1), MAX_BACKOFF_MS);
  const jitter = exponential * 0.25 * random();
  return Math.round(exponential + jitter);
}

/**
 * Enqueue inside the caller's transaction. Pass the SAME `tx` as the business
 * write — passing the global client would defeat the entire point.
 *
 * A duplicate idempotencyKey is treated as already-enqueued (not an error), so
 * a retried request cannot queue a second notification.
 */
export async function enqueueOutbox(
  tx: Prisma.TransactionClient,
  input: EnqueueInput,
): Promise<void> {
  await tx.outboxEvent.createMany({
    data: {
      type: input.type,
      aggregateId: input.aggregateId ?? null,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload as unknown as Prisma.InputJsonValue,
    },
    skipDuplicates: true,
  });
}

async function deliver(payload: OutboxPayload): Promise<boolean> {
  if (payload.channel === 'push') {
    await sendPush(payload.to, payload.subject, payload.body);
    return true; // sendPush is best-effort by design and never reports failure
  }
  const res = await sendAnnouncement(payload.to, payload.subject, payload.body);
  return res.ok;
}

export interface DispatchResult {
  claimed: number;
  delivered: number;
  failed: number;
  dead: number;
}

/**
 * Deliver due events. Safe to run concurrently: each event is CLAIMED with a
 * conditional update (status+attempts), so two workers cannot both send it.
 *
 * Returns counts rather than throwing — a delivery failure is an expected,
 * retryable condition, not an error for the caller.
 */
export async function dispatchOutbox(limit = 20): Promise<DispatchResult> {
  const due = await prisma.outboxEvent.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
    orderBy: { nextAttemptAt: 'asc' },
    take: limit,
    select: { id: true, type: true, payload: true, attempts: true },
  });

  const result: DispatchResult = { claimed: 0, delivered: 0, failed: 0, dead: 0 };

  for (const event of due) {
    // Claim: only one worker may take this attempt.
    const claim = await prisma.outboxEvent.updateMany({
      where: { id: event.id, status: 'PENDING', attempts: event.attempts },
      data: { attempts: event.attempts + 1 },
    });
    if (claim.count !== 1) continue; // another worker got it
    result.claimed += 1;

    const attempts = event.attempts + 1;
    try {
      const ok = await deliver(event.payload as unknown as OutboxPayload);
      if (!ok) throw new Error('notify-svc rejected the message');
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'DELIVERED', deliveredAt: new Date(), lastError: null },
      });
      result.delivered += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      const exhausted = attempts >= MAX_ATTEMPTS;
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: exhausted ? 'DEAD' : 'PENDING',
          nextAttemptAt: new Date(Date.now() + backoffMs(attempts)),
          lastError: message.slice(0, 500),
        },
      });
      if (exhausted) {
        result.dead += 1;
        reportError('outbox.dead', err, {
          meta: { eventId: event.id, type: event.type, attempts },
        });
      } else {
        result.failed += 1;
      }
    }
  }

  return result;
}

/** Requeue a dead-lettered event (admin action). */
export async function retryDeadEvent(id: string): Promise<boolean> {
  const res = await prisma.outboxEvent.updateMany({
    where: { id, status: 'DEAD' },
    data: { status: 'PENDING', attempts: 0, nextAttemptAt: new Date(), lastError: null },
  });
  return res.count === 1;
}

/** Pending/failed/dead counts for the admin UI. */
export async function outboxHealth(): Promise<{ pending: number; dead: number }> {
  const [pending, dead] = await Promise.all([
    prisma.outboxEvent.count({ where: { status: 'PENDING' } }),
    prisma.outboxEvent.count({ where: { status: 'DEAD' } }),
  ]);
  return { pending, dead };
}

/** Retention: delivered events are noise after a while; dead ones are kept longer. */
export async function cleanupOutbox(
  deliveredOlderThanDays = 30,
  deadOlderThanDays = 90,
): Promise<number> {
  const now = Date.now();
  const res = await prisma.outboxEvent.deleteMany({
    where: {
      OR: [
        {
          status: 'DELIVERED',
          deliveredAt: { lt: new Date(now - deliveredOlderThanDays * 86_400_000) },
        },
        { status: 'DEAD', updatedAt: { lt: new Date(now - deadOlderThanDays * 86_400_000) } },
      ],
    },
  });
  return res.count;
}
