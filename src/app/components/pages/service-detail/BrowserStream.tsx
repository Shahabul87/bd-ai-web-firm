'use client';

import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';
import { graphemes } from './text';
import { useLoop } from './useLoop';

export interface BrowserCopy {
  label: string;
  example: string;
  summary: string;
  appName: string;
  url: string;
  nav: string[];
  placeholder: string;
  query: string;
  ask: string;
  thinking: string;
  sourcesLabel: string;
  done: string;
  pause: string;
  play: string;
}

export interface AnswerSegment {
  text: string;
  /** 1-based index into the sources. */
  cite: number;
}

export interface AnswerSource {
  title: string;
  path: string;
}

interface BrowserStreamProps {
  copy: BrowserCopy;
  answer: AnswerSegment[];
  sources: AnswerSource[];
  bn: boolean;
}

type Phase = 'idle' | 'type' | 'press' | 'think' | 'stream' | 'done' | 'out';

const IDLE_MS = 700;
const CHAR_MS = 44;
const PRESS_MS = 380;
const THINK_MS = 1000;
const WORD_MS = 86;
const SOURCE_MS = 280;
const HOLD_MS = 4200;
const OUT_MS = 520;

interface Frame {
  phase: Phase;
  /** Query graphemes typed. */
  q: number;
  /** Answer words streamed. */
  w: number;
  /** Sources revealed. */
  s: number;
}

/**
 * AI inside your web product — a browser window around a real-looking help
 * page. A question is typed into the search box, and the answer streams in
 * word by word with numbered citations; each citation lights the source it
 * points to, and the sources slide in underneath. Loops while on screen.
 * Words not yet streamed keep their space (opacity only), so the layout never
 * jumps. The server HTML is the finished answer.
 */
