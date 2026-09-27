'use client';

import { Fragment, useEffect, useRef } from 'react';

interface GeneratedTitleProps {
  id: string;
  text: string;
}

/** Per-word pause before each word appears; the last word gets a longer beat. */
const pace = (i: number, count: number) => (i === count - 1 ? 560 : 150 + ((i * 53) % 150));

/**
 * The CTA heading, typed in word by word with a caret when it scrolls into
 * view — a quieter echo of the hero. The full heading is in the server HTML;
 * CSS hides the words only while scripting is on, with a failsafe reveal.
 */
export default function GeneratedTitle({ id, text }: GeneratedTitleProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const stage = stageRef.current;
    const heading = headingRef.current;
    const caret = caretRef.current;
    if (!stage || !heading || !caret) return;
    const tokens = Array.from(heading.querySelectorAll<HTMLElement>('.ctok'));
    const showAll = () => tokens.forEach((t) => t.classList.add('on'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      stage.dataset.state = 'done';
      showAll();
      return;
    }

    stage.dataset.state = 'live';
    let disposed = false;
    let started = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(() => !disposed && resolve(), ms));
      });

    const play = async () => {
      const fs = parseFloat(getComputedStyle(heading).fontSize);
      caret.classList.add('on');
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        caret.style.left = `${tok.offsetLeft - fs * 0.06}px`;
        caret.style.top = `${tok.offsetTop + fs * 0.2}px`;
        caret.style.height = `${fs * 0.68}px`;
        await sleep(pace(i, tokens.length));
        tok.classList.add('on');
        await sleep(70);
      }
      const last = tokens[tokens.length - 1];
      caret.style.left = `${last.offsetLeft + last.offsetWidth + fs * 0.05}px`;
      caret.classList.add('blink');
      await sleep(2600);
      caret.classList.remove('on', 'blink');
      stage.dataset.state = 'done';
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        void play();
      },
      { threshold: 0.2 },
    );
    io.observe(stage);

    return () => {
      disposed = true;
      io.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      // Never leave the heading half-typed if this unmounts mid-sequence.
      showAll();
    };
  }, [text]);

  return (
    <div ref={stageRef} className="attn-cta-stage">
      <h2 ref={headingRef} className="attn-cta-h" id={id}>
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="ctok">{word}</span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </h2>
      <span ref={caretRef} className="attn-caret" aria-hidden="true" />
    </div>
  );
}
