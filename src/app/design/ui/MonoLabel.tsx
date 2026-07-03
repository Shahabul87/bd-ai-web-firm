import type { ReactNode } from 'react';

interface MonoLabelProps {
  children: ReactNode;
  className?: string;
}

/** Structural mono microcopy: section indices, status readouts, data callouts. */
export default function MonoLabel({ children, className = '' }: MonoLabelProps) {
  return (
    <span
      className={`font-mono text-xs uppercase tracking-[0.18em] text-steel ${className}`}
    >
      {children}
    </span>
  );
}
