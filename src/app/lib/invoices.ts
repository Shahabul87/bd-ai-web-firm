import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { writeAudit } from './audit';
// Push is delivered through the outbox now (see sendInvoice); only the direct
// payment-receipt email remains here.
import { sendAnnouncement } from './notify';
import { SITE_URL } from './email';
import { computeTotals, formatMoney } from './money';
import { assertProjectBelongsToClient } from './tenantAuthz';
import { enqueueOutbox, dispatchOutbox } from './outbox';

export type InvoiceStatusValue = 'DRAFT' | 'SENT' | 'PAID' | 'VOID';

/**
 * The invoice state machine. PAID and VOID are terminal: a paid invoice is
 * corrected with a credit note, never silently voided (voidInvoice previously
 * had NO status guard and would happily void a PAID invoice).
 */
export const ALLOWED_TRANSITIONS: Record<InvoiceStatusValue, readonly InvoiceStatusValue[]> = {
  DRAFT: ['SENT', 'VOID'],
  SENT: ['PAID', 'VOID'],
  PAID: [],
  VOID: [],
};

export function canTransition(from: InvoiceStatusValue, to: InvoiceStatusValue): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: InvoiceStatusValue, to: InvoiceStatusValue): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid invoice transition: ${from} → ${to}.`);
  }
}

/**
 * Flip status atomically, conditional on the CURRENT status. Returns false if
 * the row was not in `from` — i.e. someone else already moved it.
 *
 * The reads that used to gate these transitions ran outside the write, so two
 * concurrent sends could both observe DRAFT and both dispatch an email. A single
 * conditional update makes exactly one caller win.
 */
async function transition(
  id: string,
  from: InvoiceStatusValue,
  to: InvoiceStatusValue,
  data: Prisma.InvoiceUpdateManyMutationInput = {},
): Promise<boolean> {
  const res = await prisma.invoice.updateMany({
    where: { id, status: from },
    data: { ...data, status: to },
  });
  return res.count === 1;
}

/** True for a unique-constraint violation on Invoice.number. */
function isDuplicateNumber(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') return false;
  const target = (err.meta as { target?: string[] | string } | undefined)?.target;
  return String(target ?? '').includes('number');
}

/** Bounded retries for the numbering conflict; low invoice volume converges fast. */
const MAX_NUMBER_ATTEMPTS = 10;

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unitPriceMinor: number;
}

export interface InvoiceInput {
  clientId: string;
  projectId?: string;
  currency: string;
  taxLabel?: string;
  taxRateBps: number;
  dueDate?: Date | null;
  notes?: string;
  lines: InvoiceLineInput[];
}

export interface InvoiceListItem {
  id: string;
  number: number;
  clientName: string;
  currency: string;
  totalMinor: number;
  status: InvoiceStatusValue;
  dueDate: Date | null;
  overdue: boolean;
}

export function isOverdue(inv: { status: string; dueDate: Date | null }): boolean {
  return inv.status === 'SENT' && !!inv.dueDate && inv.dueDate.getTime() < Date.now();
}

const listSelect = {
  id: true,
  number: true,
  currency: true,
  totalMinor: true,
  status: true,
  dueDate: true,
  client: { select: { name: true } },
} as const;

type ListRow = {
  id: string;
  number: number;
  currency: string;
  totalMinor: number;
  status: InvoiceStatusValue;
  dueDate: Date | null;
  client: { name: string };
};

function toListItem(r: ListRow): InvoiceListItem {
  return {
    id: r.id,
    number: r.number,
    clientName: r.client.name,
    currency: r.currency,
    totalMinor: r.totalMinor,
    status: r.status,
    dueDate: r.dueDate,
    overdue: isOverdue(r),
  };
}

export async function listInvoices(
  f: { status?: InvoiceStatusValue; clientId?: string } = {},
): Promise<InvoiceListItem[]> {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.clientId) where.clientId = f.clientId;
  const rows = await prisma.invoice.findMany({ where, orderBy: { number: 'desc' }, select: listSelect });
  return rows.map(toListItem);
}

export async function listClientInvoices(clientId: string): Promise<InvoiceListItem[]> {
  const rows = await prisma.invoice.findMany({
    where: { clientId, status: { not: 'DRAFT' } },
    orderBy: { number: 'desc' },
    select: listSelect,
  });
  return rows.map(toListItem);
}

const fullInclude = { client: true, project: true, lines: { orderBy: { order: 'asc' as const } } };

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({ where: { id }, include: fullInclude });
}

/** Scoped read for the portal — a client can only load their own, non-draft invoices. */
export async function getClientInvoice(clientId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, clientId, status: { not: 'DRAFT' } },
    include: fullInclude,
  });
}

/**
 * Create an invoice, assigning the next number.
 *
 * `MAX(number)+1` alone is a race: concurrent creators read the same max and
 * collide on the unique index. Verified against Postgres — 8 concurrent creates
 * produced 3 invoices and 5 hard failures, i.e. invoices were LOST, not just
 * misnumbered. Retrying on that specific conflict serializes creation while
 * keeping numbering GAPLESS (a Postgres sequence would not roll back with the
 * transaction, leaving gaps in an accounting series).
 */
export async function createInvoice(input: InvoiceInput, actorEmail: string): Promise<{ id: string }> {
  const totals = computeTotals(input.lines, input.taxRateBps);

  for (let attempt = 1; attempt <= MAX_NUMBER_ATTEMPTS; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        // Prove the project belongs to the client in the SAME transaction as the
        // write — the dropdown filtering that pairs them is browser-side only.
        await assertProjectBelongsToClient(tx, input.clientId, input.projectId);
        const agg = await tx.invoice.aggregate({ _max: { number: true } });
        const number = (agg._max.number ?? 0) + 1;
        return tx.invoice.create({
          data: {
            number,
            clientId: input.clientId,
            projectId: input.projectId ?? null,
            currency: input.currency,
            taxLabel: input.taxLabel ?? null,
            taxRateBps: input.taxRateBps,
            dueDate: input.dueDate ?? null,
            notes: input.notes ?? null,
            subtotalMinor: totals.subtotalMinor,
            taxMinor: totals.taxMinor,
            totalMinor: totals.totalMinor,
            lines: {
              create: input.lines.map((l, i) => ({
                description: l.description,
                quantity: l.quantity,
                unitPriceMinor: l.unitPriceMinor,
                order: i,
              })),
            },
          },
          select: { id: true },
        });
      });
      await writeAudit('invoice.create', { actorEmail, meta: { id: created.id } });
      return created;
    } catch (err) {
      // Only a numbering collision is retryable; a tenant mismatch or any other
      // error must surface immediately.
      if (isDuplicateNumber(err) && attempt < MAX_NUMBER_ATTEMPTS) continue;
      throw err;
    }
  }
  throw new Error('Could not assign an invoice number after repeated conflicts.');
}

export async function updateInvoiceDraft(id: string, input: InvoiceInput, actorEmail: string): Promise<void> {
  const totals = computeTotals(input.lines, input.taxRateBps);
  // The status check, the tenant check and the writes all live in ONE
  // transaction: the status read used to happen outside it, so an invoice could
  // be sent between the check and the update. This also re-assigns clientId, so
  // the project/client pairing must be re-proven on every edit.
  await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.findUnique({ where: { id }, select: { status: true } });
    if (!inv || inv.status !== 'DRAFT') throw new Error('Only draft invoices can be edited.');
    await assertProjectBelongsToClient(tx, input.clientId, input.projectId);
    await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
    await tx.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        projectId: input.projectId ?? null,
        currency: input.currency,
        taxLabel: input.taxLabel ?? null,
        taxRateBps: input.taxRateBps,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? null,
        subtotalMinor: totals.subtotalMinor,
        taxMinor: totals.taxMinor,
        totalMinor: totals.totalMinor,
        lines: {
          create: input.lines.map((l, i) => ({
            description: l.description,
            quantity: l.quantity,
            unitPriceMinor: l.unitPriceMinor,
            order: i,
          })),
        },
      },
    });
  });
  await writeAudit('invoice.update', { actorEmail, meta: { id } });
}

function invNo(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`;
}

