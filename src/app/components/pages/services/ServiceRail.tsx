'use client';

import { useEffect, useState } from 'react';

interface RailItem {
  id: string;
  n: string;
  title: string;
}

interface ServiceRailProps {
  label: string;
  items: RailItem[];
}

/**
 * The sticky index beside the six specs. It marks the spec being read and
 * fills a gold progress line as the reader moves down the page.
 */
export default function ServiceRail({ label, items }: ServiceRailProps) {
  const [current, setCurrent] = useState<number>(-1);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((n): n is HTMLElement => n !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = items.findIndex((item) => item.id === entry.target.id);
          if (i >= 0) setCurrent(i);
        }
      },
      // A spec is "current" once it crosses the upper-middle of the viewport.
      { rootMargin: '-38% 0px -58% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  const progress = current < 0 ? 0 : (current + 1) / items.length;

  return (
    <nav className="sv-rail" aria-label={label}>
      <span className="sv-rail-track" aria-hidden="true">
        <i style={{ transform: `scaleY(${progress})` }} />
      </span>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={i === current ? 'true' : undefined}>
              <span className="sv-rail-n">{item.n}</span>
              <span className="sv-rail-t">{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
