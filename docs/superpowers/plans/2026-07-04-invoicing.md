# Invoicing (Phase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin creates/sends invoices (offline-paid) against clients/projects; clients view + print them in the portal.

**Architecture:** Pure money helpers (`money.ts`) → data layer (`invoices.ts`, integer minor units) → gated server actions → admin builder/manage pages + portal view (printable), reusing Phase 1–3 patterns (`getAdmin`, `getPortalClient` scoping, notify-svc).

**Tech Stack:** Next 15 App Router, Prisma 6 + Postgres, TypeScript strict, Zod, Jest.

## Global Constraints

- **Money is ALWAYS integer minor units; tax is basis points. Never float.** All arithmetic in `money.ts` (pure, unit-tested).
- Per-invoice `currency` (ISO). `formatMoney` for display only.
- Overdue is **computed** (`status==='SENT' && dueDate < now`), never stored.
- Admin pages/actions `getAdmin()`-gated + Zod. Portal invoice reads **scoped by session clientId**; clients never see DRAFT or others' invoices.
- Invoice `number` sequential, assigned inside the create `$transaction`. Totals recomputed+stored whenever lines/tax change. DRAFT-only editing.
- Additive migration only. Mutations audited (`invoice.create/send/paid/void`). notify-svc for email. No new env vars.
- Branch `feat/invoicing` (created). Dev DB docker on 5438.

## File Structure

```
prisma/schema.prisma                          # Invoice, InvoiceLine, InvoiceStatus
src/app/lib/money.ts + __tests__/money.test.ts
src/app/lib/invoices.ts + __tests__/invoices.test.ts
src/app/admin/actions.ts                       # + invoice actions
src/app/admin/AdminNav.tsx                     # + Invoices link
src/app/admin/invoices/InvoiceStatusBadge.tsx
src/app/admin/invoices/page.tsx                # list
src/app/admin/invoices/new/page.tsx            # builder page
src/app/admin/invoices/[id]/page.tsx           # manage
src/app/admin/invoices/InvoiceBuilder.tsx      # line editor (client)
src/app/admin/invoices/InvoiceActions.tsx      # send/paid/void (client)
src/app/components/InvoiceDocument.tsx          # shared printable layout
src/app/portal/invoices/page.tsx               # client list (scoped)
src/app/portal/invoices/[id]/page.tsx          # printable (scoped)
src/app/portal/invoices/PrintButton.tsx        # window.print() (client)
src/app/admin/clients/[id]/page.tsx + projects/[id]/page.tsx  # "New invoice" shortcut
```

---

### Task 1: Schema

**Files:** Modify `prisma/schema.prisma`; migrate.

**Interfaces produced:** `Invoice`, `InvoiceLine`, `InvoiceStatus`.

- [ ] **Step 1: Append to `prisma/schema.prisma`:**
```prisma
enum InvoiceStatus { DRAFT SENT PAID VOID }

model Invoice {
  id            String        @id @default(cuid())
  number        Int           @unique
  clientId      String
  client        Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId     String?
  project       Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  currency      String        @default("USD")
  status        InvoiceStatus @default(DRAFT)
  issueDate     DateTime?
  dueDate       DateTime?
  taxLabel      String?
  taxRateBps    Int           @default(0)
  notes         String?       @db.Text
  subtotalMinor Int           @default(0)
  taxMinor      Int           @default(0)
  totalMinor    Int           @default(0)
  paidAt        DateTime?
  paymentRef    String?
  lines         InvoiceLine[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  @@index([clientId])
  @@index([status])
}

model InvoiceLine {
  id             String  @id @default(cuid())
  invoiceId      String
  invoice        Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description    String
  quantity       Int
  unitPriceMinor Int
  order          Int     @default(0)
  @@index([invoiceId])
}
```
Add `invoices Invoice[]` to the `Client` model relations and `invoices Invoice[]` to the `Project` model relations.
- [ ] **Step 2:** `docker compose -f docker-compose.dev.yml up -d && npm run db:migrate -- --name invoices && npm run db:generate` → "in sync".
- [ ] **Step 3:** `npm run type-check` → exit 0.
- [ ] **Step 4:** `git add prisma package-lock.json && git commit -m "feat(db): Invoice + InvoiceLine schema"`

