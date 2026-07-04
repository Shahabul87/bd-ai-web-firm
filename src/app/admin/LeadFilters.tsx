'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const STATUSES = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
const SOURCES = ['', 'CONTACT', 'QUOTE', 'DEMO'];

const selCls =
  'border border-line bg-ink-900 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bone focus:border-signal focus:outline-none';

export default function LeadFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');

  function push(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by status"
        value={sp.get('status') ?? ''}
        onChange={(e) => push({ status: e.target.value })}
        className={selCls}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s || 'All statuses'}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by source"
        value={sp.get('source') ?? ''}
        onChange={(e) => push({ source: e.target.value })}
        className={selCls}
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>
            {s || 'All sources'}
          </option>
        ))}
      </select>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q });
        }}
        className="flex gap-2"
      >
        <input
          aria-label="Search leads"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / company"
          className="border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal"
        >
          Search
        </button>
      </form>
    </div>
  );
}
