'use client';

import { useMemo, useState, useTransition } from 'react';
import { createInvoiceAction, updateInvoiceDraftAction } from '../actions';
import { parseMoneyToMinor, computeTotals, formatMoney } from '@/app/lib/money';

export interface ClientOption {
  id: string;
  name: string;
  projects: { id: string; title: string }[];
}
interface LineRow {
  description: string;
  quantity: string;
  unitPrice: string;
}
export interface BuilderInitial {
  clientId: string;
  projectId?: string;
  currency: string;
  taxLabel?: string;
  taxRatePct?: string;
  dueDate?: string;
  notes?: string;
  lines: LineRow[];
}

const CURRENCIES = ['USD', 'BDT', 'EUR', 'GBP'];
const label = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-steel';
const field =
  'w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none';

const EMPTY_LINE: LineRow = { description: '', quantity: '1', unitPrice: '' };

export default function InvoiceBuilder({
  clients,
  invoiceId,
  initial,
}: {
  clients: ClientOption[];
  invoiceId?: string;
  initial?: BuilderInitial;
}) {
  const [pending, start] = useTransition();
  const [clientId, setClientId] = useState(initial?.clientId ?? clients[0]?.id ?? '');
  const [projectId, setProjectId] = useState(initial?.projectId ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [lines, setLines] = useState<LineRow[]>(initial?.lines?.length ? initial.lines : [{ ...EMPTY_LINE }]);
  const [taxLabel, setTaxLabel] = useState(initial?.taxLabel ?? '');
  const [taxRatePct, setTaxRatePct] = useState(initial?.taxRatePct ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');

  const projects = clients.find((c) => c.id === clientId)?.projects ?? [];

  const totals = useMemo(() => {
    const parsed = lines.map((l) => ({
      quantity: Number(l.quantity) || 0,
      unitPriceMinor: parseMoneyToMinor(l.unitPrice) ?? 0,
    }));
    const bps = Math.round((Number(taxRatePct) || 0) * 100);
    return computeTotals(parsed, bps);
  }, [lines, taxRatePct]);

  function setLine(i: number, patch: Partial<LineRow>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [...ls, { ...EMPTY_LINE }]);
  }
  function removeLine(i: number) {
    setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!clientId) return setError('Pick a client.');
    const built: { description: string; quantity: number; unitPriceMinor: number }[] = [];
    for (const l of lines) {
      const minor = parseMoneyToMinor(l.unitPrice);
      const qty = Number(l.quantity);
      if (!l.description.trim() || !Number.isInteger(qty) || qty <= 0 || minor === null) {
        return setError('Each line needs a description, a whole-number quantity, and a valid price.');
      }
      built.push({ description: l.description.trim(), quantity: qty, unitPriceMinor: minor });
    }
    const form = {
      clientId,
      projectId: projectId || undefined,
      currency,
      taxLabel: taxLabel.trim() || undefined,
      taxRateBps: Math.round((Number(taxRatePct) || 0) * 100),
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
      lines: built,
    };
    start(async () => {
      try {
        if (invoiceId) await updateInvoiceDraftAction(invoiceId, form);
        else await createInvoiceAction(form);
      } catch {
        setError('Could not save the invoice. Check the fields and try again.');
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="inv-client">Client</label>
          <select
            id="inv-client"
            className={field}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId('');
            }}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="inv-project">Project (optional)</label>
          <select id="inv-project" className={field} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">— none —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="inv-currency">Currency</label>
          <select id="inv-currency" className={field} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between">
          <p className={label}>Line items</p>
          <button type="button" onClick={addLine} className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal hover:underline">
            + Add line
          </button>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_110px_28px] items-center gap-2">
              <input
                aria-label={`Line ${i + 1} description`}
                className={field}
                value={l.description}
                onChange={(e) => setLine(i, { description: e.target.value })}
                placeholder="Description"
              />
              <input
                aria-label={`Line ${i + 1} quantity`}
                inputMode="numeric"
                className={`${field} text-right`}
                value={l.quantity}
                onChange={(e) => setLine(i, { quantity: e.target.value.replace(/\D/g, '') })}
                placeholder="Qty"
              />
              <input
                aria-label={`Line ${i + 1} unit price`}
                inputMode="decimal"
                className={`${field} text-right`}
                value={l.unitPrice}
                onChange={(e) => setLine(i, { unitPrice: e.target.value })}
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                aria-label={`Remove line ${i + 1}`}
                className="text-steel transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tax + due + notes */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="inv-taxlabel">Tax label (optional)</label>
          <input id="inv-taxlabel" className={field} value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} placeholder="VAT 15%" />
        </div>
        <div>
          <label className={label} htmlFor="inv-taxrate">Tax rate %</label>
          <input
            id="inv-taxrate"
            inputMode="decimal"
            className={field}
            value={taxRatePct}
            onChange={(e) => setTaxRatePct(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className={label} htmlFor="inv-due">Due date</label>
          <input id="inv-due" type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="inv-notes">Notes / payment instructions</label>
        <textarea
          id="inv-notes"
          rows={3}
          className={`${field} resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Bank / Wise / bKash details, payment terms…"
        />
      </div>

      {/* Live totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1 border border-line p-4 text-sm">
          <div className="flex justify-between text-steel">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotalMinor, currency)}</span>
          </div>
          {totals.taxMinor > 0 && (
            <div className="flex justify-between text-steel">
              <span>Tax</span>
              <span>{formatMoney(totals.taxMinor, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-1 font-display text-lg text-bone">
            <span>Total</span>
            <span>{formatMoney(totals.totalMinor, currency)}</span>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
      >
        {pending ? 'Saving…' : invoiceId ? 'Save draft' : 'Create draft invoice'}
      </button>
    </form>
  );
}
