'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import type { CardField } from './schema';

/* ── The weights matrix behind the card ─────────────────────────────
   Every cell's brightness is a deterministic integer hash of its position
   (no Math.random, no transcendental maths), so the server and every browser
   render byte-identical markup. A sparse set of cells "belongs" to each card
   field and lights up gold while that field is being written or hovered. */
const COLS = 24;
const ROWS = 28;

const hash = (r: number, c: number) => {
  let h = Math.imul(r + 1, 374761393) ^ Math.imul(c + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % 1000;
};

interface Cell {
  level: number;
  field: number;
  shimmer: number;
}

function buildCells(fieldCount: number): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const h = hash(r, c);
      const v = h / 1000;
      // Mostly faint, a few bright: weights cluster near zero. Two light bands
      // give it the row/column structure a real weight matrix has.
      const band = c % 7 === 2 || r % 9 === 4 ? 0.2 : 0;
      const level = Math.min(7, Math.floor((v * v + band) * 8));
      cells.push({
        level,
        field: h % 9 === 0 ? (r * 3 + c * 5) % fieldCount : -1,
        shimmer: h % 7 === 1 ? h % 4 : -1,
      });
    }
  }
  return cells;
}

interface ModelCardProps {
  ariaLabel: string;
  label: string;
  name: string;
  revision: string;
  footer: string;
  fields: CardField[];
}

/**
 * The hero's model card. The complete card is in the server HTML; after
 * hydration it "compiles": a gold scan line walks down the fields while each
 * value streams in word by word behind a caret, and the matrix cells that
 * belong to the field being written light up. Afterwards the highlight idles
 * slowly from field to field (hover a field to pick it). Reduced motion, no
 * IntersectionObserver or no JS: the finished card, nothing moves.
 */
