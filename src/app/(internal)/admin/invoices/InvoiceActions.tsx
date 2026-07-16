'use client';

import { useState, useTransition } from 'react';
import { sendInvoiceAction, markInvoicePaidAction, voidInvoiceAction } from '../actions';
import type { InvoiceStatusValue } from '@/app/lib/invoices';

const primary =
  'w-full bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50';
const ghost =
  'w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50';

export default function InvoiceActions({ id, status }: { id: string; status: InvoiceStatusValue }) {
  const [pending, start] = useTransition();
  const [paymentRef, setPaymentRef] = useState('');
  const [error, setError] = useState('');

  const run = (fn: () => Promise<void>, msg: string) => {
    setError('');
    start(async () => {
      try {
        await fn();
      } catch {
        setError(msg);
      }
    });
  };

  return (
    <div className="space-y-3">
      {status === 'DRAFT' && (
        <button onClick={() => run(() => sendInvoiceAction(id), 'Could not send.')} disabled={pending} className={primary}>
          {pending ? 'Working…' : 'Send invoice to client'}
        </button>
      )}

      {status === 'SENT' && (
        <div className="space-y-2">
          <label htmlFor="pay-ref" className="block font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
            Payment reference (optional)
          </label>
          <input
            id="pay-ref"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="e.g. Wise, 4 Jul"
            className="w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
          />
          <button
            onClick={() => run(() => markInvoicePaidAction(id, paymentRef), 'Could not mark paid.')}
            disabled={pending}
            className={primary}
          >
            {pending ? 'Working…' : 'Mark as paid'}
          </button>
        </div>
      )}

      {status !== 'VOID' && status !== 'PAID' && (
        <button
          onClick={() => {
            if (confirm('Void this invoice? It stays on record but is cancelled.')) {
              run(() => voidInvoiceAction(id), 'Could not void.');
            }
          }}
          disabled={pending}
          className={ghost}
        >
          Void invoice
        </button>
      )}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
