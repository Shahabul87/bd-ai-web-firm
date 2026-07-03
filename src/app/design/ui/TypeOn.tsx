'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface TypeOnProps {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  /** ms before typing starts once in view */
  startDelay?: number;
  cursor?: boolean;
}

/** Types text character-by-character once in view; block cursor blinks at rest. */
export default function TypeOn({
  text,
  className = '',
  speed = 40,
  startDelay = 0,
  cursor = true,
}: TypeOnProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  const done = reduced ? true : count >= text.length;
  const shown = reduced ? text : text.slice(0, count);

  useEffect(() => {
    if (!inView || reduced || count >= text.length) return;
    const delay = count === 0 ? startDelay + speed : speed;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [inView, reduced, count, text.length, speed, startDelay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{shown}</span>
      {cursor ? (
        <span aria-hidden className={done ? 'cursor-blink' : 'text-signal'}>
          ▮
        </span>
      ) : null}
    </span>
  );
}