export async function sendInvoice(id: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv) throw new Error('Invoice not found.');
  assertTransition(inv.status as InvoiceStatusValue, 'SENT');

  // The status flip and BOTH notifications are enqueued in one transaction:
  // either the invoice is sent and its notifications are durably queued, or
  // neither happened. Previously the emails were fire-and-forget, so a
  // notify-svc outage silently left the client never knowing they were invoiced
  // while the invoice showed as SENT.
  const sent = await prisma.$transaction(async (tx) => {
    const flip = await tx.invoice.updateMany({
      // Conditional on still being DRAFT: two concurrent sends previously could
      // both pass the read above and both dispatch an email.
      where: { id, status: 'DRAFT' },
      data: { status: 'SENT', issueDate: new Date() },
    });
    if (flip.count !== 1) return false;

    await enqueueOutbox(tx, {
      type: 'invoice.sent',
      aggregateId: id,
      idempotencyKey: `invoice.sent:email:${id}`,
      payload: {
        channel: 'email',
        to: inv.client.email,
        subject: `Invoice ${invNo(inv.number)} from CraftsAI`,
        body: `Hi ${inv.client.name},\n\nInvoice ${invNo(inv.number)} for ${formatMoney(inv.totalMinor, inv.currency)} is ready. View and print it in your portal: ${SITE_URL}/portal/invoices/${inv.id}\n\n— The CraftsAI Team`,
      },
    });
    await enqueueOutbox(tx, {
      type: 'invoice.sent',
      aggregateId: id,
      idempotencyKey: `invoice.sent:push:${id}`,
      payload: {
        channel: 'push',
        to: `client:${inv.clientId}`,
        subject: `Invoice ${invNo(inv.number)}`,
        body: `${formatMoney(inv.totalMinor, inv.currency)} — view it in your portal.`,
      },
    });
    return true;
  });

  if (!sent) throw new Error('Only draft invoices can be sent.');
  await writeAudit('invoice.send', { actorEmail, meta: { id } });
  // Deliver promptly; the worker retries anything this pass does not land.
  void dispatchOutbox();
}

