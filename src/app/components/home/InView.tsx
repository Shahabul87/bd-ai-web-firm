'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface InViewProps {
  children: ReactNode;
  className?: string;
  /** Keep `.vis` once it has been seen (reveals) instead of toggling (loops). */
  once?: boolean;
}

/**
 * Adds `.vis` while the element is on screen, so the CSS-only diagram loops
 * (pulses, scans, trace reveals) run only when someone can see them.
 */
export default function InView({ children, className = '', once = false }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('vis');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (once) {
            if (entry.isIntersecting) {
              node.classList.add('vis');
              io.disconnect();
            }
          } else {
            node.classList.toggle('vis', entry.isIntersecting);
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
