'use client';

import { useEffect, useRef, useState } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';
import IndexRow, { type IndexRowData } from './IndexRow';

export interface ArchiveTag {
  id: string;
  label: string;
  count: number;
}

export interface ArchiveLabels {
  filter: string;
  all: string;
  /** "Showing {shown} of {total}" */
  showing: string;
  empty: string;
  tags: string;
}

interface ArchiveIndexProps {
  rows: IndexRowData[];
  tags: ArchiveTag[];
  labels: ArchiveLabels;
  bengaliDigits: boolean;
  contentLang?: string;
}

/**
 * The blog / guides index: editorial rows with a tag filter. Chips are toggle
 * buttons (aria-pressed); a polite status line reports how many rows match.
 * Rows rise in as they scroll into view — armed only after hydration (via
 * data-live), with rows already on screen revealed at once, so the server
 * HTML and no-JS visitors always see the whole list.
 */
export default function ArchiveIndex({ rows, tags, labels, bengaliDigits, contentLang }: ArchiveIndexProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rowsEls = Array.from(list.querySelectorAll<HTMLElement>('.rs-a-row'));
    const vh = window.innerHeight;
    for (const el of rowsEls) {
      if (el.getBoundingClientRect().top < vh) el.classList.add('vis');
    }
    if (typeof IntersectionObserver === 'undefined') {
      rowsEls.forEach((el) => el.classList.add('vis'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    rowsEls.forEach((el) => {
      if (!el.classList.contains('vis')) io.observe(el);
    });
    setLive(true);
    return () => io.disconnect();
  }, []);

  const shown = tag ? rows.filter((r) => r.tags.some((t) => t.id === tag)) : rows;
  const digits = (n: number) => (bengaliDigits ? toBengaliDigits(n) : String(n));
  const status = labels.showing.replace('{shown}', digits(shown.length)).replace('{total}', digits(rows.length));

  return (
    <div className="rs-archive" data-live={live ? 'true' : undefined}>
      {tags.length > 1 ? (
        <div className="rs-filter">
          <div className="rs-chips" role="group" aria-label={labels.filter}>
            <button type="button" className="rs-chip" aria-pressed={tag === null} onClick={() => setTag(null)}>
              {labels.all}
              <span className="rs-chip-c pg-num">{digits(rows.length)}</span>
            </button>
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                className="rs-chip"
                aria-pressed={tag === t.id}
                onClick={() => setTag(tag === t.id ? null : t.id)}
              >
                {t.label}
                <span className="rs-chip-c pg-num">{digits(t.count)}</span>
              </button>
            ))}
          </div>
          <p className="rs-filter-s pg-cap pg-num" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      ) : null}

      <ol ref={listRef} className="rs-index rs-index-lg">
        {rows.map((row) => {
          const on = shown.includes(row);
          return (
            <li key={row.key} className="rs-a-row" hidden={!on}>
              <IndexRow row={row} as="h2" contentLang={contentLang} tagsLabel={labels.tags} />
            </li>
          );
        })}
      </ol>
      {shown.length === 0 ? <p className="rs-empty">{labels.empty}</p> : null}
    </div>
  );
}