---

### Task 2: Money helpers (`lib/money.ts`)

**Files:** Create `src/app/lib/money.ts`; Test `src/app/lib/__tests__/money.test.ts`

**Interfaces produced:**
- `lineTotalMinor(quantity: number, unitPriceMinor: number): number`
- `computeTotals(lines: { quantity: number; unitPriceMinor: number }[], taxRateBps: number): { subtotalMinor: number; taxMinor: number; totalMinor: number }`
- `formatMoney(minor: number, currency: string): string`
- `parseMoneyToMinor(input: string): number | null`

- [ ] **Step 1: Failing test** `money.test.ts`:
```ts
import { lineTotalMinor, computeTotals, formatMoney, parseMoneyToMinor } from '../money';

describe('money', () => {
  it('line total', () => expect(lineTotalMinor(3, 5000)).toBe(15000));
  it('computeTotals with 15% tax', () => {
    expect(computeTotals([{ quantity: 2, unitPriceMinor: 50000 }, { quantity: 1, unitPriceMinor: 20000 }], 1500))
      .toEqual({ subtotalMinor: 120000, taxMinor: 18000, totalMinor: 138000 });
  });
  it('computeTotals rounds tax half-up', () => {
    // subtotal 100003, 15% = 15000.45 -> 15000
    expect(computeTotals([{ quantity: 1, unitPriceMinor: 100003 }], 1500).taxMinor).toBe(15000);
  });
  it('zero tax', () => expect(computeTotals([{ quantity: 1, unitPriceMinor: 999 }], 0)).toEqual({ subtotalMinor: 999, taxMinor: 0, totalMinor: 999 }));
  it('formats USD', () => expect(formatMoney(150000, 'USD')).toBe('$1,500.00'));
  it('formats BDT', () => expect(formatMoney(150000, 'BDT')).toBe('৳1,500.00'));
  it('formats unknown currency with ISO prefix', () => expect(formatMoney(100000, 'EUR')).toBe('EUR 1,000.00'));
  it('parses money to minor', () => {
    expect(parseMoneyToMinor('1,500.50')).toBe(150050);
    expect(parseMoneyToMinor('1500')).toBe(150000);
    expect(parseMoneyToMinor('abc')).toBeNull();
    expect(parseMoneyToMinor('')).toBeNull();
  });
});
```
- [ ] **Step 2: Run → FAIL** (`npm test -- money.test`).
- [ ] **Step 3: Implement `money.ts`:**
```ts
const SYMBOLS: Record<string, string> = { USD: '$', BDT: '৳' };

export function lineTotalMinor(quantity: number, unitPriceMinor: number): number {
  return Math.round(quantity) * Math.round(unitPriceMinor);
}

export function computeTotals(
  lines: { quantity: number; unitPriceMinor: number }[],
  taxRateBps: number,
): { subtotalMinor: number; taxMinor: number; totalMinor: number } {
  const subtotalMinor = lines.reduce((s, l) => s + lineTotalMinor(l.quantity, l.unitPriceMinor), 0);
  const taxMinor = Math.round((subtotalMinor * taxRateBps) / 10000);
  return { subtotalMinor, taxMinor, totalMinor: subtotalMinor + taxMinor };
}

export function formatMoney(minor: number, currency: string): string {
  const neg = minor < 0;
  const major = (Math.abs(minor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sym = SYMBOLS[currency];
  const body = sym ? `${sym}${major}` : `${currency} ${major}`;
  return neg ? `-${body}` : body;
}

export function parseMoneyToMinor(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ''] = cleaned.split('.');
  const paddedFrac = (frac + '00').slice(0, 2);
  return Number(whole) * 100 + Number(paddedFrac);
}
```
- [ ] **Step 4: Run → PASS. Commit** `git commit -m "feat(money): pure integer-minor money helpers"`

