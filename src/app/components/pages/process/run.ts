/* The "training run": one example project drawn as a quality curve.
 *
 * Everything here is a pure, deterministic function of the sample index (sums
 * of sines, no Math.random), so the server and the client draw the same line
 * and the markup hydrates cleanly. The numbers are illustrative and the page
 * labels them as an example run. */

import { toBengaliDigits } from '@/app/lib/numerals';

export const STAGE_KEYS = ['discover', 'prototype', 'evaluate', 'build', 'run'] as const;
export type StageKey = (typeof STAGE_KEYS)[number];

/** Project time (0..1) at which each stage starts; the last entry is the end.
 *  Stage k spans EDGES[k]..EDGES[k + 1] and its checkpoint sits at EDGES[k + 1]. */
export const EDGES = [0, 0.16, 0.38, 0.58, 0.8, 1] as const;

/** The quality bar agreed in Discover. */
export const BAR = 0.7;

/** Project time where an improvement ships during Run & improve. */
export const IMPROVEMENTS = [0.845, 0.905, 0.962] as const;

const N = 200;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Deterministic "noise": a sum of sines of the index. */
const wobble = (i: number) => 0.5 * Math.sin(i * 0.83) + 0.3 * Math.sin(i * 2.17 + 1.3) + 0.2 * Math.sin(i * 4.61 + 0.4);

function qualityAt(i: number): number {
  const x = i / (N - 1);
  const start = EDGES[1];
  let q = 0.26;
  let amp = 0.005;
  if (x > start) {
    const t = x - start;
    // Rises fast and noisily while prototyping, crosses the bar early in
    // Evaluate, then flattens above it.
    q = 0.26 + 0.52 * (1 - Math.exp(-t / 0.15)) + 0.05 * t;
    amp = 0.006 + 0.058 * Math.exp(-t / 0.12);
  }
  // Run & improve: each shipped improvement is a small step up; monitoring
  // catches one dip (drift) between the first two.
  for (const at of IMPROVEMENTS) q += 0.017 * smooth(at - 0.012, at + 0.008, x);
  q -= 0.016 * Math.exp(-(((x - 0.878) / 0.014) ** 2));
  return q + amp * wobble(i);
}

function costAt(i: number): number {
  const x = i / (N - 1);
  const t = x - EDGES[2];
  return 0.24 + 0.24 * Math.exp(-t / 0.2) + 0.006 * wobble(i + 57);
}

export interface Sample {
  x: number;
  q: number;
  c: number;
}

export const SAMPLES: readonly Sample[] = Array.from({ length: N }, (_, i) => ({
  x: i / (N - 1),
  q: qualityAt(i),
  c: costAt(i),
}));

/** A drawing frame: viewBox size, plot padding, and the visible x / quality range. */
export interface Frame {
  w: number;
  h: number;
  pl: number;
  pr: number;
  pt: number;
  pb: number;
  q0: number;
  q1: number;
  x0: number;
  x1: number;
}

/** The big chart (hero and the sticky chart). The bottom padding holds the stage labels. */
export const MAIN: Frame = { w: 600, h: 380, pl: 14, pr: 16, pt: 18, pb: 46, q0: 0.15, q1: 0.96, x0: 0, x1: 1 };
/** The per-stage strip shown inline on narrow screens. */
export const MINI: Frame = { w: 600, h: 150, pl: 8, pr: 10, pt: 12, pb: 12, q0: 0.15, q1: 0.96, x0: 0, x1: 1 };
/** The production sparkline inside the Run & improve artifact. */
export const SPARK: Frame = { w: 300, h: 56, pl: 4, pr: 8, pt: 6, pb: 6, q0: 0.62, q1: 0.94, x0: EDGES[4], x1: 1 };

export const px = (f: Frame, x: number) => f.pl + ((x - f.x0) / (f.x1 - f.x0)) * (f.w - f.pl - f.pr);
export const py = (f: Frame, q: number) => f.pt + (1 - (q - f.q0) / (f.q1 - f.q0)) * (f.h - f.pt - f.pb);

const r1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Quality and cost at project time p, interpolated between samples. */
export function valueAt(p: number): { q: number; c: number } {
  const t = clamp(p, 0, 1) * (N - 1);
  const i = Math.min(N - 2, Math.floor(t));
  const f = t - i;
  const a = SAMPLES[i];
  const b = SAMPLES[i + 1];
  return { q: a.q + (b.q - a.q) * f, c: a.c + (b.c - a.c) * f };
}

export function pointAt(f: Frame, p: number): { x: number; y: number; q: number } {
  const { q } = valueAt(p);
  return { x: px(f, p), y: py(f, q), q };
}

/** An SVG path through the curve between project times `from` and `to`. */
export function linePath(f: Frame, from = f.x0, to = f.x1, series: 'q' | 'c' = 'q'): string {
  const pts: string[] = [];
  const at = (p: number) => {
    const v = valueAt(p);
    return `${r1(px(f, p))} ${r1(py(f, series === 'q' ? v.q : v.c))}`;
  };
  pts.push(at(from));
  for (const s of SAMPLES) if (s.x > from && s.x < to) pts.push(at(s.x));
  pts.push(at(to));
  return `M${pts.join('L')}`;
}

/** Which stage a point in project time belongs to (a checkpoint belongs to the stage it closes). */
export function stageAt(p: number): number {
  for (let k = 0; k < STAGE_KEYS.length; k++) if (p <= EDGES[k + 1] + 1e-6) return k;
  return STAGE_KEYS.length - 1;
}

/** Evaluate's report: the score at its checkpoint and how many of 40 cases fail. */
export const EVAL_CASES = 40;
export const EVAL_SCORE = Math.round(valueAt(EDGES[3]).q * 100) / 100;
export const EVAL_FAILS = Math.round((1 - EVAL_SCORE) * EVAL_CASES);
/** Spreads the failing cases through the grid: i*7 mod 40 is a permutation. */
export const caseFails = (i: number) => (i * 7 + 3) % EVAL_CASES < EVAL_FAILS;

export const pct = (n: number) => `${(Math.round(n * 100) / 100).toString()}%`;

export function formatScore(v: number, bn: boolean): string {
  const s = (Math.round(v * 100) / 100).toFixed(2);
  return bn ? toBengaliDigits(s) : s;
}

export function formatDelta(v: number, bn: boolean): string {
  const r = Math.round(v * 100) / 100;
  const s = `${r >= 0 ? '+' : '−'}${Math.abs(r).toFixed(2)}`;
  return bn ? toBengaliDigits(s) : s;
}
