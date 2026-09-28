'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

export interface OodAddressLabels {
  label: string;
  placeholder: string;
  rejected: string;
  candidates: string;
  note: string;
}

interface Token {
  text: string;
  word: boolean;
  /** Index among word tokens, -1 for separators. */
  w: number;
}

const MAX_CHARS = 56;
const STEP_MS = 1500;
const REST_MS = 2200;

function tokenize(path: string): Token[] {
  let w = 0;
  return path
    .split(/([/\-_.?=&#])/)
    .filter(Boolean)
    .map((text) => {
      const word = !/^[/\-_.?=&#]$/.test(text);
      return { text, word, w: word ? w++ : -1 };
    });
}

/** Two deterministic near-miss spellings of a token: an adjacent swap and a drop. */
function nearMisses(word: string): string[] {
  const c = Array.from(word);
  const n = c.length;
  if (n < 2) return [`${word}${word}`, `${word}s`];
  const swapped = [...c];
  const p = (n * 7 + 3) % (n - 1);
  [swapped[p], swapped[p + 1]] = [swapped[p + 1], swapped[p]];
  const dropped = c.filter((_, i) => i !== (n * 5 + 1) % n);
  const a = swapped.join('');
  const b = dropped.join('');
  return [a === word ? `${word}e` : a, b === word || b === a ? `${word}s` : b];
}

/** Illustrative bar width (a fraction), a fixed function of the indices. */
const barWidth = (w: number, k: number) => 0.12 + (((w * 37 + k * 23) % 17) / 100);

function readPath(): string {
  try {
    const raw = decodeURIComponent(window.location.pathname);
    return raw.length > MAX_CHARS ? `${raw.slice(0, MAX_CHARS - 1)}…` : raw;
  } catch {
    return window.location.pathname.slice(0, MAX_CHARS);
  }
}

/**
 * The 404 signature: the address the visitor asked for, read token by token
 * like a model scoring an unlikely sequence. Each word token lights in turn,
 * flickers through near-miss spellings (rose, rejected) and settles, then the
 * whole address rests as out of distribution. Server markup (and reduced
 * motion) shows the resting state: every token marked rejected, no loop.
 */
export default function OodAddress({ labels }: { labels: OodAddressLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState(labels.placeholder);
  const [live, setLive] = useState(-1);
  const [state, setState] = useState<'still' | 'live'>('still');
  const tokens = useMemo(() => tokenize(path), [path]);
  const words = tokens.filter((t) => t.word).length;

  // Mounted pattern: the real path only exists in the browser.
  useEffect(() => {
    const p = readPath();
    if (p && p !== '/') setPath(p);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || words === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    setState('live');
    const cycle = words * STEP_MS + REST_MS;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let onScreen = false;
    let shown = -2;

    const loop = (t: number) => {
      clock = (clock + Math.min(64, t - (last || t))) % cycle;
      last = t;
      const idx = clock < words * STEP_MS ? Math.floor(clock / STEP_MS) : -1;
      if (idx !== shown) {
        shown = idx;
        setLive(idx);
      }
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (onScreen && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(raf);
      setState('still');
      setLive(-1);
    };
  }, [words]);

  return (
    <div
      ref={ref}
      className="sy-ood pg-panel"
      role="group"
      aria-labelledby="sy-ood-h"
      data-state={state}
      data-rest={state === 'live' && live === -1 ? '' : undefined}
    >
      <p className="sy-ood-h pg-cap" id="sy-ood-h">
        {labels.label}
      </p>
      <p className="sy-addr">
        {tokens.map((tok, i) => {
          if (!tok.word) {
            return (
              <span key={i} className="sy-sep">
                {tok.text}
              </span>
            );
          }
          const misses = nearMisses(tok.text);
          const isLive = tok.w === live;
          const done = state === 'live' && live !== -1 && tok.w < live;
          return (
            <span
              key={i}
              className={`sy-tok${isLive ? ' is-live' : ''}${done ? ' is-done' : ''}`}
              style={{ '--w': tok.w } as CSSProperties}
            >
              <span className="sy-tok-t">
                {tok.text}
                <span className="sy-tok-f" aria-hidden="true">
                  {misses[0]}
                </span>
              </span>
              <span className="sy-cands" aria-hidden="true">
                <span className="sy-cands-h">{labels.candidates}</span>
                {misses.map((m, k) => (
                  <span key={m} className="sy-cand">
                    <s>{m}</s>
                    <i style={{ '--p': barWidth(tok.w, k) } as CSSProperties} />
                  </span>
                ))}
              </span>
            </span>
          );
        })}
        <span className="sy-caret" aria-hidden="true" />
      </p>
      <p className="sy-ood-note">
        <span className="sy-flag">{labels.rejected}</span>
        {labels.note}
      </p>
    </div>
  );
}
