'use client';

import { useCallback, useRef } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';
import { useFrameLoop, type Tick } from './useFrameLoop';

/**
 * The four principle rigs on the Company page. Each is a small SVG machine
 * whose SERVER markup is its finished picture (what reduced-motion, no-JS and
 * crawlers see); the live loop runs only on screen (useFrameLoop). None of
 * the positions in render use trigonometry or randomness, so the markup is
 * identical on every engine.
 */

const f1 = (n: number) => n.toFixed(1);

/* ── Measured, not guessed: an eval matrix that fills case by case ───── */
const EV_COLS = 12;
const EV_ROWS = 4;
const EV_X = 84;
const EV_W = 232;
const EV_FAILS = new Set(['1-7', '3-2']);
const EV_TOTAL = EV_COLS * EV_ROWS;
const EV_PASS = EV_TOTAL - EV_FAILS.size;
const EV_BAR = 0.9;

const fillTally = (template: string, pass: number, total: number, bengali: boolean) => {
  const n = (v: number) => (bengali ? toBengaliDigits(v) : String(v));
  return template.replace('{pass}', n(pass)).replace('{total}', n(total));
};

interface EvalRigProps {
  example: string;
  tally: string;
  bar: string;
  criteria: string[];
  bengali: boolean;
}

export function EvalRig({ example, tally, bar, criteria, bengali }: EvalRigProps) {
  const ref = useRef<SVGSVGElement>(null);
  const setup = useCallback(
    (svg: SVGSVGElement): Tick => {
      const cells = Array.from(svg.querySelectorAll<SVGRectElement>('[data-ev]'));
      // Column-major: one test case (all four criteria) after another.
      const order = [...cells].sort((a, b) => {
        const [ra, ca] = (a.dataset.ev ?? '0-0').split('-').map(Number);
        const [rb, cb] = (b.dataset.ev ?? '0-0').split('-').map(Number);
        return ca - cb || ra - rb;
      });
      const label = svg.querySelector<SVGTextElement>('[data-tally]');
      const fill = svg.querySelector<SVGRectElement>('[data-fill]');
      let phase: 'hold' | 'fill' = 'hold';
      let acc = 0;
      let idx = 0;
      let pass = 0;
      const draw = () => {
        if (label) label.textContent = fillTally(tally, pass, EV_TOTAL, bengali);
        fill?.setAttribute('width', f1((EV_W * pass) / EV_TOTAL));
      };
      return (dt) => {
        acc += dt;
        if (phase === 'hold') {
          if (acc < 2800) return;
          acc = 0;
          phase = 'fill';
          idx = 0;
          pass = 0;
          cells.forEach((c) => c.classList.remove('p', 'f'));
          draw();
          return;
        }
        while (acc >= 70 && idx < order.length) {
          acc -= 70;
          const cell = order[idx++];
          const failed = EV_FAILS.has(cell.dataset.ev ?? '');
          cell.classList.add(failed ? 'f' : 'p');
          if (!failed) pass++;
          draw();
        }
        if (idx >= order.length) {
          phase = 'hold';
          acc = 0;
        }
      };
    },
    [tally, bengali],
  );
  useFrameLoop(ref, setup);

  return (
    <svg ref={ref} className="co-rig" viewBox="0 0 320 160" aria-hidden="true">
      <text x="0" y="14">{example}</text>
      <text x="320" y="14" textAnchor="end" className="t-b" data-tally="">
        {fillTally(tally, EV_PASS, EV_TOTAL, bengali)}
      </text>
      {criteria.slice(0, EV_ROWS).map((c, r) => (
        <text key={c} x="0" y={45 + r * 24}>
          {c}
        </text>
      ))}
      {Array.from({ length: EV_ROWS }, (_, r) =>
        Array.from({ length: EV_COLS }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            data-ev={`${r}-${c}`}
            className={`co-ev ${EV_FAILS.has(`${r}-${c}`) ? 'f' : 'p'}`}
            x={EV_X + c * 19.5}
            y={32 + r * 24}
            width="15"
            height="16"
            rx="2"
          />
        )),
      )}
      <rect x={EV_X} y="134" width={EV_W} height="4" rx="2" className="co-ev-track" />
      <rect x={EV_X} y="134" width={f1((EV_W * EV_PASS) / EV_TOTAL)} height="4" rx="2" className="co-ev-fill" data-fill="" />
      <rect x={f1(EV_X + EV_W * EV_BAR - 1)} y="128" width="2" height="16" fill="var(--gold)" />
      <text x={f1(EV_X + EV_W * EV_BAR)} y="158" textAnchor="middle">
        {bar}
      </text>
    </svg>
  );
}

/* ── Your data stays yours: packets that bounce off a boundary ring ──── */
const RING = { cx: 160, cy: 84, r: 54 };
// Directions are Pythagorean-triple unit vectors: exact, no trig in render.
const PACKETS = [
  { x: -18, y: -10, dx: 0.6, dy: 0.8 },
  { x: 22, y: 6, dx: -0.8, dy: 0.6 },
  { x: 4, y: 28, dx: 0.28, dy: -0.96 },
  { x: -30, y: 18, dx: 1, dy: 0 },
  { x: 30, y: -24, dx: -0.385, dy: 0.923 },
  { x: -6, y: -34, dx: -0.6, dy: -0.8 },
  { x: 12, y: -8, dx: 0.923, dy: -0.385 },
];
const PACKET_SPEED = 30;