---

### Task 3: Invoice data layer (`lib/invoices.ts`)

**Files:** Create `src/app/lib/invoices.ts`; Test `src/app/lib/__tests__/invoices.test.ts`

**Interfaces produced:**
- `type InvoiceStatusValue = 'DRAFT'|'SENT'|'PAID'|'VOID'`
- `interface InvoiceLineInput { description: string; quantity: number; unitPriceMinor: number }`
- `interface InvoiceListItem { id: string; number: number; clientName: string; currency: string; totalMinor: number; status: InvoiceStatusValue; dueDate: Date | null; overdue: boolean }`
- `isOverdue(inv: { status: string; dueDate: Date | null }): boolean`
- `listInvoices(f?: { status?: InvoiceStatusValue; clientId?: string }): Promise<InvoiceListItem[]>`
- `getInvoice(id): Promise<FullInvoice | null>` (includes client, project, lines ordered)
- `listClientInvoices(clientId): Promise<InvoiceListItem[]>` (non-DRAFT only)
- `getClientInvoice(clientId, invoiceId): Promise<FullInvoice | null>` (scoped, non-DRAFT)
- `createInvoice(input, actorEmail): Promise<{ id: string }>`
- `updateInvoiceDraft(id, input, actorEmail): Promise<void>` (throws if not DRAFT)
- `sendInvoice(id, actorEmail): Promise<void>` · `markInvoicePaid(id, paymentRef, actorEmail): Promise<void>` · `voidInvoice(id, actorEmail): Promise<void>`

where `input = { clientId; projectId?; currency; taxLabel?; taxRateBps; dueDate?; notes?; lines: InvoiceLineInput[] }`.

- [ ] **Step 1: Failing test** `invoices.test.ts` (mock `../db`, `../audit`, `../notify`, `../email`):
```ts
jest.mock('../db', () => {
  const tx = { invoice: { aggregate: jest.fn(), create: jest.fn() } };
  return { prisma: {
    invoice: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
    invoiceLine: { deleteMany: jest.fn(), createMany: jest.fn() },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    __tx: tx,
  } };
});
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));
import { prisma } from '../db';
import { createInvoice, updateInvoiceDraft, sendInvoice, isOverdue, getClientInvoice } from '../invoices';
const db = prisma as unknown as {
  invoice: { findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  __tx: { invoice: { aggregate: jest.Mock; create: jest.Mock } };
};

describe('invoices', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createInvoice assigns next number + stores computed totals', async () => {
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: 4 } });
    db.__tx.invoice.create.mockResolvedValue({ id: 'inv1' });
    const r = await createInvoice(
      { clientId: 'c1', currency: 'USD', taxRateBps: 1500, lines: [{ description: 'Build', quantity: 2, unitPriceMinor: 50000 }] },
      'admin@x.com',
    );
    expect(r).toEqual({ id: 'inv1' });
    const data = db.__tx.invoice.create.mock.calls[0][0].data;
    expect(data.number).toBe(5);
    expect(data.subtotalMinor).toBe(100000);
    expect(data.taxMinor).toBe(15000);
    expect(data.totalMinor).toBe(115000);
  });

  it('updateInvoiceDraft throws for a non-DRAFT invoice', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'SENT' });
    await expect(updateInvoiceDraft('inv1', { clientId: 'c1', currency: 'USD', taxRateBps: 0, lines: [] }, 'a@x.com'))
      .rejects.toThrow();
  });

  it('sendInvoice moves DRAFT -> SENT', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', number: 5, currency: 'USD', totalMinor: 115000, client: { email: 'c@x.com', name: 'C' } });
    db.invoice.update.mockResolvedValue({});
    await sendInvoice('inv1', 'admin@x.com');
    expect(db.invoice.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'inv1' }, data: expect.objectContaining({ status: 'SENT' }) }));
  });

  it('isOverdue only for SENT past due', () => {
    expect(isOverdue({ status: 'SENT', dueDate: new Date(Date.now() - 86400000) })).toBe(true);
    expect(isOverdue({ status: 'SENT', dueDate: new Date(Date.now() + 86400000) })).toBe(false);
    expect(isOverdue({ status: 'PAID', dueDate: new Date(Date.now() - 86400000) })).toBe(false);
  });

  it('getClientInvoice scopes by clientId + excludes drafts', async () => {
    db.invoice.findFirst.mockResolvedValue(null);
    const r = await getClientInvoice('c1', 'invX');
    expect(r).toBeNull();
    expect(db.invoice.findFirst.mock.calls[0][0].where).toEqual(expect.objectContaining({ id: 'invX', clientId: 'c1', status: { not: 'DRAFT' } }));
  });
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `invoices.ts`:**
```ts
import { prisma } from './db';
import { writeAudit } from './audit';
import { sendAnnouncement } from './notify';
import { SITE_URL } from './email';
import { computeTotals, formatMoney } from './money';

