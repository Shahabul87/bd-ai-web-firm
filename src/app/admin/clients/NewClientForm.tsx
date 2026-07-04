'use client';

import { useState, useTransition } from 'react';
import { createClientAction } from '../actions';

const label = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-steel';
const input =
  'w-full border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none';

export default function NewClientForm() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', notes: '' });
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setError('');
    start(async () => {
      try {
        await createClientAction(form);
      } catch {
        setError('Could not create client (check the email is valid).');
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-3 border border-line p-6">
      <div>
        <label className={label} htmlFor="n-name">Name *</label>
        <input id="n-name" className={input} value={form.name} onChange={set('name')} />
      </div>
      <div>
        <label className={label} htmlFor="n-email">Email *</label>
        <input id="n-email" type="email" className={input} value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label className={label} htmlFor="n-company">Company</label>
        <input id="n-company" className={input} value={form.company} onChange={set('company')} />
      </div>
      <div>
        <label className={label} htmlFor="n-phone">Phone</label>
        <input id="n-phone" className={input} value={form.phone} onChange={set('phone')} />
      </div>
      <div>
        <label className={label} htmlFor="n-notes">Notes</label>
        <textarea id="n-notes" rows={3} className={`${input} resize-none`} value={form.notes} onChange={set('notes')} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
      >
        {pending ? 'Creating…' : 'Create client'}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
