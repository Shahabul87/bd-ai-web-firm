import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPortalClient } from '@/app/lib/portalSession';
import { getClientInvoice, isOverdue } from '@/app/lib/invoices';
import PortalHeader from '../../PortalHeader';
import InvoiceDocument from '@/app/components/InvoiceDocument';
import PrintButton from '../PrintButton';

export const metadata = { title: 'Invoice | CraftsAI', robots: { index: false, follow: false } };

export default async function PortalInvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const client = await getPortalClient();
  if (!client) redirect('/portal/login');

  const { id } = await params;
  const invoice = await getClientInvoice(client.clientId, id); // scoped: theirs + non-draft only
  if (!invoice) notFound();

  return (
    <>
      <PortalHeader clientName={client.name} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="no-print flex items-center justify-between">
          <Link href="/portal/invoices" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
            ← Your invoices
          </Link>
          <PrintButton />
        </div>
        <div className="mt-6">
          <InvoiceDocument invoice={invoice} overdue={isOverdue(invoice)} />
        </div>
      </main>
    </>
  );
}
