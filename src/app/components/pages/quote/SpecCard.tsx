'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface SpecLine {
  key: string;
  label: string;
  /** Resolved display value; null renders as YAML's `~` (not set yet). */
  value: string | null;
}

export type SpecState = 'draft' | 'compiling' | 'sent';

interface SpecCardProps {
  heading: string;
  file: string;
  state: SpecState;
  stateLabel: string;
  lines: SpecLine[];
  countLabel: string;
  note: string;
  toggleLabel: string;
  open: boolean;
  onToggle: () => void;
  /** Localised, zero-padded line number. */
  lineNo: (i: number) => string;
  /** True once the island has hydrated: new lines type in from empty. */
  live: boolean;
}

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Characters per millisecond while a value types in. */
const MS_PER_CHAR = 20;

/**
 * One value, typed in after its common prefix with the previous value, with a
 * gold caret while it types. It starts fully written on the server render
 * and first paint (and always under reduced motion); after hydration a line
 * that appears (`animateIn`) or changes types itself in.
 */
function TypedValue({ text, animateIn }: { text: string; animateIn: boolean }) {
  const [shown, setShown] = useState(() => (animateIn && !reduced() ? 0 : text.length));
  const [typing, setTyping] = useState(false);
  const prev = useRef(animateIn ? '' : text);

  useEffect(() => {
    const before = prev.current;
    if (before === text) return;
    prev.current = text;
    let from = 0;
    while (from < before.length && from < text.length && before[from] === text[from]) from += 1;
    if (from >= text.length || reduced()) {
      setShown(text.length);
      setTyping(false);
      return;
    }
    let raf = 0;
    let start = 0;
    setShown(from);
    setTyping(true);
    const tick = (now: number) => {
      if (!start) start = now;
      const n = Math.min(text.length, from + Math.floor((now - start) / MS_PER_CHAR) + 1);
      setShown(n);
      if (n < text.length) raf = requestAnimationFrame(tick);
      else setTyping(false);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setShown(text.length);
      setTyping(false);
    };
  }, [text]);

  return (
    <>
      <span className="qt-v" data-typing={typing ? '' : undefined} aria-hidden="true">
        {text.slice(0, shown)}
      </span>
      <span className="qt-sr">{text}</span>
    </>
  );
}

/**
 * The live spec: every answer lands as a line of a small YAML file, typed in
 * with a caret. On submit a gold scan "compiles" it; once sent, it turns mint.
 * Below 1000px it collapses behind a summary toggle.
 */
export default function SpecCard({
  heading,
  file,
  state,
  stateLabel,
  lines,
  countLabel,
  note,
  toggleLabel,
  open,
  onToggle,
  lineNo,
  live,
}: SpecCardProps) {
  return (
    <aside className="qt-side" aria-labelledby="qt-spec-h">
      <h2 id="qt-spec-h" className="qt-sr">
        {heading}
      </h2>
      <button
        type="button"
        className="qt-spec-toggle"
        aria-expanded={open}
        aria-controls="qt-spec"
        onClick={onToggle}
      >
        <span className="qt-spec-toggle-t">{toggleLabel}</span>
        <span className="qt-spec-toggle-n pg-num">{countLabel}</span>
        <span className="qt-chev" aria-hidden="true" />
      </button>
      <div id="qt-spec" className="qt-spec" data-state={state} data-open={open ? '' : undefined}>
        <div className="qt-spec-bar">
          <span className="qt-spec-file">{file}</span>
          <span className="qt-spec-state">
            {stateLabel}
          </span>
        </div>
        <ol className="qt-yaml">
          {lines.map((line, i) => (
            <li
              key={line.key}
              data-set={line.value !== null ? '' : undefined}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="qt-ln pg-num" aria-hidden="true">
                {lineNo(i)}
              </span>
              <span className="qt-k">{line.label}:</span>{' '}
              {line.value !== null ? <TypedValue text={line.value} animateIn={live} /> : <span className="qt-nil">~</span>}
            </li>
          ))}
        </ol>
        <div className="qt-spec-foot">
          <span className="pg-num">{countLabel}</span>
          <span>{note}</span>
        </div>
      </div>
    </aside>
  );
}
