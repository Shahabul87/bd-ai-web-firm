'use client';

import { useState, useTransition } from 'react';
import { sendClientMessage } from '../../actions';

export default function MessageComposer({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError('');
    start(async () => {
      try {
        await sendClientMessage(projectId, body);
        setBody('');
      } catch {
        setError('Could not send. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        aria-label="Your message"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a message to the CraftsAI team…"
        className="w-full resize-none border border-line bg-ink-900 px-3 py-2 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="bg-signal px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
