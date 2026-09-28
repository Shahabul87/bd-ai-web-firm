'use client';

import { Fragment, useEffect, useRef } from 'react';

interface ReplyStreamProps {
  /** The reply, one string per paragraph, already resolved for the locale. */
  paragraphs: readonly string[];
  /** Called once every word is on screen (immediately under reduced motion). */
  onDone?: () => void;
}

/** Per-word pause: deterministic in the index, longer at a paragraph break. */
const pace = (i: number, paragraphStart: boolean) => (paragraphStart ? 420 : 34 + ((i * 29) % 47));

/**
 * The reply, generated word by word with a gold caret, like the home hero.
 * Purely visual: it is aria-hidden, and the composer puts the full text in a
 * polite live region, so a screen reader hears the whole reply at once.
 */
export default function ReplyStream({ paragraphs, onDone }: ReplyStreamProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>('.ct-w'));
    const finish = () => {
      words.forEach((w) => w.classList.add('on'));
      words.forEach((w) => w.classList.remove('cur'));
      root.dataset.state = 'done';
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || words.length === 0) {
      finish();
      doneRef.current?.();
      return;
    }

    root.dataset.state = 'live';
    // Cumulative appearance time of each word, from its deterministic pace.
    const at: number[] = [];
    let t = 260;
    words.forEach((w, i) => {
      t += pace(i, i > 0 && w.dataset.p === '1');
      at.push(t);
    });
    const end = t + 1600; // let the caret blink on the last word for a beat

    let raf = 0;
    let shown = 0;
    let start = 0;
    let doneCalled = false;
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      while (shown < words.length && at[shown] <= elapsed) {
        words[shown - 1]?.classList.remove('cur');
        words[shown].classList.add('on', 'cur');
        shown += 1;
      }
      if (shown === words.length && !doneCalled) {
        doneCalled = true;
        doneRef.current?.();
      }
      if (elapsed >= end) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      // Never leave the reply half-written if this unmounts mid-sequence.
      finish();
    };
  }, [paragraphs]);

  return (
    <div ref={rootRef} className="ct-stream" aria-hidden="true">
      {paragraphs.map((paragraph, pi) => {
        const words = paragraph.trim().split(/\s+/);
        return (
          <p key={pi}>
            {words.map((word, wi) => (
              <Fragment key={wi}>
                <span className="ct-w" data-p={wi === 0 ? '1' : undefined}>
                  {word}
                </span>
                {wi < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
