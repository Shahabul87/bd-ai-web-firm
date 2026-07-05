import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { listInvoices, type InvoiceStatusValue } from '@/app/lib/invoices';
import { formatMoney } from '@/app/lib/money';
import AdminNav from '../AdminNav';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export const metadata = { title: 'Invoices', robots: { index: false, follow: false } };

const STATUSES: string[] = ['', 'DRAFT', 'SENT', 'PAID', 'VOID'];

function invNo(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`;
}

export default async function AdminInvoices({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const sp = await searchParams;
  const invoices = await listInvoices({ status: (sp.status as InvoiceStatusValue) || undefined });

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Invoices</p>
            <h1 className="mt-2 font-display text-3xl font-medium">
              {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
            </h1>
          </div>
          <Link
            href="/admin/invoices/new"
            className="bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim"
          >
            New invoice
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={s ? `/admin/invoices?status=${s}` : '/admin/invoices'}
              className={`border px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                (sp.status ?? '') === s ? 'border-signal text-signal' : 'border-line text-steel hover:text-bone'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-ink-900 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-steel">
                    No invoices yet.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-line/60 transition-colors hover:bg-ink-900">
                  <td className="px-4 py-3">
                    <Link href={`/admin/invoices/${inv.id}`} className="font-mono text-bone hover:text-signal">
                      {invNo(inv.number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-steel">{inv.clientName}</td>
                  <td className="px-4 py-3 text-right text-bone">{formatMoney(inv.totalMinor, inv.currency)}</td>
                  <td className="px-4 py-3 text-steel">
                    {inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={inv.status} overdue={inv.overdue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
