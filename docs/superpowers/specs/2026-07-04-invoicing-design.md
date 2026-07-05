# Design Spec — Phase 4: Invoicing

- **Date:** 2026-07-04
- **Status:** Approved (design), pending spec review
- **Builds on:** Phases 1–3 (Clients/Projects, admin auth, client portal + `getPortalClient` scoping, notify-svc, audit).
- **Part of:** the Phase 2+ roadmap (`2026-07-04-phase2plus-roadmap.md`).

## 1. Context & Goal

Let the admin create invoices against a client (optionally a project), send them, and record payment; clients view + print their invoices in the portal. **Offline/manual payments** — no payment provider (Stripe can't receive in Bangladesh); the admin marks invoices paid. Money is handled as integer minor units throughout.

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| Payments | **Offline/manual** — admin marks paid; no provider, no Payment table |
| Currency | **Per-invoice** (default USD); amounts in **integer minor units** |
| Tax | **Optional per-invoice tax line** — label + rate in **basis points** (0 = none) |
| Invoice document | **Printable web page** (print-styled CSS + "Print/Save as PDF"); no PDF library |
| Overdue | **Computed** at read time (SENT && dueDate < today), not a stored status |
| Portal | Clients view their invoices, **scoped by session clientId** |
| Out of scope | Online payments, partial payments, recurring, PDF lib, multi-contact |

## 3. Architecture

Extends the existing app.
```
prisma/schema.prisma                     # Invoice, InvoiceLine, InvoiceStatus enum
src/app/lib/money.ts                      # pure money/format helpers (no DB)
src/app/lib/invoices.ts                   # data layer (create/get/list/send/markPaid/void)
src/app/admin/actions.ts                  # + invoice server actions (getAdmin-gated)
src/app/admin/invoices/page.tsx           # admin list
src/app/admin/invoices/new/page.tsx       # builder
src/app/admin/invoices/[id]/page.tsx      # manage (send/mark-paid/void + draft editor)
src/app/admin/invoices/InvoiceBuilder.tsx # line-item editor (client component)
src/app/admin/invoices/InvoiceActions.tsx # send/mark-paid/void (client component)
src/app/admin/invoices/InvoiceStatusBadge.tsx
src/app/portal/invoices/page.tsx          # client's invoices (scoped)
src/app/portal/invoices/[id]/page.tsx     # printable invoice (scoped)
src/app/components/InvoiceDocument.tsx     # shared printable invoice layout (admin + portal)
src/app/admin/AdminNav.tsx                # + Invoices link
```
`money.ts` is pure and unit-tested in isolation. `invoices.ts` is the only DB boundary. The printable `InvoiceDocument` is shared by admin preview and portal view.

## 4. Data Model

```prisma
enum InvoiceStatus { DRAFT SENT PAID VOID }   // OVERDUE is derived, never stored

model Invoice {
  id            String        @id @default(cuid())
  number        Int           @unique          // sequential; displayed "INV-0001"
  clientId      String
  client        Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  projectId     String?
  project       Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  currency      String        @default("USD")   // ISO 4217
  status        InvoiceStatus @default(DRAFT)
  issueDate     DateTime?
  dueDate       DateTime?
  taxLabel      String?
  taxRateBps    Int           @default(0)        // 1500 = 15.00%
  notes         String?       @db.Text
  subtotalMinor Int           @default(0)        // denormalized on save
  taxMinor      Int           @default(0)
  totalMinor    Int           @default(0)
  paidAt        DateTime?
  paymentRef    String?                          // offline note e.g. "Wise, 4 Jul"
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
Client + Project gain `invoices Invoice[]`. Additive/optional → safe migration.

## 5. Money handling (`lib/money.ts`)

Pure functions, no float:
- `lineTotalMinor(quantity, unitPriceMinor) = quantity * unitPriceMinor`
- `computeTotals(lines, taxRateBps): { subtotalMinor, taxMinor, totalMinor }` where
  `subtotal = Σ lineTotal`, `taxMinor = Math.round(subtotal * taxRateBps / 10000)`, `total = subtotal + taxMinor`.
- `formatMoney(minor, currency): string` — minor→major with 2 decimals + symbol (`$`, `৳`, else ISO code prefix). e.g. `formatMoney(150000,'USD') → "$1,500.00"`.
- `parseMoneyToMinor(input: string): number` — "1500.50" → 150050 (for the builder), integer-safe.

Totals are recomputed and stored on the Invoice whenever lines/tax change.

## 6. Data layer (`lib/invoices.ts`)

- `type InvoiceStatusValue = 'DRAFT'|'SENT'|'PAID'|'VOID'`
- `InvoiceLineInput = { description; quantity; unitPriceMinor }`
- `listInvoices(f?: { status?; clientId? }): Promise<InvoiceListItem[]>` — `InvoiceListItem = { id; number; clientName; currency; totalMinor; status; dueDate; overdue: boolean }`
- `getInvoice(id): Promise<(Invoice & { client; project; lines }) | null>`
- `getClientInvoice(clientId, invoiceId)` — **scoped**; null if not the client's (also excludes DRAFT from the client's view)
- `listClientInvoices(clientId)` — the client's non-DRAFT invoices
- `createInvoice(input: { clientId; projectId?; currency; taxLabel?; taxRateBps; dueDate?; notes?; lines: InvoiceLineInput[] }, actorEmail): Promise<{ id }>` — assigns next `number` + computes totals **inside a `$transaction`**
- `updateInvoiceDraft(id, input, actorEmail)` — only if status DRAFT; recompute totals
- `sendInvoice(id, actorEmail)` — DRAFT→SENT, set issueDate, notify client, audit
- `markInvoicePaid(id, paymentRef, actorEmail)` — →PAID, set paidAt, notify client, audit
- `voidInvoice(id, actorEmail)` — →VOID, audit
- `isOverdue(inv)` — `status==='SENT' && dueDate && dueDate < now`

All mutating fns audited (`invoice.create/send/paid/void`). Numbering: `next = (max(number) ?? 0) + 1` within the create transaction.

## 7. Server actions (gated)

`src/app/admin/actions.ts` (getAdmin, Zod, revalidate, audited via data layer):
`createInvoiceAction`, `updateInvoiceDraftAction`, `sendInvoiceAction`, `markInvoicePaidAction`, `voidInvoiceAction`. Status guards enforced in the data layer (throw if e.g. sending a non-draft).

## 8. UI

- **Admin `/admin/invoices`** — table (INV-nnnn, client, total via `formatMoney`, status badge, due), status filter, "New invoice". Overdue rows flagged.
- **`/admin/invoices/new`** + **`InvoiceBuilder`** — pick client (+ optional project), currency, line rows (add/remove: description, qty, unit price via `parseMoneyToMinor`), optional tax (label + rate %), due date, notes; live subtotal/tax/total preview. Saves as DRAFT.
- **`/admin/invoices/[id]`** — invoice preview (`InvoiceDocument`) + `InvoiceActions` (Send while DRAFT; Mark paid + paymentRef while SENT/OVERDUE; Void). Draft shows the editable `InvoiceBuilder`.
- **"New invoice"** buttons on `/admin/clients/[id]` and `/admin/projects/[id]` (prefill client/project).
- **Portal `/portal/invoices`** — the client's non-draft invoices (number, total, status, due), scoped.
- **Portal `/portal/invoices/[id]`** — `InvoiceDocument` in print-styled layout + a "Print / Save as PDF" button (`window.print()`), scoped (notFound if not theirs).
- **`InvoiceDocument`** — shared: header (CraftsAI + INV number + dates), bill-to (client), line table, subtotal/tax/total, payment instructions (from `notes`), status. Print CSS hides nav/buttons.
- **AdminNav** gains **Invoices**.
- Statuses badge: DRAFT=steel, SENT=signal, PAID=green, VOID=steel+strike, OVERDUE(computed)=red.

## 9. Notifications

`sendInvoice` → notify-svc email to client (INV number, amount, due, portal link). `markInvoicePaid` → receipt email. Fire-and-forget.

## 10. Security & Testing

- Admin actions `getAdmin`-gated; portal invoice reads **scoped by session clientId**; client can't load another client's or a DRAFT invoice (tested).
- **Unit tests (money.ts):** lineTotal; computeTotals subtotal/tax rounding (e.g. 15% of 1000.03); multi-line; zero tax; formatMoney USD/BDT/other; parseMoneyToMinor ("1,500.50"→150050, integer-safe, rejects junk).
- **Unit tests (invoices.ts, mocked Prisma):** createInvoice assigns number + computes/stores totals; updateInvoiceDraft refuses non-DRAFT; sendInvoice DRAFT→SENT; markInvoicePaid sets paidAt; isOverdue logic; getClientInvoice scoping (other client → null; DRAFT → null).
- **Visible browser test:** admin creates invoice (2 lines + 15% tax, USD) → totals correct → send → client (portal) sees it under Invoices → opens printable page (amounts/tax right, Print button) → admin marks paid (ref "Wise") → status PAID + receipt; overdue badge shows for a past-due SENT invoice.

## 11. Rollout

Branch `feat/invoicing`. Order: schema+migration → money.ts (+tests) → invoices.ts (+tests) → server actions → admin list/new/[id] + builder/actions → InvoiceDocument + portal list/[id] → AdminNav + client/project shortcuts → scoping/money tests → build/lint/type-check → local visible verify → migrate prod (additive) → merge → prod smoke. **No new env vars.**

## 12. Risks

- **Money correctness** — mitigated by integer minor units + basis points + pure, unit-tested `money.ts` (never float).
- Invoice numbering race — mitigated by assigning `number` inside the create `$transaction` (solo-studio volume; a Postgres sequence is a later hardening if needed).
- Portal scoping — mirrors Phase 3's tested `getPortalClient` pattern.
