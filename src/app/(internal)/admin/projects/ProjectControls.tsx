'use client';

import { useState, useTransition } from 'react';
import { setProjectStatusAction, addMilestoneAction, addProjectUpdateAction } from '../actions';
import type { ProjectStatusValue } from '@/app/lib/projects';

const STATUSES: { value: ProjectStatusValue; label: string }[] = [
  { value: 'DISCOVERY', label: 'Discovery' },
  { value: 'BUILD', label: 'Build' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'LAUNCHED', label: 'Launched' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'ON_HOLD', label: 'On hold' },
];

const label = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-steel';
const field =
  'w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none';

export default function ProjectControls({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatusValue;
}) {
  const [pending, start] = useTransition();
  const [msTitle, setMsTitle] = useState('');
  const [msDue, setMsDue] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'INTERNAL' | 'CLIENT'>('INTERNAL');
  const [error, setError] = useState('');

  function changeStatus(next: string) {
    setError('');
    start(async () => {
      try {
        await setProjectStatusAction(projectId, next);
      } catch {
        setError('Could not update status.');
      }
    });
  }

  function addMs(e: React.FormEvent) {
    e.preventDefault();
    if (!msTitle.trim()) return;
    setError('');
    start(async () => {
      try {
        await addMilestoneAction(projectId, msTitle, msDue || undefined);
        setMsTitle('');
        setMsDue('');
      } catch {
        setError('Could not add milestone.');
      }
    });
  }

  function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError('');
    start(async () => {
      try {
        await addProjectUpdateAction(projectId, body, visibility);
        setBody('');
      } catch {
        setError('Could not post update.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className={label} htmlFor="p-status">Status</label>
        <select
          id="p-status"
          value={status}
          disabled={pending}
          onChange={(e) => changeStatus(e.target.value)}
          className={`${field} font-mono uppercase tracking-[0.1em]`}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={addMs} className="border-t border-line pt-5">
        <label className={label} htmlFor="p-ms">Add milestone</label>
        <input
          id="p-ms"
          className={field}
          value={msTitle}
          onChange={(e) => setMsTitle(e.target.value)}
          placeholder="Milestone title"
        />
        <input
          type="date"
          aria-label="Milestone due date"
          className={`${field} mt-2`}
          value={msDue}
          onChange={(e) => setMsDue(e.target.value)}
        />
        <button
          type="submit"
          disabled={pending || !msTitle.trim()}
          className="mt-2 w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
        >
          Add milestone
        </button>
      </form>

      <form onSubmit={postUpdate} className="border-t border-line pt-5">
        <label className={label} htmlFor="p-update">Post update</label>
        <textarea
          id="p-update"
          rows={3}
          className={`${field} resize-none`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What happened…"
        />
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
          {(['INTERNAL', 'CLIENT'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={`border px-3 py-1 transition-colors ${
                visibility === v ? 'border-signal text-signal' : 'border-line text-steel hover:text-bone'
              }`}
            >
              {v === 'INTERNAL' ? 'Internal' : 'Client-visible'}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="mt-2 w-full bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
        >
          Post update
        </button>
      </form>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
