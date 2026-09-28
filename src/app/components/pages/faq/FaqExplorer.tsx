'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from '@/i18n/navigation';
import { toBengaliDigits } from '@/app/lib/numerals';
import { highlight, queryTerms, rank, type FaqItem, type Segment } from './search';

export interface FaqCategoryInfo {
  id: string;
  label: string;
}

export interface FaqLabels {
  label: string;
  placeholder: string;
  clear: string;
  hint: string;
  /** "Showing {shown} of {total}" */
  count: string;
  ranked: string;
  results: string;
  inAnswer: string;
  chipsLabel: string;
  all: string;
  empty: string;
  emptyBody: string;
  emptyCta: string;
  link: string;
  copied: string;
}

interface FaqExplorerProps {
  items: FaqItem[];
  categories: FaqCategoryInfo[];
  labels: FaqLabels;
  bengaliDigits: boolean;
  contactHref: string;
}

/** With this many results or fewer, a search opens the answers so the highlights are visible. */
const AUTO_OPEN = 3;

type Phase = 'static' | 'ready' | 'live';

function Marked({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.hit ? (
          <mark key={i} className="fq-hit">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

/**
 * The FAQ as something you ask: a search box that filters the questions live
 * (every term must match; hits highlighted in gold; results ranked, with a
 * mint bar for how closely each matches), topic chips, and an accordion whose
 * answers are deep-linkable (#id opens and scrolls to one).
 *
 * The server HTML lists every question with its answer open, grouped by
 * topic, so crawlers, no-JS and pre-hydration visitors read everything; once
 * hydrated the answers fold away (without animating that first fold).
 */
export default function FaqExplorer({ items, categories, labels, bengaliDigits, contactHref }: FaqExplorerProps) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [shut, setShut] = useState<ReadonlySet<string>>(() => new Set());
  const [phase, setPhase] = useState<Phase>('static');
  const [sweep, setSweep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const num = useCallback((n: number) => (bengaliDigits ? toBengaliDigits(n) : String(n)), [bengaliDigits]);

  const terms = useMemo(() => queryTerms(query), [query]);
  const searching = terms.length > 0;
  const inCat = useMemo(() => (cat === 'all' ? items : items.filter((it) => it.categoryId === cat)), [items, cat]);
  const results = useMemo(() => rank(inCat, terms), [inCat, terms]);
  const perCat = useMemo(() => {
    const all = rank(items, terms);
    const m = new Map<string, number>();
    all.forEach((r) => m.set(r.item.categoryId, (m.get(r.item.categoryId) ?? 0) + 1));
    return { total: all.length, m };
  }, [items, terms]);
  const maxScore = results.reduce((m, r) => Math.max(m, r.score), 0) || 1;
  const autoOpen = searching && results.length <= AUTO_OPEN;

  const isOpen = (id: string) => (phase === 'static' ? true : autoOpen ? !shut.has(id) : open.has(id));

  const toggle = (id: string) => {
    if (autoOpen) {
      setShut((s) => {
        const next = new Set(s);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    const opening = !open.has(id);
    setOpen((s) => {
      const next = new Set(s);
      if (opening) next.add(id);
      else next.delete(id);
      return next;
    });
    if (opening) window.history.replaceState(null, '', `#${id}`);
  };

  // Open the answer named in the URL hash (on load and on hashchange).
  const openFromHash = useCallback(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !items.some((it) => it.id === id)) return;
    setQuery('');
    setCat('all');
    setOpen((s) => new Set(s).add(id));
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }, [items]);

  useEffect(() => {
    setPhase('ready');
    const raf = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPhase('live')));
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', openFromHash);
    };
  }, [openFromHash]);

  // "/" focuses the search box from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(null), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onQuery = (value: string) => {
    setQuery(value);
    setShut(new Set());
    setSweep((n) => n + 1);
  };

  const copyLink = (e: MouseEvent, id: string) => {
    // Keep the search as it is: set the hash without a hashchange, then copy.
    e.preventDefault();
    window.history.replaceState(null, '', `#${id}`);
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url).then(
      () => setCopied(id),
      () => undefined,
    );
  };

  const countText = labels.count.replace('{shown}', num(results.length)).replace('{total}', num(items.length));

  const renderItem = (r: { item: FaqItem; score: number; answerOnly: boolean }, showMeta: boolean) => {
    const { item } = r;
    const expanded = isOpen(item.id);
    const btnId = `${item.id}-q`;
    const panelId = `${item.id}-a`;
    return (
      <div key={item.id} id={item.id} className="fq-item" data-open={expanded ? '' : undefined}>
        {showMeta ? (
          <p className="fq-meta" aria-hidden="true">
            <span className="fq-rel">
              <i style={{ '--w': r.score / maxScore } as CSSProperties} />
            </span>
            <span>{item.category}</span>
            {r.answerOnly ? <span className="fq-meta-a">{labels.inAnswer}</span> : null}
          </p>
        ) : null}
        <h3 className="fq-q">
          <button
            type="button"
            id={btnId}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => toggle(item.id)}
          >
            <span className="fq-q-text">
              <Marked segments={highlight(item.question, terms)} />
            </span>
            <span className="fq-icon" aria-hidden="true" />
          </button>
        </h3>
        <div id={panelId} className="fq-panel">
          <div className="fq-panel-in">
            <p className="fq-answer">
              <Marked segments={highlight(item.answer, terms)} />
            </p>
            <a
              className="fq-link"
              href={`#${item.id}`}
              onClick={(e) => copyLink(e, item.id)}
            >
              <span aria-hidden="true">#</span> {copied === item.id ? labels.copied : labels.link}
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fq-explorer" data-state={phase}>
      <div className="attn-wrap">
        <div className="fq-search" role="search">
          <label className="pg-cap fq-search-label" htmlFor="fq-input">
            {labels.label}
          </label>
          <div className="fq-box">
            <span className="fq-prompt" aria-hidden="true">
              ›
            </span>
            <input
              ref={inputRef}
              id="fq-input"
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) {
                  e.preventDefault();
                  onQuery('');
                }
              }}
              placeholder={labels.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="fq-count"
            />
            {query ? (
              <button type="button" className="fq-clear" onClick={() => { onQuery(''); inputRef.current?.focus(); }}>
                {labels.clear}
              </button>
            ) : (
              <kbd className="fq-kbd" aria-hidden="true" title={labels.hint}>
                /
              </kbd>
            )}
            <span key={sweep} className={`fq-sweep${sweep ? ' on' : ''}`} aria-hidden="true" />
          </div>
          <div className="fq-bar">
            <div className="fq-chips" role="group" aria-label={labels.chipsLabel}>
              <button type="button" className="fq-chip" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
                {labels.all}
                <span className="fq-chip-n pg-num">{num(perCat.total)}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="fq-chip"
                  aria-pressed={cat === c.id}
                  onClick={() => setCat(c.id)}
                >
                  {c.label}
                  <span className="fq-chip-n pg-num">{num(perCat.m.get(c.id) ?? 0)}</span>
                </button>
              ))}
            </div>
            <p className="pg-cap pg-num fq-count" id="fq-count" role="status" aria-live="polite">
              {countText}
            </p>
          </div>
        </div>

        <div className="fq-list">
          {results.length === 0 ? (
            <div className="fq-empty pg-panel">
              <p className="fq-empty-h">{labels.empty}</p>
              <p>{labels.emptyBody}</p>
              <Link className="attn-btn attn-btn-secondary attn-btn-sm" href={contactHref}>
                {labels.emptyCta}
              </Link>
            </div>
          ) : searching ? (
            <section className="fq-group" aria-labelledby="fq-results-h">
              <h2 className="sr-only" id="fq-results-h">
                {labels.results}
              </h2>
              <p className="pg-cap fq-ranked">{labels.ranked}</p>
              {results.map((r) => renderItem(r, true))}
            </section>
          ) : (
            categories
              .filter((c) => results.some((r) => r.item.categoryId === c.id))
              .map((c) => (
                <section key={c.id} className="fq-group" aria-labelledby={`fq-cat-${c.id}`}>
                  <h2 className="fq-group-h" id={`fq-cat-${c.id}`}>
                    <span className="fq-group-n" aria-hidden="true">
                      {num(categories.indexOf(c) + 1).padStart(2, bengaliDigits ? '০' : '0')}
                    </span>
                    {c.label}
                  </h2>
                  <div className="fq-group-items">
                    {results.filter((r) => r.item.categoryId === c.id).map((r) => renderItem(r, false))}
                  </div>
                </section>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
