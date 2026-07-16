'use client';

import { useState, useTransition } from 'react';
import { setLeadStatus, addNote } from '../../actions';
import type { LeadStatusValue } from '@/app/lib/leads';

const STATUSES: LeadStatusValue[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export default function LeadControls({ id, status }: { id: string; status: LeadStatusValue }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function changeStatus(value: string) {
    setError('');
    startTransition(async () => {
      try {
        await setLeadStatus(id, value);
      } catch {
        setError('Could not update status.');
      }
    });
  }

  function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        await addNote(id, note);
        setNote('');
      } catch {
        setError('Could not add note.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="lead-status"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-steel"
        >
          Status
        </label>
        <select
          id="lead-status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) => changeStatus(e.target.value)}
          className="border border-line bg-ink-900 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bone focus:border-signal focus:outline-none disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={submitNote}>
        <label
          htmlFor="lead-note"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-steel"
        >
          Add internal note
        </label>
        <textarea
          id="lead-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Called, left voicemail. Following up Tuesday."
          className="w-full resize-none border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !note.trim()}
          className="mt-2 bg-signal px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Add note'}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