export async function markInvoicePaid(id: string, paymentRef: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv) throw new Error('Invoice not found.');
  assertTransition(inv.status as InvoiceStatusValue, 'PAID');
  if (
    !(await transition(id, 'SENT', 'PAID', { paidAt: new Date(), paymentRef: paymentRef || null }))
  ) {
    throw new Error('Only sent invoices can be marked paid.');
  }
  await writeAudit('invoice.paid', { actorEmail, meta: { id, paymentRef } });
  void sendAnnouncement(
    inv.client.email,
    `Payment received — ${invNo(inv.number)}`,
    `Hi ${inv.client.name},\n\nWe've recorded your payment of ${formatMoney(inv.totalMinor, inv.currency)} for ${invNo(inv.number)}. Thank you!\n\n— The CraftsAI Team`,
  );
}

export async function voidInvoice(id: string, actorEmail: string): Promise<void> {
  // This had NO status guard at all — it would void a PAID invoice, silently
  // destroying a settled accounting record. Only DRAFT/SENT may be voided; a
  // paid invoice is corrected with a credit note.
  const inv = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!inv) throw new Error('Invoice not found.');
  const from = inv.status as InvoiceStatusValue;
  assertTransition(from, 'VOID');
  if (!(await transition(id, from, 'VOID'))) {
    throw new Error('That invoice can no longer be voided.');
  }
  await writeAudit('invoice.void', { actorEmail, meta: { id, from } });
}

/** Active clients + their projects, for the invoice builder's selects. */
export async function listClientsForInvoice(): Promise<
  { id: string; name: string; projects: { id: string; title: string }[] }[]
> {
  return prisma.client.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      projects: { select: { id: true, title: true }, orderBy: { createdAt: 'desc' } },
    },
  });
}
