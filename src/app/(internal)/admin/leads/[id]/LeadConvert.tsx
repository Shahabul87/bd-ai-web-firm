'use client';

import { useState, useTransition } from 'react';
import { convertLeadAction } from '../../actions';

export default function LeadConvert({
  leadId,
  defaultTitle,
}: {
  leadId: string;
  defaultTitle: string;
}) {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(defaultTitle);
  const [error, setError] = useState('');

  function convert(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    start(async () => {
      try {
        await convertLeadAction(leadId, title.trim());
        // On success the action redirects to the new project.
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not convert.');
      }
    });
  }

  return (
    <form onSubmit={convert} className="border-t border-line pt-5">
      <label htmlFor="convert-title" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
        Convert to client
      </label>
      <input
        id="convert-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="First project title"
        className="w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending || !title.trim()}
        className="mt-2 w-full bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
      >
        {pending ? 'Converting…' : 'Convert to client'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
