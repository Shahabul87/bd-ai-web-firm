'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

const TYPE_MS = 30; // per character
const HOLD_MS = 2800;
const ERASE_MS = 11; // per character
const GAP_MS = 420;

type Phase = 'type' | 'hold' | 'erase' | 'gap';

/**
 * Types example requests into a ghost layer over the empty message box, one
 * after another in a fixed order. requestAnimationFrame only; it stops while
 * the box is focused or has text, while it is off screen and while the tab is
 * hidden, and never starts under reduced motion (the native placeholder then
 * shows the first example). Returns whether the ghost is running and which
 * example is current, so the native placeholder can carry the same text for
 * assistive tech.
 */
export function useExampleTyper(
  examples: readonly string[],
  ghostRef: RefObject<HTMLSpanElement | null>,
  areaRef: RefObject<HTMLElement | null>,
  paused: boolean,
  /** False while the box is not mounted; the loop restarts on remount. */
  enabled = true,
): { running: boolean; index: number } {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    wakeRef.current();
  }, [paused]);

  useEffect(() => {
    const ghost = ghostRef.current;
    const area = areaRef.current;
    if (!enabled || !ghost || !area || examples.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setRunning(true);
    setIndex(0);
    let raf = 0;
    let visible = true;
    let idx = 0;
    let phase: Phase = 'type';
    let t0 = performance.now();
    let shown = -1;

    const write = (n: number) => {
      if (n === shown) return;
      shown = n;
      ghost.textContent = examples[idx].slice(0, n);
    };
    const canRun = () => visible && !document.hidden && !pausedRef.current;

    const tick = (now: number) => {
      raf = 0;
      if (!canRun()) return;
      const text = examples[idx];
      const elapsed = now - t0;
      if (phase === 'type') {
        const n = Math.min(text.length, Math.floor(elapsed / TYPE_MS));
        write(n);
        if (n >= text.length) {
          phase = 'hold';
          t0 = now;
        }
      } else if (phase === 'hold') {
        if (elapsed >= HOLD_MS) {
          phase = 'erase';
          t0 = now;
        }
      } else if (phase === 'erase') {
        const n = Math.max(0, text.length - Math.floor(elapsed / ERASE_MS));
        write(n);
        if (n === 0) {
          phase = 'gap';
          t0 = now;
        }
      } else if (elapsed >= GAP_MS) {
        idx = (idx + 1) % examples.length;
        setIndex(idx);
        phase = 'type';
        t0 = now;
        shown = -1;
      }
      raf = requestAnimationFrame(tick);
    };

    // (Re)start the loop. After a pause the current example is typed again
    // from its first character, so the ghost never jumps mid-sentence.
    const wake = () => {
      if (raf || !canRun()) return;
      if (phase !== 'type' || shown !== 0) {
        phase = 'type';
        shown = -1;
        write(0);
      }
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        wake();
      });
      io.observe(area);
    }
    document.addEventListener('visibilitychange', wake);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      document.removeEventListener('visibilitychange', wake);
      wakeRef.current = () => {};
    };
  }, [examples, ghostRef, areaRef, enabled]);

  return { running, index };
}
