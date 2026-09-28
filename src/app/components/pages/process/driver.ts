/* Drives a server-rendered RunPlot imperatively: the curve reveal, the head
 * dot, the checkpoint markers, the stage band and the readout. A tween sets
 * these every animation frame, so it writes attributes and text directly
 * instead of going through React state. Client-only: call it from effects. */

import {
  BAR,
  EDGES,
  MAIN,
  STAGE_KEYS,
  formatDelta,
  formatScore,
  pointAt,
  px,
  stageAt,
} from './run';

export interface RunDriver {
  /** Reveal the curve up to `clip`, put the head at `head`, highlight stage `focus`. */
  render: (clip: number, head?: number, focus?: number) => void;
  /** Animate clip and head together to `to`. */
  tween: (to: number, ms: number, done?: () => void) => void;
  stop: () => void;
  readonly progress: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function createRunDriver(root: HTMLElement, stageNames: string[], bn: boolean): RunDriver {
  const f = MAIN;
  const clips = Array.from(root.querySelectorAll<SVGRectElement>('.pr-reveal'));
  const head = root.querySelector<SVGGElement>('.pr-head');
  const marks = Array.from(root.querySelectorAll<SVGGElement>('.pr-mark'));
  const bands = Array.from(root.querySelectorAll<SVGRectElement>('.pr-band'));
  const labels = Array.from(root.querySelectorAll<HTMLElement>('.pr-axis-l'));
  const out = {
    stage: root.querySelector<HTMLElement>('[data-r="stage"]'),
    q: root.querySelector<HTMLElement>('[data-r="q"]'),
    d: root.querySelector<HTMLElement>('[data-r="d"]'),
  };
  const plot = root.querySelector<HTMLElement>('.pr-plot') ?? root;
  let clipP = 1;
  let raf = 0;

  const text = (node: HTMLElement | null, value: string) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  const render = (clip: number, headP = clip, focus = stageAt(headP)) => {
    clipP = clip;
    const w = clip <= 0 ? '0' : (px(f, clip) + 1).toFixed(1);
    clips.forEach((r) => r.setAttribute('width', w));
    const pt = pointAt(f, headP);
    head?.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    marks.forEach((m, k) => {
      const reached = headP >= EDGES[k + 1] - 1e-4;
      m.classList.toggle('is-reached', reached);
      m.classList.toggle('is-focus', reached && k === focus);
    });
    bands.forEach((b, k) => b.classList.toggle('is-focus', k === focus));
    labels.forEach((l, k) => {
      l.classList.toggle('is-reached', headP > EDGES[k] || k === 0);
      l.classList.toggle('is-focus', k === focus);
    });
    text(out.stage, stageNames[Math.min(focus, STAGE_KEYS.length - 1)] ?? '');
    text(out.q, formatScore(pt.q, bn));
    text(out.d, formatDelta(pt.q - BAR, bn));
    out.d?.classList.toggle('is-above', Math.round((pt.q - BAR) * 100) >= 0);
    plot.dataset.progress = String(Math.round(clip * 1000) / 1000);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const tween = (to: number, ms: number, done?: () => void) => {
    stop();
    const from = clipP;
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / ms);
      const p = from + (to - from) * easeInOut(t);
      render(p);
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        raf = 0;
        done?.();
      }
    };
    raf = requestAnimationFrame(step);
  };

  return {
    render,
    tween,
    stop,
    get progress() {
      return clipP;
    },
  };
}
