import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

/**
 * Blueprint card: ink surface, hairline border, corner-tick brackets.
 * No rounded-glass, no glow (spec §2 motif 5).
 */
export default function Card({ children, className = '', interactive = false }: CardProps) {
  const tick =
    'pointer-events-none absolute h-3 w-3 border-line transition-colors duration-150' +
    (interactive ? ' group-hover:border-signal' : '');
  return (
    <div
      className={`group relative border border-line/60 bg-ink-900 p-6 ${
        interactive ? 'transition-colors duration-150 hover:bg-ink-800' : ''
      } ${className}`}
    >
      <span aria-hidden className={`${tick} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${tick} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${tick} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${tick} bottom-0 right-0 border-b border-r`} />
      {children}
    </div>
  );
}
