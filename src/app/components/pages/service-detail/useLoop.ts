'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** pending: before hydration settles; live: animating; reduced: static final picture. */
export type LoopMode = 'pending' | 'live' | 'reduced';

/**
 * Drives a looping hero figure on requestAnimationFrame. `onTick` receives the
 * milliseconds of *playing* time since the loop started; time only advances
 * while the element is on screen, the tab is visible and the visitor has not
 * paused it. Under reduced motion it never starts, so the server markup (the
 * finished state) is what stays on screen.
 */
export function useLoop<T extends Element>(ref: RefObject<T | null>, onTick: (elapsed: number) => void) {
  const [mode, setMode] = useState<LoopMode>('pending');
  const [playing, setPlaying] = useState(true);
  const tickRef = useRef(onTick);
  const playingRef = useRef(true);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = onTick;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('reduced');
      return;
    }
    setMode('live');

    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let onScreen = typeof IntersectionObserver === 'undefined';

    const loop = (now: number) => {
      elapsed += last ? Math.min(64, now - last) : 0;
      last = now;
      tickRef.current(elapsed);
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (onScreen && !document.hidden && playingRef.current) raf = requestAnimationFrame(loop);
    };
    syncRef.current = sync;

    // Show the first frame at once, so the finished server picture never
    // lingers after the loop has taken over.
    tickRef.current(0);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { threshold: 0.2 },
      );
      io.observe(el);
    } else sync();
    document.addEventListener('visibilitychange', sync);

    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(raf);
      syncRef.current = () => {};
    };
  }, [ref]);

  const toggle = useCallback(() => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
    syncRef.current();
  }, []);

  return { mode, playing, toggle };
}
