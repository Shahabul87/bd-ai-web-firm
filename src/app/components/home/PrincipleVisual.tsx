'use client';

import { useEffect, useRef } from 'react';

/**
 * The four principle micro-visuals. Each runs a small requestAnimationFrame
 * loop ONLY while it is on screen, and not at all under reduced motion, where
 * the first frame is the final picture. Randomness is confined to the effect,
 * so the server HTML is deterministic (no hydration mismatch).
 */

type Tick = (dtMs: number) => void;

const f2 = (n: number) => n.toFixed(2);

function useLiveLoop(ref: React.RefObject<SVGSVGElement | null>, setup: (svg: SVGSVGElement) => Tick) {
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const tick = setup(svg);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (t: number) => {
      const dt = Math.min(64, t - (last || t));
      last = t;
      tick(dt);
      if (visible) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
      }
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, setup]);
}

/* ── Measured, not guessed: an eval score ticking inside a narrow band ── */
const SCORE_SEED = Array.from({ length: 24 }, (_, i) => 0.885 + Math.sin(i * 0.9) * 0.015);
const sparkPath = (vals: number[]) =>
  vals.map((v, i) => `${i ? 'L' : 'M'}${f2(84 + i * (100 / 23))} ${f2(80 - ((v - 0.84) / 0.1) * 60)}`).join('');

const setupScore = (svg: SVGSVGElement): Tick => {
  const num = svg.querySelector<SVGTextElement>('[data-score]');
  const spark = svg.querySelector<SVGPathElement>('[data-spark]');
  const vals = [...SCORE_SEED];
  let acc = 0;
  return (dt) => {
    acc += dt;
    if (acc < 700 || !num || !spark) return;
    acc = 0;
    const lastV = vals[vals.length - 1];
    vals.push(Math.max(0.86, Math.min(0.91, lastV + (Math.random() - 0.45) * 0.02)));
    vals.shift();
    spark.setAttribute('d', sparkPath(vals));
    num.textContent = vals[vals.length - 1].toFixed(2);
  };
};

