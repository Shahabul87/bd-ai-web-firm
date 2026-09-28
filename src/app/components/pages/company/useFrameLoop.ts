'use client';

import { useEffect, type RefObject } from 'react';

export type Tick = (dtMs: number) => void;

/**
 * Runs `setup(el)`'s tick on requestAnimationFrame ONLY while the element is
 * on screen and the tab is visible; never under reduced motion (the server
 * markup is then the final picture). `setup` should be a stable, module-level
 * function so the loop is not torn down on every render.
 */
export function useFrameLoop<T extends Element>(ref: RefObject<T | null>, setup: (el: T) => Tick) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const tick = setup(el);
    let raf = 0;
    let last = 0;
    let onScreen = false;

    const loop = (t: number) => {
      const dt = Math.min(64, t - (last || t));
      last = t;
      tick(dt);
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
    };
  }, [ref, setup]);
}
