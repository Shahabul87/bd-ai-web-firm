import type { ElementType, ReactNode } from 'react';

interface MonoLabelProps {
  children: ReactNode;
  className?: string;
  /**
   * The element to render. Defaults to a `<span>`. Set it when the label plays
   * a semantic role — e.g. `as="dt"` for the term of a definition list, so the
   * `<dl>` contains a real `<dt>`/`<dd>` pair (an accessibility requirement).
   */
  as?: ElementType;
}

/** Structural mono microcopy: section indices, status readouts, data callouts. */
export default function MonoLabel({ children, className = '', as: Tag = 'span' }: MonoLabelProps) {
  return (
    <Tag
      className={`font-mono text-xs uppercase tracking-[0.18em] text-steel ${className}`}
    >
      {children}
    </Tag>
  );
}