export function ScoreVisual({ label }: { label: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLiveLoop(ref, setupScore);
  return (
    <svg ref={ref} className="mv" viewBox="0 0 184 92" aria-hidden="true">
      <text x="0" y="34" className="big" data-score="">
        {SCORE_SEED[SCORE_SEED.length - 1].toFixed(2)}
      </text>
      <text x="0" y="54">{label}</text>
      <path data-spark="" d={sparkPath(SCORE_SEED)} fill="none" stroke="var(--mint)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M84 84 H184" stroke="rgba(236,233,224,.14)" />
    </svg>
  );
}

/* ── Your data stays yours: particles that never leave the boundary ── */
const DOTS = Array.from({ length: 7 }, (_, i) => ({
  x: 20 + i * 22,
  y: 30 + ((i * 17) % 44),
  vx: (i % 2 ? 1 : -1) * (14 + i * 3),
  vy: (i % 3 ? 1 : -1) * (10 + i * 2),
  accent: i === 3,
}));

const setupBound = (svg: SVGSVGElement): Tick => {
  const dots = DOTS.map((d, i) => ({ ...d, el: svg.querySelector<SVGCircleElement>(`[data-dot="${i}"]`) }));
  return (dt) => {
    const s = dt / 1000;
    for (const d of dots) {
      d.x += d.vx * s;
      d.y += d.vy * s;
      if (d.x < 8 || d.x > 176) {
        d.vx *= -1;
        d.x = Math.max(8, Math.min(176, d.x));
      }
      if (d.y < 20 || d.y > 80) {
        d.vy *= -1;
        d.y = Math.max(20, Math.min(80, d.y));
      }
      d.el?.setAttribute('cx', f2(d.x));
      d.el?.setAttribute('cy', f2(d.y));
    }
  };
};

export function BoundaryVisual({ label }: { label: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLiveLoop(ref, setupBound);
  return (
    <svg ref={ref} className="mv" viewBox="0 0 184 92" aria-hidden="true">
      <rect x="2" y="14" width="180" height="72" rx="6" fill="none" stroke="var(--mint)" strokeDasharray="4 4" strokeWidth="1.2" />
      <text x="2" y="9">{label}</text>
      {DOTS.map((d, i) => (
        <circle key={i} data-dot={i} cx={d.x} cy={d.y} r={d.accent ? 3.4 : 2.6} fill={d.accent ? 'var(--gold)' : 'var(--mint)'} />
      ))}
    </svg>
  );
}

/* ── Model-agnostic: the connector moves between interchangeable models ── */
const SLOT_Y = [16, 46, 76];
const linkPath = (y: number) => `M64 46 C100 46 96 ${y} 124 ${y}`;

const setupModels = (svg: SVGSVGElement): Tick => {
  const link = svg.querySelector<SVGPathElement>('[data-link]');
  const slots = Array.from(svg.querySelectorAll<SVGRectElement>('[data-slot]'));
  let current = 0;
  let acc = 0;
  return (dt) => {
    acc += dt;
    if (acc < 2400) return;
    acc = 0;
    current = (current + 1) % SLOT_Y.length;
    link?.setAttribute('d', linkPath(SLOT_Y[current]));
    slots.forEach((r, k) => r.setAttribute('stroke', k === current ? 'var(--gold)' : 'rgba(236,233,224,.25)'));
  };
};

export function ModelsVisual({ system, models }: { system: string; models: string[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useLiveLoop(ref, setupModels);
  return (
    <svg ref={ref} className="mv" viewBox="0 0 184 92" aria-hidden="true">
      <rect x="0" y="32" width="64" height="28" rx="4" fill="none" stroke="rgba(236,233,224,.3)" />
      <text x="32" y="50" textAnchor="middle">{system}</text>
      <path data-link="" className="mv-link" d={linkPath(SLOT_Y[0])} fill="none" stroke="var(--gold)" strokeWidth="1.8" />
      {SLOT_Y.map((y, i) => (
        <g key={y}>
          <rect data-slot={i} x="124" y={y - 11} width="60" height="22" rx="4" fill="none" stroke={i === 0 ? 'var(--gold)' : 'rgba(236,233,224,.25)'} />
          <text x="154" y={y + 4} textAnchor="middle">{models[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── People in the loop: most items flow through; flagged ones visit a person ── */
const ITEMS = Array.from({ length: 8 }, (_, i) => ({ x: 4 + i * 23, flag: i % 4 === 1 }));
const itemY = (x: number, flag: boolean) => (flag && x > 60 && x < 124 ? 66 - Math.sin((Math.PI * (x - 60)) / 64) * 40 : 66);

const setupLoop = (svg: SVGSVGElement): Tick => {
  const items = ITEMS.map((it, i) => ({ ...it, el: svg.querySelector<SVGRectElement>(`[data-item="${i}"]`) }));
  return (dt) => {
    for (const it of items) {
      const nearPerson = it.flag && Math.abs(it.x - 92) < 6;
      it.x += ((nearPerson ? 6 : 22) * dt) / 1000;
      if (it.x > 184) it.x -= 184;
      it.el?.setAttribute('x', f2(it.x - 3));
      it.el?.setAttribute('y', f2(itemY(it.x, it.flag) - 3));
    }
  };
};

export function LoopVisual({ label }: { label: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLiveLoop(ref, setupLoop);
  return (
    <svg ref={ref} className="mv" viewBox="0 0 184 92" aria-hidden="true">
      <path d="M4 66 H180" stroke="rgba(236,233,224,.18)" />
      <circle cx="92" cy="14" r="5" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <path d="M83 30 C83 22 101 22 101 30" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <text x="112" y="24">{label}</text>
      {ITEMS.map((it, i) => (
        <rect key={i} data-item={i} width="6" height="6" rx="1.5" x={it.x - 3} y={itemY(it.x, it.flag) - 3} fill={it.flag ? 'var(--gold)' : 'var(--mint)'} />
      ))}
    </svg>
  );
}

