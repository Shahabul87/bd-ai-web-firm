'use client';

import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import RunPlot, { Legend, Readout, type ChartCopy } from './RunPlot';
import { createRunDriver, type RunDriver } from './driver';

interface HeroRunProps {
  copy: ChartCopy;
  stages: string[];
  /** Accessible description of the whole chart. */
  label: string;
  replay: string;
  bn: boolean;
}

const DRAW_MS = 5200;

/**
 * The hero chart: an example run that draws itself on load — the agreed bar
 * first, then the quality curve with a glowing head and a ticking readout.
 * The server HTML is the finished run; CSS hides the drawn parts only while
 * scripting is on and motion is allowed, until this sets data-state (with a
 * failsafe reveal if it never does). Reduced motion keeps the finished run.
 */
export default function HeroRun({ copy, stages, label, replay, bn }: HeroRunProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const driverRef = useRef<RunDriver | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const play = useCallback((delay: number) => {
    const root = rootRef.current;
    const driver = driverRef.current;
    if (!root || !driver) return;
    clearTimers();
    driver.stop();
    root.dataset.state = 'live';
    driver.render(0);
    timers.current.push(
      window.setTimeout(() => root.classList.add('bar-on'), delay),
      window.setTimeout(() => driver.tween(1, DRAW_MS, () => (root.dataset.state = 'done')), delay + 900),
    );
  }, [clearTimers]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const driver = createRunDriver(root, stages, bn);
    driverRef.current = driver;

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => root.classList.toggle('is-vis', entry.isIntersecting));
      io.observe(root);
    } else root.classList.add('is-vis');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('bar-on');
      root.dataset.state = 'done';
      driver.render(1);
    } else {
      play(450);
    }
    return () => {
      clearTimers();
      driver.stop();
      io?.disconnect();
      driverRef.current = null;
    };
  }, [stages, bn, play, clearTimers]);

  return (
    <div className="pr-hero-card pg-panel pg-enter" style={{ '--d': 2 } as CSSProperties}>
      <div className="pr-card-head">
        <span className="pg-cap">{copy.example}</span>
        <Legend copy={copy} />
      </div>
      <div ref={rootRef} className="pr-chart pr-hero-chart" role="img" aria-label={label}>
        <Readout copy={copy} stages={stages} bn={bn} />
        <RunPlot id="pr-hero" stages={stages} barLabel={copy.bar} />
      </div>
      <div className="pr-hero-foot">
        <button type="button" className="attn-btn attn-btn-secondary attn-btn-sm pr-replay" onClick={() => play(150)}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" />
          </svg>
          {replay}
        </button>
      </div>
    </div>
  );
}
