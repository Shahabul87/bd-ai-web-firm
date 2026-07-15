import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { listClientsForInvoice } from '@/app/lib/invoices';
import AdminNav from '../../AdminNav';
import InvoiceBuilder, { type BuilderInitial } from '../InvoiceBuilder';

export const metadata = { title: 'New invoice', robots: { index: false, follow: false } };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const clients = await listClientsForInvoice();
  const sp = await searchParams;

  const initial: BuilderInitial | undefined =
    sp.clientId && clients.some((c) => c.id === sp.clientId)
      ? {
          clientId: sp.clientId,
          projectId: sp.projectId,
          currency: 'USD',
          lines: [{ description: '', quantity: '1', unitPrice: '' }],
        }
      : undefined;

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin/invoices" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
          ← All invoices
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium">New invoice</h1>
        {clients.length === 0 ? (
          <p className="mt-8 text-sm text-steel">Add an active client first.</p>
        ) : (
          <div className="mt-8">
            <InvoiceBuilder clients={clients} initial={initial} />
          </div>
        )}
      </main>
    </>
  );
}
