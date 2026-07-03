'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface TerminalLine {
  text: string;
  tone?: 'cmd' | 'out' | 'ok' | 'warn';
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  className?: string;
}

const TONE_CLS: Record<NonNullable<TerminalLine['tone']>, string> = {
  cmd: 'text-bone',
  out: 'text-steel',
  ok: 'text-signal',
  warn: 'text-amber',
};

const LINE_INTERVAL_MS = 350;

/** Scripted terminal playback: reveals lines once in view; plays once per visit. */
export default function Terminal({ lines, title = 'crafts.ai — agent', className = '' }: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  const visibleCount = shown;

  useEffect(() => {
    if (!inView || shown >= lines.length) return;
    if (reduced) {
      setShown(lines.length);
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), LINE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [inView, reduced, shown, lines.length]);

  return (
    <div ref={ref} className={`border border-line bg-ink-900 ${className}`}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-signal" />
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-steel">
          {title}
        </span>
      </div>
      <div className="min-h-32 p-4 font-mono text-xs leading-6 sm:text-sm">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className={TONE_CLS[line.tone ?? 'out']}>
            {line.tone === 'cmd' ? <span className="text-signal">&gt; </span> : null}
            {line.text}
          </div>
        ))}
        {visibleCount < lines.length ? (
          <span aria-hidden className="cursor-blink">▮</span>
        ) : null}
      </div>
    </div>
  );
}