export type InvoiceStatusValue = 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
export interface InvoiceLineInput { description: string; quantity: number; unitPriceMinor: number }
export interface InvoiceInput {
  clientId: string; projectId?: string; currency: string;
  taxLabel?: string; taxRateBps: number; dueDate?: Date | null; notes?: string;
  lines: InvoiceLineInput[];
}
export interface InvoiceListItem {
  id: string; number: number; clientName: string; currency: string;
  totalMinor: number; status: InvoiceStatusValue; dueDate: Date | null; overdue: boolean;
}

export function isOverdue(inv: { status: string; dueDate: Date | null }): boolean {
  return inv.status === 'SENT' && !!inv.dueDate && inv.dueDate.getTime() < Date.now();
}

function toListItem(r: { id: string; number: number; currency: string; totalMinor: number; status: InvoiceStatusValue; dueDate: Date | null; client: { name: string } }): InvoiceListItem {
  return { id: r.id, number: r.number, clientName: r.client.name, currency: r.currency, totalMinor: r.totalMinor, status: r.status, dueDate: r.dueDate, overdue: isOverdue(r) };
}

const listSelect = { id: true, number: true, currency: true, totalMinor: true, status: true, dueDate: true, client: { select: { name: true } } } as const;

export async function listInvoices(f: { status?: InvoiceStatusValue; clientId?: string } = {}): Promise<InvoiceListItem[]> {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.clientId) where.clientId = f.clientId;
  const rows = await prisma.invoice.findMany({ where, orderBy: { number: 'desc' }, select: listSelect });
  return rows.map(toListItem);
}

export async function listClientInvoices(clientId: string): Promise<InvoiceListItem[]> {
  const rows = await prisma.invoice.findMany({
    where: { clientId, status: { not: 'DRAFT' } }, orderBy: { number: 'desc' }, select: listSelect,
  });
  return rows.map(toListItem);
}

const fullInclude = { client: true, project: true, lines: { orderBy: { order: 'asc' as const } } };

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({ where: { id }, include: fullInclude });
}

export async function getClientInvoice(clientId: string, invoiceId: string) {
  return prisma.invoice.findFirst({ where: { id: invoiceId, clientId, status: { not: 'DRAFT' } }, include: fullInclude });
}