export default function BrowserStream({ copy, answer, sources, bn }: BrowserStreamProps) {
  const rootRef = useRef<HTMLElement>(null);
  const qChars = useMemo(() => graphemes(copy.query), [copy.query]);
  const segWords = useMemo(() => answer.map((seg) => seg.text.split(' ')), [answer]);
  const totalWords = segWords.reduce((n, ws) => n + ws.length, 0);
  const [frame, setFrame] = useState<Frame>({ phase: 'done', q: qChars.length, w: totalWords, s: sources.length });

  const timeline = useMemo(() => {
    const press = IDLE_MS + qChars.length * CHAR_MS + 260;
    const think = press + PRESS_MS;
    const stream = think + THINK_MS;
    const done = stream + totalWords * WORD_MS + 200;
    const out = done + sources.length * SOURCE_MS + HOLD_MS;
    return { press, think, stream, done, out, end: out + OUT_MS };
  }, [qChars.length, totalWords, sources.length]);

  const tick = useCallback(
    (elapsed: number) => {
      const t = elapsed % timeline.end;
      const Q = qChars.length;
      let next: Frame;
      if (t < IDLE_MS) next = { phase: 'idle', q: 0, w: 0, s: 0 };
      else if (t < timeline.press) next = { phase: 'type', q: Math.min(Q, Math.floor((t - IDLE_MS) / CHAR_MS) + 1), w: 0, s: 0 };
      else if (t < timeline.think) next = { phase: 'press', q: Q, w: 0, s: 0 };
      else if (t < timeline.stream) next = { phase: 'think', q: Q, w: 0, s: 0 };
      else if (t < timeline.done)
        next = { phase: 'stream', q: Q, w: Math.min(totalWords, Math.floor((t - timeline.stream) / WORD_MS) + 1), s: 0 };
      else if (t < timeline.out)
        next = { phase: 'done', q: Q, w: totalWords, s: Math.min(sources.length, Math.floor((t - timeline.done) / SOURCE_MS) + 1) };
      else next = { phase: 'out', q: Q, w: totalWords, s: sources.length };
      setFrame((p) => (p.phase === next.phase && p.q === next.q && p.w === next.w && p.s === next.s ? p : next));
    },
    [qChars.length, totalWords, sources.length, timeline],
  );

  const { mode, playing, toggle } = useLoop(rootRef, tick);
  const { phase, q, w, s } = frame;
  const num = (n: number) => (bn ? toBengaliDigits(n) : String(n));

  // Which source the stream is citing right now (lights it up).
  let seen = 0;
  let citing = 0;
  const cited = new Set<number>();
  const segs = segWords.map((words, i) => {
    const start = seen;
    seen += words.length;
    const complete = w >= seen;
    if (w > start) citing = answer[i].cite;
    if (complete) cited.add(answer[i].cite);
    return { words, start, complete };
  });
  const answering = phase === 'think' || phase === 'stream' || phase === 'done' || phase === 'out';

  return (
    <figure ref={rootRef} className="sd-fig sd-browser pg-panel" data-phase={phase} data-live={mode === 'pending' ? undefined : mode}>
      <figcaption className="sd-fig-head">
        <span className="sd-fig-title">
          <b>{copy.label}</b>
          <span className="pg-cap">{copy.example}</span>
        </span>
        {mode === 'live' ? (
          <button type="button" className="sd-toggle" onClick={toggle}>
            <span aria-hidden="true" className={playing ? 'sd-ico-pause' : 'sd-ico-play'} />
            {playing ? copy.pause : copy.play}
          </button>
        ) : null}
      </figcaption>
      <p className="sr-only">{copy.summary}</p>

      <div className="sd-bw" aria-hidden="true">
        <div className="sd-bw-chrome">
          <span className="sd-bw-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="sd-bw-url">
            <i className="sd-bw-lock" />
            {copy.url}
          </span>
        </div>

        <div className="sd-bw-page">
          <nav className="sd-bw-side">
            <b>{copy.appName}</b>
            {copy.nav.map((item, i) => (
              <span key={item} className={i === copy.nav.length - 1 ? 'on' : undefined}>
                {item}
              </span>
            ))}
          </nav>

          <div className="sd-bw-main">
            <div className={`sd-bw-search${phase === 'press' ? ' press' : ''}`}>
              <i className="sd-bw-glass" />
              <span className="sd-bw-q">
                {q === 0 ? <span className="sd-bw-ph">{copy.placeholder}</span> : qChars.slice(0, q).join('')}
                {phase === 'idle' || phase === 'type' ? <span className="sd-caret" /> : null}
              </span>
              <span className="sd-bw-ask">{copy.ask}</span>
            </div>

            <div className={`sd-bw-answer${answering ? ' on' : ''}`}>
              <div className="sd-bw-state">
                <i className="sd-bw-spark" />
                <span className="sd-bw-state-a">{copy.thinking}</span>
                <span className="sd-bw-state-b">{copy.done}</span>
              </div>
              <p className="sd-bw-text">
                {segs.map((seg, i) => (
                  <Fragment key={i}>
                    {seg.words.map((word, j) => (
                      <span key={j} className={seg.start + j < w ? 'sd-w on' : 'sd-w'}>
                        {word}{' '}
                      </span>
                    ))}
                    <sup className={`sd-cite${seg.complete ? ' on' : ''}`}>{num(answer[i].cite)}</sup>{' '}
                  </Fragment>
                ))}
              </p>
              <div className="sd-bw-sources">
                <span className="pg-cap">{copy.sourcesLabel}</span>
                <ol>
                  {sources.map((src, i) => (
                    <li
                      key={src.path}
                      className={`${i < s || cited.has(i + 1) || (citing === i + 1 && phase === 'stream') ? 'on' : ''}${citing === i + 1 && phase === 'stream' ? ' hot' : ''}`}
                      style={{ '--i': i } as React.CSSProperties}
                    >
                      <span className="sd-bw-n">{num(i + 1)}</span>
                      <b>{src.title}</b>
                      <span className="sd-bw-path">{src.path}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
