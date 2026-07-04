import type { ProjectStatusValue } from '@/app/lib/projects';

const STYLES: Record<ProjectStatusValue, string> = {
  DISCOVERY: 'border-steel/50 text-steel',
  BUILD: 'border-signal/50 text-signal',
  REVIEW: 'border-amber/50 text-amber',
  LAUNCHED: 'border-signal text-signal',
  MAINTENANCE: 'border-steel/50 text-steel',
  ON_HOLD: 'border-amber/50 text-amber',
};

const LABELS: Record<ProjectStatusValue, string> = {
  DISCOVERY: 'Discovery',
  BUILD: 'Build',
  REVIEW: 'Review',
  LAUNCHED: 'Launched',
  MAINTENANCE: 'Maintenance',
  ON_HOLD: 'On hold',
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatusValue }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
