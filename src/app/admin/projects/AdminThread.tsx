'use client';

import { useState, useTransition } from 'react';
import { sendAdminMessage } from '../actions';

interface Msg {
  id: string;
  senderType: 'ADMIN' | 'CLIENT';
  body: string;
  createdAt: string; // ISO
}

export default function AdminThread({ projectId, messages }: { projectId: string; messages: Msg[] }) {
  const [pending, start] = useTransition();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError('');
    start(async () => {
      try {
        await sendAdminMessage(projectId, body);
        setBody('');
      } catch {
        setError('Could not send.');
      }
    });
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
        Client messages ({messages.length})
      </p>
      <ul className="mt-3 space-y-3">
        {messages.length === 0 ? (
          <li className="text-sm text-steel">No messages yet.</li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className={`max-w-[85%] border p-3 text-sm ${
                m.senderType === 'ADMIN'
                  ? 'ml-auto border-signal/40 bg-signal/5'
                  : 'mr-auto border-line bg-ink-900'
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel/70">
                {m.senderType === 'ADMIN' ? 'You' : 'Client'} ·{' '}
                {new Date(m.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-bone">{m.body}</p>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <textarea
          aria-label="Reply to client"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reply to the client…"
          className="w-full resize-none border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="bg-signal px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send reply'}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