const setupRing = (svg: SVGSVGElement): Tick => {
  const dots = PACKETS.map((p, i) => ({
    x: p.x,
    y: p.y,
    vx: p.dx * (PACKET_SPEED + i * 3),
    vy: p.dy * (PACKET_SPEED + i * 3),
    el: svg.querySelector<SVGCircleElement>(`[data-pk="${i}"]`),
  }));
  const flashes = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-flash]')).map((el) => ({ el, life: 0 }));
  let nextFlash = 0;
  const limit = RING.r - 4;
  return (dt) => {
    const s = dt / 1000;
    for (const d of dots) {
      d.x += d.vx * s;
      d.y += d.vy * s;
      const dist = Math.hypot(d.x, d.y);
      if (dist > limit) {
        const nx = d.x / dist;
        const ny = d.y / dist;
        const dot = d.vx * nx + d.vy * ny;
        if (dot > 0) {
          d.vx -= 2 * dot * nx;
          d.vy -= 2 * dot * ny;
          const f = flashes[nextFlash];
          nextFlash = (nextFlash + 1) % flashes.length;
          if (f) {
            f.life = 1;
            f.el.setAttribute('cx', f1(RING.cx + nx * RING.r));
            f.el.setAttribute('cy', f1(RING.cy + ny * RING.r));
          }
        }
        d.x = nx * limit;
        d.y = ny * limit;
      }
      d.el?.setAttribute('cx', f1(RING.cx + d.x));
      d.el?.setAttribute('cy', f1(RING.cy + d.y));
    }
    for (const f of flashes) {
      if (f.life <= 0) continue;
      f.life = Math.max(0, f.life - dt / 650);
      f.el.setAttribute('r', f1(3 + (1 - f.life) * 9));
      f.el.setAttribute('opacity', f.life.toFixed(2));
    }
  };
};

export function RingRig({ inside, outside }: { inside: string; outside: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useFrameLoop(ref, setupRing);
  return (
    <svg ref={ref} className="co-rig" viewBox="0 0 320 160" aria-hidden="true">
      <circle cx={RING.cx} cy={RING.cy} r={RING.r + 16} fill="none" stroke="rgba(236,233,224,.14)" strokeDasharray="2 6" />
      <text x="320" y="14" textAnchor="end">
        {outside}
      </text>
      <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="rgba(127,214,181,.05)" stroke="var(--mint)" strokeWidth="1.4" />
      <text x="0" y="154" className="t-b">
        {inside}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} data-flash="" cx={RING.cx} cy={RING.cy - RING.r} r="3" fill="none" stroke="var(--mint)" strokeWidth="1.6" opacity="0" />
      ))}
      {PACKETS.map((p, i) => (
        <circle
          key={i}
          data-pk={i}
          cx={RING.cx + p.x}
          cy={RING.cy + p.y}
          r={i === 3 ? 3.6 : 2.8}
          fill={i === 3 ? 'var(--gold)' : 'var(--mint)'}
        />
      ))}
    </svg>
  );
}

/* ── Model-agnostic: a socket that swaps model plugs (CSS keyframes) ──── */
export function SocketRig({ system, models }: { system: string; models: string[] }) {
  return (
    <svg className="co-rig co-socket" viewBox="0 0 320 160" aria-hidden="true">
      <rect x="10" y="60" width="124" height="44" rx="6" fill="none" stroke="rgba(236,233,224,.3)" />
      <text x="72" y="86" textAnchor="middle" className="t-b">
        {system}
      </text>
      <circle className="co-led" cx="122" cy="70" r="3" />
      {models.slice(0, 3).map((m, i) => (
        <g key={m} className={`co-plug co-plug-${i}`}>
          <rect x="140" y="72" width="36" height="4" rx="1" fill="rgba(236,233,224,.55)" />
          <rect x="140" y="88" width="36" height="4" rx="1" fill="rgba(236,233,224,.55)" />
          <rect x="176" y="62" width="104" height="40" rx="6" className="co-plug-body" />
          <text x="228" y="86" textAnchor="middle" className="t-b">
            {m}
          </text>
          <path d="M280 82 H320" stroke="rgba(236,233,224,.25)" />
        </g>
      ))}
      <rect x="134" y="66" width="16" height="32" rx="2" className="co-sock" />
      <path d="M138 74 H150 M138 90 H150" stroke="rgba(236,233,224,.4)" strokeWidth="2" />
      <path d="M10 130 H320" stroke="rgba(236,233,224,.1)" />
      {models.slice(0, 3).map((m, i) => (
        <rect key={m} className={`co-slot co-slot-${i}`} x={10 + i * 26} y="126" width="20" height="8" rx="2" />
      ))}
    </svg>
  );
}

