'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';
import { splitWords } from './retrieval';

export interface DemoQuery {
  chip: string;
  text: string;
  terms: string[];
}

export interface DemoItem {
  key: string;
  href: string;
  title: string;
  typeLabel: string;
}

/** One query's result, computed on the server from the real content. */
export interface DemoRanking {
  /** Item keys, best first. */
  order: string[];
  /** Score in [0, 1] and its localised label, per item key. */
  scores: Record<string, { value: number; label: string }>;
  /** Indexes into splitWords(title) of the words that matched, per item key. */
  hits: Record<string, number[]>;
}

export interface DemoLabels {
  label: string;
  example: string;
  chipsLabel: string;
  queryLabel: string;
  termsLabel: string;
  resultsLabel: string;
  ranking: string;
  pause: string;
  play: string;
  note: string;
  topMatch: string;
}

interface RetrievalDemoProps {
  queries: DemoQuery[];
  items: DemoItem[];
  rankings: DemoRanking[];
  labels: DemoLabels;
  /** lang of the item titles when it differs from the page (English content on /bn). */
  contentLang?: string;
}

type Phase = 'typing' | 'reading' | 'ranking' | 'ranked';

const TYPE_MS = 34;
const READ_MS = 420;
const RANK_MS = 1150;
const HOLD_MS = 4600;

