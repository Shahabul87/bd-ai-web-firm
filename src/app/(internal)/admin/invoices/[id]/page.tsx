import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { getInvoice, isOverdue, listClientsForInvoice, type InvoiceStatusValue } from '@/app/lib/invoices';
import AdminNav from '../../AdminNav';
import InvoiceBuilder, { type BuilderInitial } from '../InvoiceBuilder';
import InvoiceActions from '../InvoiceActions';
import InvoiceDocument from '@/app/components/InvoiceDocument';

export const metadata = { title: 'Invoice', robots: { index: false, follow: false } };

function minorToInput(minor: number): string {
  return (minor / 100).toFixed(2);
}

export default async function AdminInvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const overdue = isOverdue(invoice);
  const status = invoice.status as InvoiceStatusValue;

  if (status === 'DRAFT') {
    const clients = await listClientsForInvoice();
    const initial: BuilderInitial = {
      clientId: invoice.clientId,
      projectId: invoice.projectId ?? undefined,
      currency: invoice.currency,
      taxLabel: invoice.taxLabel ?? undefined,
      taxRatePct: invoice.taxRateBps ? (invoice.taxRateBps / 100).toString() : undefined,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : undefined,
      notes: invoice.notes ?? undefined,
      lines: invoice.lines.map((l) => ({
        description: l.description,
        quantity: String(l.quantity),
        unitPrice: minorToInput(l.unitPriceMinor),
      })),
    };
    return (
      <>
        <AdminNav email={admin.email} />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/admin/invoices" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
            ← All invoices
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="font-display text-3xl font-medium">INV-{String(invoice.number).padStart(4, '0')}</h1>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel">Draft — editable</span>
          </div>
          <div className="mt-8">
            <InvoiceBuilder clients={clients} invoiceId={invoice.id} initial={initial} />
          </div>
          <div className="mt-8 max-w-xs border-t border-line pt-6">
            <InvoiceActions id={invoice.id} status={status} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin/invoices" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal no-print">
          ← All invoices
        </Link>
        <div className="mt-6">
          <InvoiceDocument invoice={invoice} overdue={overdue} />
        </div>
        <div className="mt-8 max-w-xs border-t border-line pt-6 no-print">
          <InvoiceActions id={invoice.id} status={status} />
        </div>
      </main>
    </>
  );
}
