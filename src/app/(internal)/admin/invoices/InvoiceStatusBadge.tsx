import type { InvoiceStatusValue } from '@/app/lib/invoices';

const STYLES: Record<InvoiceStatusValue, string> = {
  DRAFT: 'border-steel/50 text-steel',
  SENT: 'border-signal/50 text-signal',
  PAID: 'border-green-500/50 text-green-400',
  VOID: 'border-steel/50 text-steel line-through',
};

const LABELS: Record<InvoiceStatusValue, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  VOID: 'Void',
};

export default function InvoiceStatusBadge({
  status,
  overdue = false,
}: {
  status: InvoiceStatusValue;
  overdue?: boolean;
}) {
  if (overdue && status === 'SENT') {
    return (
      <span className="inline-block border border-red-500/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-red-400">
        Overdue
      </span>
    );
  }
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