export default function ModelCard({ ariaLabel, label, name, revision, footer, fields }: ModelCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const cells = useMemo(() => buildCells(fields.length), [fields.length]);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const body = bodyRef.current;
    const scan = scanRef.current;
    const caret = caretRef.current;
    if (!stage || !card || !body || !scan || !caret) return;

    const rows = Array.from(body.querySelectorAll<HTMLElement>('.co-row'));
    const words = rows.map((row) => Array.from(row.querySelectorAll<HTMLElement>('.co-wd')));
    const cellsByField = rows.map((_, i) => Array.from(stage.querySelectorAll<HTMLElement>(`.co-w[data-f="${i}"]`)));

    let hover = -1;
    let auto = -1;
    let hot = -1;
    const setHot = () => {
      const next = hover >= 0 ? hover : auto;
      if (next === hot) return;
      if (hot >= 0) {
        rows[hot]?.classList.remove('is-hot');
        cellsByField[hot]?.forEach((c) => c.classList.remove('hot'));
      }
      hot = next;
      if (hot >= 0) {
        rows[hot]?.classList.add('is-hot');
        cellsByField[hot]?.forEach((c) => c.classList.add('hot'));
      }
    };
    const onOver = (e: PointerEvent) => {
      const row = e.target instanceof Element ? e.target.closest<HTMLElement>('.co-row') : null;
      hover = row ? rows.indexOf(row) : -1;
      setHot();
    };
    const onLeave = () => {
      hover = -1;
      setHot();
    };
    body.addEventListener('pointerover', onOver);
    body.addEventListener('pointerleave', onLeave);

    const finish = () => {
      rows.forEach((r) => r.classList.add('on'));
      words.flat().forEach((w) => w.classList.add('on'));
      caret.classList.remove('on', 'blink');
      card.dataset.state = 'done';
    };
    const removeHover = () => {
      body.removeEventListener('pointerover', onOver);
      body.removeEventListener('pointerleave', onLeave);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      finish();
      return removeHover;
    }

    /* The compile sequence as a timeline, played by one rAF loop that only
       advances while the card is on screen and the tab is visible. */
    const rel = (el: HTMLElement) => {
      const a = el.getBoundingClientRect();
      const b = body.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    };
    const placeScan = (row: HTMLElement) => {
      const p = rel(row);
      scan.style.transform = `translateY(${p.y.toFixed(1)}px)`;
      scan.style.height = `${p.h.toFixed(1)}px`;
    };
    const placeCaret = (w: HTMLElement, after: boolean) => {
      const p = rel(w);
      const x = after ? p.x + p.w + 3 : p.x - 3;
      caret.style.transform = `translate(${x.toFixed(1)}px, ${(p.y + p.h * 0.12).toFixed(1)}px)`;
      caret.style.height = `${(p.h * 0.78).toFixed(1)}px`;
    };

    const events: { at: number; run: () => void }[] = [];
    let at = 700;
    rows.forEach((row, i) => {
      events.push({
        at,
        run: () => {
          row.classList.add('on');
          placeScan(row);
          auto = i;
          setHot();
          if (words[i][0]) placeCaret(words[i][0], false);
          caret.classList.add('on');
        },
      });
      at += 230;
      words[i].forEach((w, k) => {
        events.push({
          at,
          run: () => {
            w.classList.add('on');
            placeCaret(w, true);
          },
        });
        at += 48 + ((k * 37 + i * 11) % 44);
      });
      at += 170;
    });
    events.push({
      at,
      run: () => {
        card.dataset.state = 'done';
        caret.classList.add('blink');
        auto = -1;
        setHot();
      },
    });
    events.push({ at: at + 2200, run: () => caret.classList.remove('on', 'blink') });

    let elapsed = 0;
    let next = 0;
    let idle = 0;
    const tick = (dt: number) => {
      elapsed += dt;
      while (next < events.length && events[next].at <= elapsed) events[next++].run();
      if (next < events.length) return;
      // Idle: the attention drifts to the next field every few seconds.
      idle += dt;
      if (idle > 3600) {
        idle = 0;
        auto = (auto + 1) % rows.length;
        setHot();
      }
    };

    card.dataset.state = 'live';
    let raf = 0;
    let last = 0;
    let onScreen = false;
    const loop = (t: number) => {
      tick(Math.min(64, t - (last || t)));
      last = t;
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      const live = onScreen && !document.hidden;
      if (live) stage.dataset.live = '';
      else delete stage.dataset.live;
      if (live) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(stage);
    document.addEventListener('visibilitychange', sync);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(raf);
      removeHover();
      // Never leave the card half-written if this unmounts mid-sequence.
      finish();
    };
  }, [fields]);

  return (
    <div ref={stageRef} className="co-stage">
      <div className="co-matrix" aria-hidden="true">
        {cells.map((c, i) => (
          <i
            key={i}
            className={`co-w l${c.level}${c.shimmer >= 0 ? ` sh sd${c.shimmer}` : ''}`}
            data-f={c.field >= 0 ? c.field : undefined}
          />
        ))}
      </div>
      <div ref={cardRef} className="co-card pg-enter" role="group" aria-label={ariaLabel}>
        <div className="co-card-top">
          <span className="co-card-label">{label}</span>
          <span className="co-card-rev">{revision}</span>
        </div>
        <p className="co-card-name">{name}</p>
        <div ref={bodyRef} className="co-card-body">
          <span ref={scanRef} className="co-scan" aria-hidden="true" />
          <dl className="co-dl">
            {fields.map((f) => {
              const ws = f.value.trim().split(/\s+/);
              return (
                <div className="co-row" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    {ws.map((w, k) => (
                      <Fragment key={`${w}-${k}`}>
                        <span className="co-wd">{w}</span>
                        {k < ws.length - 1 ? ' ' : null}
                      </Fragment>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>
          <span ref={caretRef} className="co-caret" aria-hidden="true" />
        </div>
        <p className="co-card-foot">{footer}</p>
      </div>
    </div>
  );
}
