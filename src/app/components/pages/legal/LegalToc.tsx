'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TocItem {
  id: string;
  n: string;
  title: string;
}

interface LegalTocProps {
  items: TocItem[];
  label: string;
}

/** A section counts as "current" once its top has passed this line (below the fixed header). */
const LINE = 140;

/**
 * The legal pages' table of contents. On desktop it is sticky and a gold
 * indicator slides to the section being read; on mobile it becomes a sticky
 * "On this page" bar naming the current section, which opens the full list.
 * Server HTML (and no-JS): a plain, fully expanded list of links.
 */
export default function LegalToc({ items, label }: LegalTocProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;
    const link = list.querySelectorAll<HTMLElement>('a')[active];
    if (!link) return;
    bar.style.transform = `translateY(${link.offsetTop}px)`;
    bar.style.height = `${link.offsetHeight}px`;
  }, [active]);

  useEffect(() => {
    setReady(true);
    let raf = 0;
    const measure = () => {
      raf = 0;
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < LINE) current = i;
      });
      // At the very bottom the last section may never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = items.length - 1;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, [items]);

  useEffect(() => {
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [place, open]);

  const current = items[active];

  return (
    <nav className="lg-toc" aria-labelledby="lg-toc-h" data-state={ready ? 'ready' : undefined} data-open={open ? '' : undefined}>
      <p className="lg-toc-h pg-cap" id="lg-toc-h">
        {label}
      </p>
      <button
        type="button"
        className="lg-toc-toggle"
        aria-expanded={open}
        aria-controls="lg-toc-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="lg-toc-toggle-k">{label}</span>
        {current ? (
          <span className="lg-toc-toggle-v">
            <span className="lg-toc-n">{current.n}</span> {current.title}
          </span>
        ) : null}
        <span className="lg-toc-chev" aria-hidden="true" />
      </button>
      <div className="lg-toc-body">
        <ol className="lg-toc-list" id="lg-toc-list" ref={listRef}>
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={ready && i === active ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="lg-toc-n">{item.n}</span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <span className="lg-toc-bar" ref={barRef} aria-hidden="true" />
      </div>
    </nav>
  );
}
