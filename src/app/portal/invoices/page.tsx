import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPortalClient } from '@/app/lib/portalSession';
import { listClientInvoices } from '@/app/lib/invoices';
import { formatMoney } from '@/app/lib/money';
import PortalHeader from '../PortalHeader';
import InvoiceStatusBadge from '../../admin/invoices/InvoiceStatusBadge';

export const metadata = { title: 'Your invoices | CraftsAI', robots: { index: false, follow: false } };

function invNo(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`;
}

export default async function PortalInvoices() {
  const client = await getPortalClient();
  if (!client) redirect('/portal/login');

  const invoices = await listClientInvoices(client.clientId);

  return (
    <>
      <PortalHeader clientName={client.name} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Your invoices</p>
        <h1 className="mt-2 font-display text-3xl font-medium">Invoices</h1>

        {invoices.length === 0 ? (
          <p className="mt-8 text-sm text-steel">No invoices yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-line bg-ink-900 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-line/60 transition-colors hover:bg-ink-900">
                    <td className="px-4 py-3">
                      <Link href={`/portal/invoices/${inv.id}`} className="font-mono text-bone hover:text-signal">
                        {invNo(inv.number)}
                      </Link>
                    </td>
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
        )}
      </main>
    </>
  );
}
