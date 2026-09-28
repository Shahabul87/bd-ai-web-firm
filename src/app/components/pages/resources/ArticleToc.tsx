'use client';

import { useEffect, useState } from 'react';
import type { TocHeading } from './headings';

interface ArticleTocProps {
  headings: TocHeading[];
  label: string;
  /** Section numbers, already localised ("01", "০১"). */
  numbers: string[];
}

/** The heading counts as "being read" once its top passes this line. */
const READ_LINE = 140;

/**
 * The article's table of contents. Server-rendered as a plain list of links;
 * once hydrated it marks the section being read (aria-current="location") and
 * fills the rail up to it. Tracking is scroll-driven (one rAF per scroll
 * burst) and needs no motion, so it runs under reduced motion as well.
 */
export default function ArticleToc({ headings, label, numbers }: ArticleTocProps) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = -1;
      for (let i = 0; i < nodes.length; i += 1) {
        if (nodes[i].getBoundingClientRect().top <= READ_LINE) current = i;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [headings]);

  if (headings.length === 0) return null;
  let h2 = -1;

  return (
    <nav className="rs-toc" aria-label={label}>
      <p className="rs-toc-h pg-cap">{label}</p>
      <ol>
        {headings.map((h, i) => {
          if (h.level === 2) h2 += 1;
          const state = i === active ? 'now' : i < active ? 'read' : undefined;
          return (
            <li key={h.id} className={h.level === 3 ? 'rs-toc-sub' : undefined} data-state={state}>
              <a href={`#${h.id}`} aria-current={i === active ? 'location' : undefined}>
                {h.level === 2 ? (
                  <span className="rs-toc-n pg-num" aria-hidden="true">
                    {numbers[h2] ?? ''}
                  </span>
                ) : null}
                <span className="rs-toc-t">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
