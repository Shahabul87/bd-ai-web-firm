/**
 * The production monitor's signal: an illustrative answer-quality score that
 * holds above the agreed bar, drifts once per cycle (detected, fixed,
 * recovered) and never crosses the bar. Pure and deterministic — the server
 * renders one frame of it, the client keeps scrolling from that same frame.
 */

export const CYCLE = 11000;
/** How much history the chart shows, in the same milliseconds. */
export const WINDOW = 0.86 * CYCLE;
export const BAR = 0.8;
export const VB_W = 600;
export const VB_H = 240;
/** The server frame: the whole drift → fix → recovery story is in view. */
export const STATIC_NOW = 0.93 * CYCLE;

const LO = 0.7;
const HI = 1;
const PAD_T = 18;
const PAD_B = 14;

export const EVENTS = [
  { key: 'drift', at: 0.4 },
  { key: 'fix', at: 0.5 },
  { key: 'recovered', at: 0.68 },
] as const;

export type EventKey = (typeof EVENTS)[number]['key'];
export type StatusKey = 'holding' | 'drift' | 'fix' | 'recovered';

/** Two instances of each event can be in view at once (the window spans most of a cycle). */
export const MARKER_SLOTS = EVENTS.flatMap((e) => [`${e.key}-0`, `${e.key}-1`]);

export interface MonitorMarker {
  slot: string;
  key: EventKey;
  /** Horizontal position, percent of the plot width. */
  x: number;
}

export interface MonitorFrame {
  line: string;
  area: string;
  /** Head position as a percent of the plot height. */
  headY: number;
  score: number;
  markers: MonitorMarker[];
  status: StatusKey;
}

const smooth = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

const phase = (s: number) => (((s % CYCLE) + CYCLE) % CYCLE) / CYCLE;

export function quality(s: number): number {
  const phi = phase(s);
  const x = s / 1000;
  let dip = 0;
  if (phi >= 0.3 && phi < 0.5) dip = smooth((phi - 0.3) / 0.2);
  else if (phi >= 0.5 && phi < 0.68) dip = 1 - smooth((phi - 0.5) / 0.18);
  const noise = 0.009 * Math.sin(x * 1.7) + 0.006 * Math.sin(x * 4.3 + 1.1) + 0.003 * Math.sin(x * 9.7 + 2.3);
  return 0.905 + noise - 0.07 * dip;
}

export const yOf = (q: number) => PAD_T + (1 - (q - LO) / (HI - LO)) * (VB_H - PAD_T - PAD_B);

export function statusAt(s: number): StatusKey {
  const phi = phase(s);
  if (phi >= 0.4 && phi < 0.5) return 'drift';
  if (phi >= 0.5 && phi < 0.68) return 'fix';
  if (phi >= 0.68 || phi < 0.08) return 'recovered';
  return 'holding';
}

export function frameAt(now: number, samples = 96): MonitorFrame {
  const t0 = now - WINDOW;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const s = t0 + (i / samples) * WINDOW;
    pts.push(`${((i / samples) * VB_W).toFixed(1)} ${yOf(quality(s)).toFixed(1)}`);
  }
  const line = `M${pts.join(' L')}`;
  const area = `${line} L${VB_W} ${VB_H} L0 ${VB_H} Z`;

  const markers: MonitorMarker[] = [];
  const k0 = Math.floor(now / CYCLE);
  for (const k of [k0 - 1, k0]) {
    for (const e of EVENTS) {
      const s = (k + e.at) * CYCLE;
      if (s >= t0 && s <= now) markers.push({ slot: `${e.key}-${k & 1}`, key: e.key, x: ((s - t0) / WINDOW) * 100 });
    }
  }

  const score = quality(now);
  return { line, area, headY: (yOf(score) / VB_H) * 100, score, markers, status: statusAt(now) };
}

export const BAR_Y = (yOf(BAR) / VB_H) * 100;
