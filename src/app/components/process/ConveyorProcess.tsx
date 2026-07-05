'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Card from '../../design/ui/Card';
import SpecTable from '../../design/ui/SpecTable';

export interface ConveyorPhase {
  /** Two-digit station index, e.g. "01" — the real order work happens in. */
  number: string;
  title: string;
  /** Short uppercase track label, e.g. "DISCOVERY". */
  label: string;
  what: string;
  deliverables: string;
  yourRole: string;
  timeline: string;
}

interface ConveyorProcessProps {
  phases: ConveyorPhase[];
  /** Static right-hand readout, e.g. "05 stations · typical total 2–6 weeks". */
  totalNote: string;
}

/** ms between automatic station advances while the track is on screen. */
const ADVANCE_MS = 5000;

/** Track position (% from the left) for station `i` of `n`. */
function stationPos(i: number, n: number): number {
  if (n <= 1) return 50;
  return 4 + (92 * i) / (n - 1);
}

/**
 * The Conveyor: a build artifact travels a horizontal foundry line through
 * the five stations; the arriving station lights up and its phase card swaps
 * in below. Auto-advances while visible; stations are clickable/keyboardable.
 * Spec: docs/superpowers/specs/2026-07-05-process-page-conveyor-design.md
 */
export default function ConveyorProcess({ phases, totalNote }: ConveyorProcessProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inViewRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (!inViewRef.current || document.hidden) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % phases.length);
    }, ADVANCE_MS);
  }, [phases.length, stopTimer]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
        if (inViewRef.current) startTimer();
        else stopTimer();
      },
      { threshold: 0.25 },
    );
    io.observe(track);
    const onVisibility = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopTimer();
    };
  }, [startTimer, stopTimer]);

  const go = useCallback(
    (i: number) => {
      const n = phases.length;
      setActive(((i % n) + n) % n);
      startTimer(); // a manual jump restarts the cadence from that station
    },
    [phases.length, startTimer],
  );

  const onTrackKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  const phase = phases[active];
  const pos = stationPos(active, phases.length);
  // Both written out literally so Tailwind's static extractor generates them.
  const transitLeft = 'transition-[left] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]';
  const transitWidth = 'transition-[width] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]';

  return (
    <div>
      {/* Readout row */}
      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-[0.16em]">
        <p className="text-steel">
          Station{' '}
          <span className="text-signal">
            {phase.number}/{String(phases.length).padStart(2, '0')} — {phase.label}
          </span>
        </p>
        <p className="text-steel">{totalNote}</p>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        role="group"
        aria-label="Project phases"
        onKeyDown={onTrackKeyDown}
        className="relative mt-7 h-36"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-[74px] h-0.5"
          style={{
            background:
              'repeating-linear-gradient(90deg, var(--line) 0 10px, transparent 10px 20px)',
          }}
        />
        <div
          aria-hidden
          className={`absolute left-0 top-[74px] h-0.5 bg-signal-dim shadow-[0_0_12px_rgba(216,255,62,0.35)] ${transitWidth}`}
          style={{ width: `${pos}%` }}
        />

        {phases.map((p, i) => {
          const state = i === active ? 'active' : i < active ? 'done' : 'todo';
          return (
            <button
              key={p.number}
              type="button"
              aria-label={`Station ${p.number}: ${p.title}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => go(i)}
              className="group absolute top-0 flex w-28 -translate-x-1/2 cursor-pointer flex-col items-center outline-none"
              style={{ left: `${stationPos(i, phases.length)}%` }}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                  state === 'active' ? 'text-signal' : 'text-steel'
                }`}
              >
                {p.number}
              </span>
              <span
                aria-hidden
                className={`relative mt-10 block h-4 w-4 rotate-45 border-2 transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-signal group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ink-950 ${
                  state === 'active'
                    ? 'scale-125 border-signal bg-signal shadow-[0_0_22px_rgba(216,255,62,0.55)]'
                    : state === 'done'
                      ? 'border-signal-dim bg-signal-dim'
                      : 'border-line bg-ink-900'
                }`}
              >
                {state === 'active' ? (
                  <span className="absolute -inset-0.5 border-2 border-signal motion-safe:animate-[station-ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
                ) : null}
              </span>
              <span
                className={`mt-5 hidden font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 sm:block ${
                  state === 'active' ? 'text-bone' : 'text-steel'
                }`}
              >
                {p.label}
              </span>
            </button>
          );
        })}

        {/* The build artifact */}
        <div
          aria-hidden
          className={`pointer-events-none absolute top-[60px] z-10 -ml-[15px] h-[30px] w-[30px] ${transitLeft}`}
          style={{ left: `${pos}%` }}
        >
          <span className="absolute -top-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.18em] text-signal">
            YOUR BUILD
          </span>
          <span className="block h-full w-full rotate-45 bg-signal shadow-[0_0_30px_rgba(216,255,62,0.65),0_0_70px_rgba(216,255,62,0.25)] motion-safe:animate-[cube-hum_2.2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Phase card — keyed so each station change replays the entrance */}
      <div className="mt-10 min-h-[340px]">
        <div key={phase.number} className="motion-safe:animate-[phase-in_0.3s_ease]">
          <Card className="sm:p-10">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
              Station {phase.number}
            </span>
            <h3 className="mt-4 font-display text-2xl font-medium text-bone">{phase.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">{phase.what}</p>
            <div className="mt-6">
              <SpecTable
                rows={[
                  { label: 'Deliverables', value: phase.deliverables },
                  { label: 'Your role', value: phase.yourRole },
                  { label: 'Timeline', value: phase.timeline },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
