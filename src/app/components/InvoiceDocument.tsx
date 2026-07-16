import { formatMoney } from '@/app/lib/money';
import type { InvoiceStatusValue } from '@/app/lib/invoices';
import InvoiceStatusBadge from '@/app/(internal)/admin/invoices/InvoiceStatusBadge';

export interface InvoiceDoc {
  number: number;
  currency: string;
  status: InvoiceStatusValue;
  issueDate: Date | null;
  dueDate: Date | null;
  taxLabel: string | null;
  taxRateBps: number;
  notes: string | null;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  paidAt: Date | null;
  paymentRef: string | null;
  client: { name: string; company: string | null; email: string };
  project?: { title: string } | null;
  lines: { id: string; description: string; quantity: number; unitPriceMinor: number }[];
}

function invNo(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`;
}
function fmtDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '—';
}

export default function InvoiceDocument({ invoice, overdue }: { invoice: InvoiceDoc; overdue: boolean }) {
  const inv = invoice;
  return (
    <div className="invoice-print border border-line bg-ink-950 p-8 text-bone">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-sm font-semibold tracking-tight">
            CRAFTS.AI<span className="text-signal">▮</span>
          </p>
          <p className="mt-1 text-xs text-steel">AI Agent Development Studio · Dhaka</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-medium">{invNo(inv.number)}</p>
          <div className="mt-1">
            <InvoiceStatusBadge status={inv.status} overdue={overdue} />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Bill to</p>
          <p className="mt-1 text-bone">{inv.client.name}</p>
          {inv.client.company && <p className="text-steel">{inv.client.company}</p>}
          <p className="text-steel">{inv.client.email}</p>
          {inv.project && <p className="mt-2 text-steel">Project: {inv.project.title}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-steel">
            Issued: <span className="text-bone">{fmtDate(inv.issueDate)}</span>
          </p>
          <p className="text-xs text-steel">
            Due: <span className="text-bone">{fmtDate(inv.dueDate)}</span>
          </p>
          {inv.paidAt && (
            <p className="mt-1 text-xs text-green-400">
              Paid: {fmtDate(inv.paidAt)}
              {inv.paymentRef ? ` (${inv.paymentRef})` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Lines */}
      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b border-line font-mono text-[10px] uppercase tracking-[0.12em] text-steel">
          <tr>
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((l) => (
            <tr key={l.id} className="border-b border-line/50">
              <td className="py-2 text-bone">{l.description}</td>
              <td className="py-2 text-right text-steel">{l.quantity}</td>
              <td className="py-2 text-right text-steel">{formatMoney(l.unitPriceMinor, inv.currency)}</td>
              <td className="py-2 text-right text-bone">
                {formatMoney(l.quantity * l.unitPriceMinor, inv.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between text-steel">
            <span>Subtotal</span>
            <span>{formatMoney(inv.subtotalMinor, inv.currency)}</span>
          </div>
          {inv.taxRateBps > 0 && (
            <div className="flex justify-between text-steel">
              <span>{inv.taxLabel || `Tax (${(inv.taxRateBps / 100).toFixed(2)}%)`}</span>
              <span>{formatMoney(inv.taxMinor, inv.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-2 font-display text-lg text-bone">
            <span>Total</span>
            <span>{formatMoney(inv.totalMinor, inv.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes / payment instructions */}
      {inv.notes && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Notes / payment</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-bone">{inv.notes}</p>
        </div>
      )}
    </div>
  );
}
