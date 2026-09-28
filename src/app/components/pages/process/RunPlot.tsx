/* The training-run chart, drawn in its finished state (the whole run, every
 * checkpoint reached). That is what crawlers, no-JS and reduced-motion
 * visitors see; the islands (HeroRun, StageRun) then drive it with
 * createRunDriver. No hooks here, so it renders on either side. */

import type { CSSProperties } from 'react';
import {
  BAR,
  EDGES,
  IMPROVEMENTS,
  MAIN,
  MINI,
  SPARK,
  STAGE_KEYS,
  formatDelta,
  formatScore,
  linePath,
  pct,
  pointAt,
  px,
  py,
  valueAt,
} from './run';

export interface ChartCopy {
  /** "Example run · illustrative numbers" */
  example: string;
  quality: string;
  bar: string;
  cost: string;
  stage: string;
  vsBar: string;
}

const f = MAIN;
const CURVE = linePath(f);
const COST = linePath(f, EDGES[2], 1, 'c');
const END = pointAt(f, 1);
const BAR_Y = py(f, BAR);
const PLOT_BOTTOM = f.h - f.pb;
const r1 = (n: number) => Math.round(n * 10) / 10;

export function Legend({ copy }: { copy: ChartCopy }) {
  return (
    <ul className="pr-legend" aria-hidden="true">
      <li>
        <i className="pr-key pr-key-q" />
        {copy.quality}
      </li>
      <li>
        <i className="pr-key pr-key-bar" />
        {copy.bar}
      </li>
      <li>
        <i className="pr-key pr-key-cost" />
        {copy.cost}
      </li>
    </ul>
  );
}

export function Readout({ copy, stages, bn }: { copy: ChartCopy; stages: string[]; bn: boolean }) {
  return (
    <dl className="pr-readout" aria-hidden="true">
      <div>
        <dt>{copy.stage}</dt>
        <dd data-r="stage">{stages[stages.length - 1]}</dd>
      </div>
      <div>
        <dt>{copy.quality}</dt>
        <dd data-r="q">{formatScore(END.q, bn)}</dd>
      </div>
      <div>
        <dt>{copy.vsBar}</dt>
        <dd data-r="d" className="is-above">
          {formatDelta(END.q - BAR, bn)}
        </dd>
      </div>
    </dl>
  );
}

interface RunPlotProps {
  /** Unique per instance (clip-path id). */
  id: string;
  stages: string[];
  barLabel: string;
}

export default function RunPlot({ id, stages, barLabel }: RunPlotProps) {
  const clipId = `${id}-clip`;
  return (
    <div className="pr-plot" data-progress="1">
      <svg viewBox={`0 0 ${f.w} ${f.h}`} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId}>
            <rect className="pr-reveal" x="0" y="0" width={f.w} height={f.h} />
          </clipPath>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop className="pr-fade-a" offset="0" />
            <stop className="pr-fade-b" offset="1" />
          </linearGradient>
        </defs>
        {STAGE_KEYS.map((key, k) => (
          <rect
            key={key}
            className="pr-band"
            x={r1(px(f, EDGES[k]))}
            y={f.pt}
            width={r1(px(f, EDGES[k + 1]) - px(f, EDGES[k]))}
            height={PLOT_BOTTOM - f.pt}
          />
        ))}
        <g className="pr-grid">
          {[0.3, 0.5, 0.9].map((q) => (
            <line key={q} x1={f.pl} x2={f.w - f.pr} y1={r1(py(f, q))} y2={r1(py(f, q))} />
          ))}
          {EDGES.slice(1, -1).map((x) => (
            <line key={x} className="pr-edge" x1={r1(px(f, x))} x2={r1(px(f, x))} y1={f.pt} y2={PLOT_BOTTOM} />
          ))}
          <line className="pr-baseline" x1={f.pl} x2={f.w - f.pr} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} />
        </g>
        <g className="pr-drawn" clipPath={`url(#${clipId})`}>
          <path className="pr-area" d={`${CURVE}L${r1(END.x)} ${PLOT_BOTTOM}L${f.pl} ${PLOT_BOTTOM}Z`} fill={`url(#${id}-fade)`} />
          <path className="pr-cost" d={COST} />
          <path className="pr-curve-glow" d={CURVE} />
          <path className="pr-curve" d={CURVE} />
        </g>
        <g className="pr-bar">
          <line x1={f.pl} x2={f.w - f.pr} y1={r1(BAR_Y)} y2={r1(BAR_Y)} />
        </g>
        <g className="pr-marks">
          {STAGE_KEYS.map((key, k) => {
            const m = pointAt(f, EDGES[k + 1]);
            return (
              <g key={key} className="pr-mark is-reached" transform={`translate(${r1(m.x)} ${r1(m.y)})`}>
                <circle className="pr-mark-ring" r="11" />
                <circle className="pr-mark-dot" r="5" />
              </g>
            );
          })}
        </g>
        <g className="pr-head" transform={`translate(${r1(END.x)} ${r1(END.y)})`}>
          <circle className="pr-head-halo" r="14" />
          <circle className="pr-head-ring" r="7" />
          <circle className="pr-head-dot" r="4.5" />
        </g>
      </svg>
      <span
        className="pr-bar-label"
        aria-hidden="true"
        style={{ top: pct((BAR_Y / f.h) * 100), left: pct(((f.pl + 6) / f.w) * 100) }}
      >
        {barLabel}
      </span>
      <div className="pr-axis" aria-hidden="true" style={{ height: pct((f.pb / f.h) * 100) }}>
        {stages.map((name, k) => (
          <span
            key={STAGE_KEYS[k]}
            className="pr-axis-l is-reached"
            style={{ left: pct((px(f, (EDGES[k] + EDGES[k + 1]) / 2) / f.w) * 100) }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The narrow-screen strip under one stage: the whole run faint, this stage's stretch drawn. */
export function MiniRun({ k }: { k: number }) {
  const m = MINI;
  const end = pointAt(m, EDGES[k + 1]);
  return (
    <svg className="pr-mini" viewBox={`0 0 ${m.w} ${m.h}`} aria-hidden="true" focusable="false">
      <rect
        className="pr-mini-band"
        x={r1(px(m, EDGES[k]))}
        y="0"
        width={r1(px(m, EDGES[k + 1]) - px(m, EDGES[k]))}
        height={m.h}
      />
      <line className="pr-mini-bar" x1={m.pl} x2={m.w - m.pr} y1={r1(py(m, BAR))} y2={r1(py(m, BAR))} />
      <path className="pr-mini-all" d={linePath(m)} />
      <path className="pr-mini-seg" d={linePath(m, EDGES[k], EDGES[k + 1])} pathLength={1} />
      <circle className="pr-mini-dot" cx={r1(end.x)} cy={r1(end.y)} r="5" />
    </svg>
  );
}

/** Production quality over the Run & improve stretch, with each shipped improvement pinned. */
export function Sparkline() {
  const s = SPARK;
  return (
    <svg className="pr-spark" viewBox={`0 0 ${s.w} ${s.h}`} aria-hidden="true" focusable="false">
      <line className="pr-spark-bar" x1={s.pl} x2={s.w - s.pr} y1={r1(py(s, BAR))} y2={r1(py(s, BAR))} />
      <path className="pr-spark-line" d={linePath(s)} pathLength={1} />
      {IMPROVEMENTS.map((x, i) => (
        <circle
          key={x}
          className="pr-spark-pip"
          style={{ '--i': i } as CSSProperties}
          cx={r1(px(s, x))}
          cy={r1(py(s, valueAt(x + 0.01).q))}
          r="4"
        />
      ))}
    </svg>
  );
}