export async function createInvoice(input: InvoiceInput, actorEmail: string): Promise<{ id: string }> {
  const totals = computeTotals(input.lines, input.taxRateBps);
  const created = await prisma.$transaction(async (tx) => {
    const agg = await tx.invoice.aggregate({ _max: { number: true } });
    const number = (agg._max.number ?? 0) + 1;
    return tx.invoice.create({
      data: {
        number, clientId: input.clientId, projectId: input.projectId ?? null,
        currency: input.currency, taxLabel: input.taxLabel ?? null, taxRateBps: input.taxRateBps,
        dueDate: input.dueDate ?? null, notes: input.notes ?? null,
        subtotalMinor: totals.subtotalMinor, taxMinor: totals.taxMinor, totalMinor: totals.totalMinor,
        lines: { create: input.lines.map((l, i) => ({ description: l.description, quantity: l.quantity, unitPriceMinor: l.unitPriceMinor, order: i })) },
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
        clientId: input.clientId, projectId: input.projectId ?? null, currency: input.currency,
        taxLabel: input.taxLabel ?? null, taxRateBps: input.taxRateBps, dueDate: input.dueDate ?? null, notes: input.notes ?? null,
        subtotalMinor: totals.subtotalMinor, taxMinor: totals.taxMinor, totalMinor: totals.totalMinor,
        lines: { create: input.lines.map((l, i) => ({ description: l.description, quantity: l.quantity, unitPriceMinor: l.unitPriceMinor, order: i })) },
      },
    }),
  ]);
  await writeAudit('invoice.update', { actorEmail, meta: { id } });
}

export async function sendInvoice(id: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv || inv.status !== 'DRAFT') throw new Error('Only draft invoices can be sent.');
  await prisma.invoice.update({ where: { id }, data: { status: 'SENT', issueDate: new Date() } });
  await writeAudit('invoice.send', { actorEmail, meta: { id } });
  void sendAnnouncement(
    inv.client.email,
    `Invoice INV-${String(inv.number).padStart(4, '0')} from CraftsAI`,
    `Hi ${inv.client.name},\n\nInvoice INV-${String(inv.number).padStart(4, '0')} for ${formatMoney(inv.totalMinor, inv.currency)} is ready. View and print it in your portal: ${SITE_URL}/portal/invoices/${inv.id}\n\n— CraftsAI`,
  );
}

export async function markInvoicePaid(id: string, paymentRef: string, actorEmail: string): Promise<void> {
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { client: true } });
  if (!inv || (inv.status !== 'SENT')) throw new Error('Only sent invoices can be marked paid.');
  await prisma.invoice.update({ where: { id }, data: { status: 'PAID', paidAt: new Date(), paymentRef: paymentRef || null } });
  await writeAudit('invoice.paid', { actorEmail, meta: { id, paymentRef } });
  void sendAnnouncement(
    inv.client.email,
    `Payment received — INV-${String(inv.number).padStart(4, '0')}`,
    `Hi ${inv.client.name},\n\nWe've recorded your payment of ${formatMoney(inv.totalMinor, inv.currency)} for INV-${String(inv.number).padStart(4, '0')}. Thank you!\n\n— CraftsAI`,
  );
}

export async function voidInvoice(id: string, actorEmail: string): Promise<void> {
  await prisma.invoice.update({ where: { id }, data: { status: 'VOID' } });
  await writeAudit('invoice.void', { actorEmail, meta: { id } });
}
```
- [ ] **Step 4: Run → PASS. Run full `npm test`. Commit** `git commit -m "feat(invoices): invoice data layer (numbering, totals, lifecycle)"`

---

### Task 4: Server actions

**Files:** Modify `src/app/admin/actions.ts`

Add gated + Zod actions. Full code (append; `getAdmin`, `revalidatePath`, `redirect`, `z` already imported):
```ts
import {
  createInvoice, updateInvoiceDraft, sendInvoice, markInvoicePaid, voidInvoice, type InvoiceInput,
} from '@/app/lib/invoices';

const LineSchema = z.object({ description: z.string().min(1), quantity: z.number().int().positive(), unitPriceMinor: z.number().int().nonnegative() });
const InvoiceSchema = z.object({
  clientId: z.string().min(1), projectId: z.string().optional(), currency: z.string().min(1),
  taxLabel: z.string().optional(), taxRateBps: z.number().int().min(0).max(100000),
  dueDate: z.string().optional(), notes: z.string().optional(),
  lines: z.array(LineSchema).min(1),
});

function toInput(form: z.infer<typeof InvoiceSchema>): InvoiceInput {
  return { ...form, dueDate: form.dueDate ? new Date(form.dueDate) : null };
}

