import type { ReactNode } from 'react';

export interface SpecRow {
  label: string;
  value: ReactNode;
}

interface SpecTableProps {
  rows: SpecRow[];
  className?: string;
}

/** Spec-sheet table: mono steel labels, bone values, hairline dividers. */
export default function SpecTable({ rows, className = '' }: SpecTableProps) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(120px,1fr)_2fr] gap-4 py-3">
          <dt className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed text-bone">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
