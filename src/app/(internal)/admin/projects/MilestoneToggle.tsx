'use client';

import { useTransition } from 'react';
import { toggleMilestoneAction } from '../actions';

export default function MilestoneToggle({
  id,
  projectId,
  done,
}: {
  id: string;
  projectId: string;
  done: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? 'Mark as pending' : 'Mark as done'}
      disabled={pending}
      onClick={() => start(async () => { await toggleMilestoneAction(id, projectId); })}
      className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors disabled:opacity-50 ${
        done ? 'border-signal bg-signal text-ink-950' : 'border-line text-transparent hover:border-signal'
      }`}
    >
      ✓
    </button>
  );
}
