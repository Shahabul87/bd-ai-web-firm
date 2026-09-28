'use client';

import { useCallback, useRef, useState } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';
import { BAR_Y, MARKER_SLOTS, STATIC_NOW, VB_H, VB_W, frameAt, type EventKey, type MonitorFrame, type StatusKey } from './monitor';
import { useLoop } from './useLoop';

export interface MonitorCopy {
  label: string;
  example: string;
  summary: string;
  metric: string;
  bar: string;
  axisStart: string;
  axisEnd: string;
  events: Record<EventKey, string>;
  status: Record<StatusKey, string>;
  pause: string;
  play: string;
}

/** Past this x (percent), a marker's label sits to the left of its line. */
const FLIP_AT = 74;

interface ProdMonitorProps {
  copy: MonitorCopy;
  /** The server-computed frame, so hydration never depends on the client's Math.sin. */
  initial: MonitorFrame;
  bn: boolean;
}

/**
 * Run & improve — a live production monitor. An example quality score scrolls
 * past, holding above the gold "bar we agreed"; once a cycle it starts to
 * drift, the drift is flagged, a fix ships and the line recovers before it
 * ever reaches the bar. The server frame already shows that whole story, and
 * the loop simply keeps scrolling from it (so no-JS and reduced motion get
 * the same, complete picture). Paths and markers are written straight to the
 * DOM each frame; React only re-renders when the status line changes.
 */
export default function ProdMonitor({ copy, initial, bn }: ProdMonitorProps) {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const markerRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [status, setStatus] = useState<StatusKey>(initial.status);

  const fmt = useCallback((q: number) => (bn ? toBengaliDigits(q.toFixed(2)) : q.toFixed(2)), [bn]);

  const tick = useCallback(
    (elapsed: number) => {
      const f = frameAt(STATIC_NOW + elapsed);
      lineRef.current?.setAttribute('d', f.line);
      areaRef.current?.setAttribute('d', f.area);
      if (headRef.current) headRef.current.style.top = `${f.headY}%`;
      if (scoreRef.current) scoreRef.current.textContent = fmt(f.score);
      const seen = new Set<string>();
      for (const m of f.markers) {
        const el = markerRefs.current[m.slot];
        if (!el) continue;
        seen.add(m.slot);
        el.style.left = `${m.x}%`;
        el.dataset.flip = m.x > FLIP_AT ? 'true' : 'false';
        el.hidden = false;
      }
      for (const slot of MARKER_SLOTS) {
        const el = markerRefs.current[slot];
        if (el && !seen.has(slot)) el.hidden = true;
      }
      setStatus(f.status);
    },
    [fmt],
  );

  const { mode, playing, toggle } = useLoop(rootRef, tick);
  const initialBySlot = new Map(initial.markers.map((m) => [m.slot, m]));

  return (
    <figure ref={rootRef} className="sd-fig sd-mon pg-panel" data-status={status} data-live={mode === 'pending' ? undefined : mode}>
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

      <div className="sd-mon-body" aria-hidden="true">
        <div className="sd-mon-read">
          <span className="pg-cap">{copy.metric}</span>
          <span ref={scoreRef} className="sd-mon-score pg-num">
            {fmt(initial.score)}
          </span>
        </div>

        <div className="sd-mon-plot">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="sd-mon-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7FD6B5" stopOpacity="0.22" />
                <stop offset="1" stopColor="#7FD6B5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} className="sd-mon-grid" x1="0" x2={VB_W} y1={VB_H * g} y2={VB_H * g} />
            ))}
            <path ref={areaRef} className="sd-mon-area" d={initial.area} />
            <line className="sd-mon-bar" x1="0" x2={VB_W} y1={(BAR_Y / 100) * VB_H} y2={(BAR_Y / 100) * VB_H} />
            <path ref={lineRef} className="sd-mon-line" d={initial.line} />
          </svg>

          <span className="sd-mon-barlabel" style={{ top: `${BAR_Y}%` }}>
            {copy.bar}
          </span>

          {MARKER_SLOTS.map((slot) => {
            const m = initialBySlot.get(slot);
            const key = slot.slice(0, slot.lastIndexOf('-')) as EventKey;
            return (
              <span
                key={slot}
                ref={(el) => {
                  markerRefs.current[slot] = el;
                }}
                className={`sd-mon-mark sd-mark-${key}`}
                style={{ left: `${m ? m.x : 0}%` }}
                data-flip={m && m.x > FLIP_AT ? 'true' : 'false'}
                hidden={!m}
              >
                <b>{copy.events[key]}</b>
              </span>
            );
          })}

          <span ref={headRef} className="sd-mon-head" style={{ top: `${initial.headY}%` }} />
        </div>

        <div className="sd-mon-axis pg-cap">
          <span>{copy.axisStart}</span>
          <span>{copy.axisEnd}</span>
        </div>
      </div>

      <p className="sd-mon-status">
        <i aria-hidden="true" />
        <span key={status}>{copy.status[status]}</span>
      </p>
    </figure>
  );
}
