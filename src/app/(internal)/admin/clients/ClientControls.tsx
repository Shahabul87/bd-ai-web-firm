'use client';

import { useState, useTransition } from 'react';
import {
  updateClientAction,
  archiveClientAction,
  createProjectAction,
  inviteToPortalAction,
} from '../actions';

interface Defaults {
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
}

const label = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-steel';
const input =
  'w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none';

export default function ClientControls({
  id,
  defaults,
  archived,
  portalEnabled,
}: {
  id: string;
  defaults: Defaults;
  archived: boolean;
  portalEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState(defaults);
  const [projectTitle, setProjectTitle] = useState('');
  const [error, setError] = useState('');
  const [invited, setInvited] = useState(false);

  function invite() {
    setError('');
    start(async () => {
      try {
        await inviteToPortalAction(id);
        setInvited(true);
      } catch {
        setError('Could not send invite.');
      }
    });
  }

  const set = (k: keyof Defaults) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function save() {
    setError('');
    start(async () => {
      try {
        await updateClientAction(id, form);
      } catch {
        setError('Could not save.');
      }
    });
  }

  function newProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    setError('');
    start(async () => {
      try {
        await createProjectAction(id, projectTitle);
      } catch {
        setError('Could not create project.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <label className={label} htmlFor="c-name">Name</label>
          <input id="c-name" className={input} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className={label} htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className={input} value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className={label} htmlFor="c-company">Company</label>
          <input id="c-company" className={input} value={form.company} onChange={set('company')} />
        </div>
        <div>
          <label className={label} htmlFor="c-phone">Phone</label>
          <input id="c-phone" className={input} value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className={label} htmlFor="c-notes">Notes</label>
          <textarea id="c-notes" rows={3} className={`${input} resize-none`} value={form.notes} onChange={set('notes')} />
        </div>
        <button
          onClick={save}
          disabled={pending}
          className="w-full bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <form onSubmit={newProject} className="border-t border-line pt-5">
        <label className={label} htmlFor="c-project">New project</label>
        <input
          id="c-project"
          className={input}
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Project title"
        />
        <button
          type="submit"
          disabled={pending || !projectTitle.trim()}
          className="mt-2 w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
        >
          Create project
        </button>
      </form>

      <div className="border-t border-line pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Client portal</p>
        <p className="mt-1 text-xs text-steel">
          {portalEnabled || invited
            ? 'Access enabled — the client can sign in at /portal/login.'
            : 'Off — the client cannot sign in yet.'}
        </p>
        <button
          onClick={invite}
          disabled={pending || archived}
          className="mt-2 w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
        >
          {portalEnabled || invited ? 'Re-send invite' : 'Invite to portal'}
        </button>
      </div>

      {!archived && (
        <button
          onClick={() => start(async () => { try { await archiveClientAction(id); } catch { setError('Could not archive.'); } })}
          disabled={pending}
          className="w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
        >
          Archive client
        </button>
      )}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