/** Split into user-perceived characters so Bengali conjuncts never tear mid-type. */
function graphemes(text: string): string[] {
  const Seg = (Intl as unknown as {
    Segmenter?: new (l?: string, o?: { granularity: 'grapheme' }) => { segment(s: string): Iterable<{ segment: string }> };
  }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  return Array.from(text);
}

/**
 * The /resources hero: a question is typed into a search line, its key terms
 * are pulled out, and every article, guide and case study in the library is
 * re-ranked by word overlap with them — the rows slide into their new order
 * and the relevance bars grow to the real scores (computed on the server).
 * Cycles through the example questions while on screen and the tab is
 * visible; a chip pins a question. The server HTML is the finished ranking of
 * the first question, so no-JS and reduced-motion visitors get a complete,
 * working list of links.
 */
export default function RetrievalDemo({ queries, items, rankings, labels, contentLang }: RetrievalDemoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState<number | null>(null); // null = whole query
  const [phase, setPhase] = useState<Phase>('ranked');
  // Which query's ranking the list shows; seq changes on every re-rank (FLIP trigger).
  const [view, setView] = useState({ q: 0, seq: 0 });
  const [auto, setAuto] = useState(true);
  const [motion, setMotion] = useState<'pending' | 'full' | 'reduced'>('pending');
  const [announce, setAnnounce] = useState('');

  const byKey = useRef(new Map(items.map((it) => [it.key, it])));
  const firstTops = useRef<Map<string, number> | null>(null);
  const raf = useRef(0);
  const step = useRef({ q: 0, phase: 'ranked' as Phase, t: 0, chars: 0, cycle: false });
  const visible = useRef(false);
  const tickRef = useRef<(dt: number) => boolean>(() => false);
  /** Set once the visitor picks a question; the cycle only restarts via Play. */
  const pinned = useRef(false);

  const showRanking = (q: number) => setView((v) => ({ q, seq: v.seq + 1 }));

  /** FLIP, part one: remember where every row is before the order changes. */
  const captureFirst = () => {
    const list = listRef.current;
    if (!list) return;
    const map = new Map<string, number>();
    for (const li of Array.from(list.children) as HTMLElement[]) {
      if (li.dataset.key) map.set(li.dataset.key, li.getBoundingClientRect().top);
    }
    firstTops.current = map;
  };

  /** FLIP, part two: after the new order renders, slide each row from where it was. */
  useLayoutEffect(() => {
    const list = listRef.current;
    const first = firstTops.current;
    firstTops.current = null;
    if (!list || !first) return;
    const rows = Array.from(list.children) as HTMLElement[];
    for (const li of rows) {
      const from = first.get(li.dataset.key ?? '');
      if (from === undefined) continue;
      const dy = from - li.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) continue;
      li.style.transition = 'none';
      li.style.transform = `translateY(${dy}px)`;
    }
    void list.offsetHeight; // commit the inverted positions before releasing them
    for (const li of rows) {
      li.style.transition = '';
      li.style.transform = '';
    }
  }, [view]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const start = useCallback(() => {
    if (raf.current || !visible.current || document.hidden) return;
    let last = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (tickRef.current(dt)) raf.current = requestAnimationFrame(loop);
      else raf.current = 0;
    };
    raf.current = requestAnimationFrame(loop);
  }, []);

  /** Begin typing query q; `cycle` keeps going to the next one afterwards. */
  const play = useCallback(
    (q: number, cycle: boolean) => {
      stop();
      step.current = { q, phase: 'typing', t: 0, chars: graphemes(queries[q].text).length, cycle };
      setActive(q);
      setTyped(0);
      setPhase('typing');
      start();
    },
    [queries, start, stop],
  );

  // The state machine, advanced by the frame loop (re-bound every render so it
  // always sees current props). Returns false to stop.
  useEffect(() => {
    tickRef.current = (dt) => {
      const s = step.current;
      s.t += dt;
      if (s.phase === 'typing') {
        const n = Math.min(s.chars, Math.floor(s.t / TYPE_MS));
        setTyped(n);
        if (n >= s.chars) {
          s.phase = 'reading';
          s.t = 0;
          setTyped(null);
          setPhase('reading');
        }
      } else if (s.phase === 'reading' && s.t >= READ_MS) {
        s.phase = 'ranking';
        s.t = 0;
        captureFirst();
        showRanking(s.q);
        setPhase('ranking');
      } else if (s.phase === 'ranking' && s.t >= RANK_MS) {
        s.phase = 'ranked';
        s.t = 0;
        setPhase('ranked');
        if (!s.cycle) return false;
      } else if (s.phase === 'ranked' && s.t >= HOLD_MS) {
        if (!s.cycle) return false;
        const q = (s.q + 1) % queries.length;
        step.current = { q, phase: 'typing', t: 0, chars: graphemes(queries[q].text).length, cycle: true };
        setActive(q);
        setTyped(0);
        setPhase('typing');
      }
      return true;
    };
  });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMotion(reduced ? 'reduced' : 'full');
    if (reduced) setAuto(false);
  }, []);

  useEffect(() => {
    if (motion !== 'full') return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          stop();
          return;
        }
        if (!started) {
          started = true;
          // First sight: start the cycle from the top, unless a chip was already used.
          if (!pinned.current) {
            play(0, true);
            return;
          }
        }
        if (step.current.cycle || step.current.phase !== 'ranked') start();
      },
      { threshold: 0.3 },
    );
    const onVis = () => {
      if (document.hidden) stop();
      else if (visible.current && (step.current.cycle || step.current.phase !== 'ranked')) start();
    };
    io.observe(node);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      stop();
    };
  }, [motion, play, start, stop]);

  /** Jump to the finished ranking of a query (reduced motion, pause). */
  const settle = (q: number) => {
    stop();
    step.current = { q, phase: 'ranked', t: 0, chars: 0, cycle: false };
    setActive(q);
    setTyped(null);
    if (motion === 'full') captureFirst();
    showRanking(q);
    setPhase('ranked');
  };

  const choose = (q: number) => {
    pinned.current = true;
    setAuto(false);
    const top = byKey.current.get(rankings[q].order[0]);
    setAnnounce(top ? `${labels.topMatch}: ${top.title}` : '');
    if (motion === 'full') play(q, false);
    else settle(q);
  };

  const toggleAuto = () => {
    if (auto) {
      setAuto(false);
      settle(step.current.q);
    } else {
      pinned.current = false;
      setAuto(true);
      play((step.current.q + 1) % queries.length, true);
    }
  };

  const query = queries[active];
  const chars = typed === null ? null : graphemes(query.text);
  const shown = chars ? chars.slice(0, typed ?? 0).join('') : query.text;
  const showScores = phase === 'ranking' || phase === 'ranked';
  const result = rankings[view.q];
  const termsOn = phase !== 'typing';

  return (
    <div
      ref={rootRef}
      className="rs-rt pg-panel"
      data-phase={phase}
      data-live={motion === 'pending' ? undefined : 'true'}
    >
      <div className="rs-rt-head">
        <span className="rs-rt-title">
          <b>{labels.label}</b>
          <span className="pg-cap">{labels.example}</span>
        </span>
        {motion === 'full' ? (
          <button type="button" className="rs-rt-toggle" aria-pressed={!auto} onClick={toggleAuto}>
            <span aria-hidden="true" className={auto ? 'rs-ico-pause' : 'rs-ico-play'} />
            {auto ? labels.pause : labels.play}
          </button>
        ) : null}
      </div>

      <div className="rs-chips rs-rt-chips" role="group" aria-label={labels.chipsLabel}>
        {queries.map((q, i) => (
          <button key={q.chip} type="button" className="rs-chip" aria-pressed={i === active} onClick={() => choose(i)}>
            {q.chip}
          </button>
        ))}
      </div>

      <div className="rs-rt-query">
        <span className="pg-cap rs-rt-ql">{labels.queryLabel}</span>
        <p className="rs-rt-q">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="rs-rt-mag">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M12.6 12.6 17 17" />
          </svg>
          <span aria-hidden="true">
            {shown}
            {phase === 'typing' ? <span className="rs-caret" /> : null}
          </span>
          <span className="sr-only">{query.text}</span>
        </p>
        <p className="rs-rt-terms" data-on={termsOn ? 'true' : undefined}>
          <span className="pg-cap">{labels.termsLabel}</span>
          {query.terms.map((term, i) => (
            <span key={term} className="rs-term" lang="en" style={{ '--i': i } as CSSProperties}>
              {term}
            </span>
          ))}
        </p>
      </div>

      <p className="pg-cap rs-rt-rl">
        <span>{labels.resultsLabel}</span>
        <span className={`rs-rt-state${phase === 'reading' || phase === 'ranking' ? ' on' : ''}`} aria-hidden="true">
          {labels.ranking}
        </span>
      </p>
      <ol ref={listRef} className="rs-rt-list">
        {result.order.map((key, rank) => {
          const it = byKey.current.get(key);
          if (!it) return null;
          const sc = result.scores[key] ?? { value: 0, label: '0' };
          const hits = new Set(result.hits[key] ?? []);
          const value = showScores ? sc.value : 0;
          const cls = [showScores && rank === 0 && sc.value > 0 ? 'is-top' : '', showScores && sc.value === 0 ? 'is-zero' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <li key={key} data-key={key} className={cls || undefined}>
              <Link href={it.href} className="rs-rt-row">
                <span className="rs-rt-type pg-cap">{it.typeLabel}</span>
                <span className="rs-rt-t" lang={contentLang}>
                  {splitWords(it.title).map((w, wi) =>
                    showScores && hits.has(wi) ? (
                      <mark key={wi}>{w}</mark>
                    ) : (
                      <span key={wi}>{w}</span>
                    ),
                  )}
                </span>
                <span className="rs-bar" aria-hidden="true">
                  <i style={{ '--s': value } as CSSProperties} />
                </span>
                <span className="rs-rt-s pg-num" aria-hidden="true">
                  {showScores ? sc.label : '–'}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="rs-rt-note">{labels.note}</p>

      <span className="sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