export async function createInvoiceAction(form: unknown): Promise<void> {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  const { id } = await createInvoice(toInput(InvoiceSchema.parse(form)), admin.email);
  revalidatePath('/admin/invoices'); redirect(`/admin/invoices/${id}`);
}
export async function updateInvoiceDraftAction(id: string, form: unknown): Promise<void> {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await updateInvoiceDraft(id, toInput(InvoiceSchema.parse(form)), admin.email);
  revalidatePath(`/admin/invoices/${id}`);
}
export async function sendInvoiceAction(id: string): Promise<void> {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await sendInvoice(id, admin.email); revalidatePath(`/admin/invoices/${id}`);
}
export async function markInvoicePaidAction(id: string, paymentRef: string): Promise<void> {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await markInvoicePaid(id, paymentRef, admin.email); revalidatePath(`/admin/invoices/${id}`);
}
export async function voidInvoiceAction(id: string): Promise<void> {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await voidInvoice(id, admin.email); revalidatePath(`/admin/invoices/${id}`); revalidatePath('/admin/invoices');
}
```
- [ ] type-check + lint; commit `git commit -m "feat(admin): invoice server actions"`

---

### Task 5: Shared InvoiceDocument + status badge

**Files:** Create `src/app/components/InvoiceDocument.tsx`, `src/app/admin/invoices/InvoiceStatusBadge.tsx`.

- [ ] **Step 1: `InvoiceStatusBadge.tsx`** — maps status (+ `overdue` prop) to a pill: DRAFT=steel, SENT=signal, PAID=`border-green-500/50 text-green-400`, VOID=steel+line-through, overdue→red "Overdue". Small, presentational.
- [ ] **Step 2: `InvoiceDocument.tsx`** (server/presentational) — props: the full invoice (client, project, lines, currency, totals, dates, taxLabel, notes, status, number, paidAt). Renders a print-friendly invoice: header (`CraftsAI` + `INV-0001` + issue/due dates + status badge), Bill-to (client name/company/email), a line table (Description / Qty / Unit / Amount via `formatMoney`), subtotal, tax row (label + amount, only if `taxRateBps>0`), **Total**, payment instructions from `notes`, and a "Paid on {paidAt}" note when PAID. Uses design tokens; a wrapping class `invoice-print` so print CSS (in globals) can hide surrounding chrome. All amounts via `formatMoney(_, currency)`.
- [ ] build + type-check; commit `git commit -m "feat(invoices): shared printable InvoiceDocument + status badge"`

*(Full JSX authored at execution, mirroring existing card/table styling. Add a small `@media print` block to `globals.css` hiding `nav, header, .no-print` and forcing white-on-black→print-safe if needed.)*

---

### Task 6: Admin list + builder + manage

**Files:** Create `src/app/admin/invoices/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `InvoiceBuilder.tsx`, `InvoiceActions.tsx`; Modify `AdminNav.tsx`.

- [ ] **Step 1: AdminNav** — add `Invoices` link (`/admin/invoices`).
- [ ] **Step 2: `invoices/page.tsx`** (gated) — `listInvoices(filter)`; table INV-nnnn / client / `formatMoney(total,currency)` / `InvoiceStatusBadge` (overdue) / due; status filter; "New invoice" → `/admin/invoices/new`.
- [ ] **Step 3: `InvoiceBuilder.tsx`** (client) — controlled form: client `<select>` (needs a client list — fetch via a `listClients()` call passed as prop from the page), optional project, currency select (USD/BDT/EUR/GBP), dynamic line rows (description, qty, unit price string→`parseMoneyToMinor`), optional tax (label + rate% → bps), due date, notes. Live totals preview via `computeTotals`. Submit → `createInvoiceAction` (new) or `updateInvoiceDraftAction` (edit). Reject if any line invalid.
- [ ] **Step 4: `new/page.tsx`** (gated) — loads `listClients()` (active) + optional `?clientId`/`?projectId` prefills → renders `<InvoiceBuilder clients=... />`.
- [ ] **Step 5: `[id]/page.tsx`** (gated) — `getInvoice(id)`; if DRAFT → render `<InvoiceBuilder>` (edit) + Send/Void; else render `<InvoiceDocument>` + `<InvoiceActions>` (Mark paid w/ paymentRef input when SENT; Void). Show computed overdue.
- [ ] **Step 6: `InvoiceActions.tsx`** (client) — Send / Mark-paid (with paymentRef text field) / Void buttons calling the actions via `useTransition`, inline errors + confirm on Void.
- [ ] build + type-check + lint; commit `git commit -m "feat(admin): invoice list, builder, manage"`

