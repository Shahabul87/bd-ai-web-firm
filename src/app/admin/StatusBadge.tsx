import type { LeadStatusValue } from '@/app/lib/leads';

const STYLES: Record<LeadStatusValue, string> = {
  NEW: 'border-signal/50 text-signal',
  CONTACTED: 'border-amber/50 text-amber',
  QUALIFIED: 'border-steel/50 text-steel',
  PROPOSAL: 'border-amber/50 text-amber',
  WON: 'border-signal text-signal',
  LOST: 'border-red-500/40 text-red-400',
};

export default function StatusBadge({ status }: { status: LeadStatusValue }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