/* ── People in the loop: an approval gate that holds the stream ──────── */
const GATE_X = 204;
const ITEM = 10;
const GAP = 4;
const ITEM_SPEED = 34;
const ITEM_Y = 102;
// Front-most first. Item 2 is flagged and held at the gate; 3-5 queue behind.
const ITEMS = [
  { x: 266, flag: false },
  { x: 230, flag: false },
  { x: GATE_X - ITEM - 2, flag: true },
  { x: GATE_X - ITEM - 2 - (ITEM + GAP), flag: false },
  { x: GATE_X - ITEM - 2 - 2 * (ITEM + GAP), flag: false },
  { x: GATE_X - ITEM - 2 - 3 * (ITEM + GAP), flag: false },
  { x: 104, flag: true },
  { x: 62, flag: false },
  { x: 20, flag: false },
];

const setupGate = (svg: SVGSVGElement): Tick => {
  const items = ITEMS.map((it, i) => ({
    ...it,
    approved: false,
    el: svg.querySelector<SVGRectElement>(`[data-it="${i}"]`),
  }));
  let order = items.map((_, i) => i);
  const bar = svg.querySelector<SVGGElement>('[data-bar]');
  const check = svg.querySelector<SVGPathElement>('[data-check]');
  const box = svg.querySelector<SVGRectElement>('[data-box]');
  let g = 1; // 0 open, 1 closed
  let hold = 0;
  let checkP = 0;
  let checkFade = 0;
  const heldX = GATE_X - ITEM - 2;

  return (dt) => {
    const s = dt / 1000;
    const pending = items.find((it) => it.flag && !it.approved && it.x + ITEM >= GATE_X - 34 && it.x <= heldX + 0.5);
    const atGate = pending && pending.x >= heldX - 0.5 ? pending : null;
    // Close only once everything ahead of the flagged item is clear of the
    // bar, so the gate never drops through an item that is allowed to pass.
    const clear = pending ? items.every((it) => it.x <= pending.x || it.x > GATE_X + 4) : false;
    const gateTarget = pending && clear ? 1 : 0;
    g += (gateTarget - g) * Math.min(1, s * 7);

    if (atGate && g > 0.85) {
      hold += dt;
      if (hold > 700) checkP = Math.min(1, (hold - 700) / 420);
      if (hold > 1500) {
        atGate.approved = true;
        hold = 0;
        checkFade = 900;
      }
    } else if (checkFade > 0) {
      checkFade -= dt;
      if (checkFade <= 0) checkP = 0;
    }

    let prevX = Infinity;
    for (const i of order) {
      const it = items[i];
      let x = it.x + ITEM_SPEED * s;
      x = Math.min(x, prevX - ITEM - GAP);
      if (it.flag && !it.approved && it.x <= heldX + 0.5) x = Math.min(x, heldX);
      it.x = Math.max(it.x, x);
      prevX = it.x;
    }
    // The front item leaves on the right and re-joins the back of the stream.
    const front = items[order[0]];
    if (front.x > 330) {
      const back = items[order[order.length - 1]];
      front.x = Math.min(-ITEM - GAP, back.x - 36);
      front.approved = false;
      order = [...order.slice(1), order[0]];
    }

    for (const it of items) {
      it.el?.setAttribute('x', f1(it.x));
      it.el?.classList.toggle('ok', it.flag && it.approved);
    }
    bar?.setAttribute('transform', `translate(0 ${f1((1 - g) * -28)})`);
    check?.setAttribute('stroke-dashoffset', (1 - checkP).toFixed(3));
    box?.classList.toggle('on', checkP >= 1);
  };
};

export function GateRig({ person, approve }: { person: string; approve: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useFrameLoop(ref, setupGate);
  return (
    <svg ref={ref} className="co-rig co-gate" viewBox="0 0 320 160" aria-hidden="true">
      <circle cx="150" cy="18" r="6" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <path d="M139 38 C139 28 161 28 161 38" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <text x="150" y="56" textAnchor="middle">
        {person}
      </text>
      <rect data-box="" className="co-box" x={GATE_X - 8} y="14" width="16" height="16" rx="3" />
      <path
        data-check=""
        className="co-check"
        d={`M${GATE_X - 4} 22 L${GATE_X - 1} 25.5 L${GATE_X + 4.5} 18`}
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
      />
      <text x={GATE_X + 16} y="27" className="t-b">
        {approve}
      </text>
      <path d={`M${GATE_X} 34 V78`} stroke="rgba(236,233,224,.22)" strokeDasharray="2 3" />
      <path d="M0 114 H320" stroke="rgba(236,233,224,.18)" />
      <path d={`M${GATE_X - 12} 80 H${GATE_X + 12}`} stroke="rgba(236,233,224,.45)" strokeWidth="1.6" />
      <g data-bar="">
        <rect x={GATE_X - 3} y="82" width="6" height="32" rx="1.5" fill="var(--gold)" />
      </g>
      {ITEMS.map((it, i) => (
        <rect
          key={i}
          data-it={i}
          className={it.flag ? 'co-it flag' : 'co-it'}
          x={it.x}
          y={ITEM_Y}
          width={ITEM}
          height={ITEM}
          rx="2"
        />
      ))}
    </svg>
  );
}