---

### Task 7: Portal invoices (scoped) + shortcuts

**Files:** Create `src/app/portal/invoices/page.tsx`, `[id]/page.tsx`, `PrintButton.tsx`; Modify `src/app/admin/clients/[id]/page.tsx`, `src/app/admin/projects/[id]/page.tsx`.

- [ ] **Step 1: `portal/invoices/page.tsx`** — `getPortalClient()` gate → `listClientInvoices(clientId)` → table (INV-nnnn, total, status, due) linking to `[id]`. Empty state. `<PortalHeader>`.
- [ ] **Step 2: `portal/invoices/[id]/page.tsx`** — `getPortalClient()` gate → `getClientInvoice(clientId, id)`; null → `notFound()`. Render `<InvoiceDocument>` + `<PrintButton>`. (Scoped: a client cannot open another's or a draft.)
- [ ] **Step 3: `PrintButton.tsx`** (client) — a `.no-print` button calling `window.print()`.
- [ ] **Step 4: Shortcuts** — add a "New invoice" link on `/admin/clients/[id]` (`/admin/invoices/new?clientId=…`) and `/admin/projects/[id]` (`?clientId=…&projectId=…`).
- [ ] build + type-check + lint; commit `git commit -m "feat(portal): client invoices (scoped) + printable view + shortcuts"`

---

### Task 8: Verification

- [ ] `npm test` (all green) + `npm run build && npm run lint && npm run type-check`.
- [ ] **Visible browser test (ask first):** admin → Invoices → New → pick client, add 2 lines + 15% tax (USD) → totals correct in preview → save (DRAFT) → Send → sign in as that client (portal, dev OTP) → Invoices → open → printable invoice shows correct amounts/tax + Print button; INTERNAL/DRAFT never visible → back as admin → Mark paid ("Wise") → status PAID + receipt. Create a second invoice with a past due date → confirm **Overdue** badge. Isolation: client cannot open an invoice id belonging to another client (manually try a URL → notFound).
- [ ] Deploy: migrate prod (additive) via CLI, merge `feat/invoicing` → main, deploy SUCCESS, prod smoke (admin `/admin/invoices` loads; `/portal/invoices` redirects to login when signed out). No new env vars.

## Self-Review

**Spec coverage:** §4 schema→T1; §5 money→T2; §6 data layer→T3; §7 actions→T4; §8 UI (badge/document→T5, admin list/builder/manage→T6, portal+shortcuts→T7); §9 notifications→T3 (send/paid emails); §10 security/testing→T2/T3 unit + T8 browser; §11 rollout→T1/T8. ✅
**Placeholder scan:** T5–T7 defer JSX to execution with interfaces + patterns pinned (mirror Phase 2/3 pages); all money + data-layer + action code complete. Print CSS noted concretely (globals `@media print`). ⚠️ acceptable.
**Type consistency:** `lineTotalMinor/computeTotals/formatMoney/parseMoneyToMinor`; `InvoiceInput/InvoiceLineInput/InvoiceListItem/InvoiceStatusValue`; `createInvoice/updateInvoiceDraft/sendInvoice/markInvoicePaid/voidInvoice/getInvoice/getClientInvoice/listInvoices/listClientInvoices/isOverdue`; actions `createInvoiceAction/updateInvoiceDraftAction/sendInvoiceAction/markInvoicePaidAction/voidInvoiceAction` — consistent across tasks + matched to spec. ✅
