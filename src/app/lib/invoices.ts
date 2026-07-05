import { prisma } from './db';
import { writeAudit } from './audit';
import { sendAnnouncement } from './notify';
import { SITE_URL } from './email';
import { computeTotals, formatMoney } from './money';

export type InvoiceStatusValue = 'DRAFT' | 'SENT' | 'PAID' | 'VOID';

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

export async function createInvoice(input: InvoiceInput, actorEmail: string): Promise<{ id: string }> {
  const totals = computeTotals(input.lines, input.taxRateBps);
  const created = await prisma.$transaction(async (tx) => {
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
}

export async function updateInvoiceDraft(id: string, input: InvoiceInput, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!inv || inv.status !== 'DRAFT') throw new Error('Only draft invoices can be edited.');
  const totals = computeTotals(input.lines, input.taxRateBps);
  await prisma.$transaction([
    prisma.invoiceLine.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
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
    }),
  ]);
  await writeAudit('invoice.update', { actorEmail, meta: { id } });
}

function invNo(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`;
}

export async function sendInvoice(id: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv || inv.status !== 'DRAFT') throw new Error('Only draft invoices can be sent.');
  await prisma.invoice.update({ where: { id }, data: { status: 'SENT', issueDate: new Date() } });
  await writeAudit('invoice.send', { actorEmail, meta: { id } });
  void sendAnnouncement(
    inv.client.email,
    `Invoice ${invNo(inv.number)} from CraftsAI`,
    `Hi ${inv.client.name},\n\nInvoice ${invNo(inv.number)} for ${formatMoney(inv.totalMinor, inv.currency)} is ready. View and print it in your portal: ${SITE_URL}/portal/invoices/${inv.id}\n\n— The CraftsAI Team`,
  );
}

export async function markInvoicePaid(id: string, paymentRef: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv || inv.status !== 'SENT') throw new Error('Only sent invoices can be marked paid.');
  await prisma.invoice.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date(), paymentRef: paymentRef || null },
  });
  await writeAudit('invoice.paid', { actorEmail, meta: { id, paymentRef } });
  void sendAnnouncement(
    inv.client.email,
    `Payment received — ${invNo(inv.number)}`,
    `Hi ${inv.client.name},\n\nWe've recorded your payment of ${formatMoney(inv.totalMinor, inv.currency)} for ${invNo(inv.number)}. Thank you!\n\n— The CraftsAI Team`,
  );
}

export async function voidInvoice(id: string, actorEmail: string): Promise<void> {
  await prisma.invoice.update({ where: { id }, data: { status: 'VOID' } });
  await writeAudit('invoice.void', { actorEmail, meta: { id } });
}
