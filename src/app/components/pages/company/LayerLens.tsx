'use client';

import { useEffect, useRef, useState } from 'react';
import type { LayerKind, LayerRow } from './schema';

interface LayerLensProps {
  example: string;
  humanLabel: string;
  machineLabel: string;
  toggleLabel: string;
  kinds: Record<LayerKind, string>;
  rows: LayerRow[];
}

/**
 * "Two layers": the human description of a task, with the machine's trace of
 * the same task underneath it, row for row. Both layers are the same grid —
 * every row holds both texts, one of them `visibility: hidden` — so their row
 * heights always match and the layers align perfectly in any language.
 *
 * A lens follows the pointer and clips the machine layer into view inside it
 * (clip-path circle driven by custom properties, set once per frame in rAF;
 * the CSS transition does the easing). The toggle button is the keyboard and
 * touch equivalent: it sweeps the machine layer across the whole panel.
 * Both layers are real text: assistive tech reads each as its own list.
 */
export default function LayerLens({ example, humanLabel, machineLabel, toggleLabel, kinds, rows }: LayerLensProps) {
  const [full, setFull] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<HTMLOListElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const fullRef = useRef(full);

  useEffect(() => {
    fullRef.current = full;
    const machine = machineRef.current;
    if (!machine) return;
    if (full) {
      machine.style.setProperty('--co-cx', '0%');
      machine.style.setProperty('--co-cy', '50%');
    }
  }, [full]);

  useEffect(() => {
    const stage = stageRef.current;
    const machine = machineRef.current;
    const ring = ringRef.current;
    if (!stage || !machine || !ring) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      if (fullRef.current) return;
      machine.style.setProperty('--co-cx', `${x.toFixed(1)}px`);
      machine.style.setProperty('--co-cy', `${y.toFixed(1)}px`);
      ring.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (stage.dataset.lens !== 'on') {
        // Jump (don't glide) to where the pointer entered.
        stage.dataset.lens = 'jump';
        apply();
        // Two frames: the jump must be styled before the glide is re-enabled.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (stage.dataset.lens === 'jump') stage.dataset.lens = 'on';
          }),
        );
        return;
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = (e: PointerEvent) => {
      // A tap leaves the lens where it landed; a scroll (pointercancel) or a
      // mouse leaving the panel puts it away.
      if (e.type === 'pointerleave' && e.pointerType === 'touch') return;
      stage.dataset.lens = 'off';
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onMove);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointercancel', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('pointercancel', onLeave);
    };
  }, []);

  const layer = (which: 'human' | 'machine') => (
    <ol
      ref={which === 'machine' ? machineRef : undefined}
      className={`co-xr-layer co-xr-${which}`}
      aria-label={which === 'human' ? humanLabel : machineLabel}
    >
      {rows.map((row, i) => (
        <li key={i} className="co-xr-row">
          <p className="co-xr-h" aria-hidden={which === 'machine' ? true : undefined}>
            {row.human}
          </p>
          <p className="co-xr-m" aria-hidden={which === 'human' ? true : undefined}>
            <span className={`co-k co-k-${row.kind}`}>{kinds[row.kind]}</span>
            <code>{row.machine}</code>
            <span className="co-xr-meta">{row.meta}</span>
          </p>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="co-xr pg-panel" data-full={full ? 'true' : 'false'}>
      <div className="co-xr-bar">
        <span className="co-xr-tag">{example}</span>
        <span className="co-xr-legend" aria-hidden="true">
          <span className="co-xr-key h">{humanLabel}</span>
          <span className="co-xr-key m">{machineLabel}</span>
        </span>
        <button
          type="button"
          className="attn-btn attn-btn-secondary attn-btn-sm co-xr-toggle"
          aria-pressed={full}
          onClick={() => setFull((v) => !v)}
        >
          <span className="co-xr-switch" aria-hidden="true" />
          {toggleLabel}
        </button>
      </div>
      <div ref={stageRef} className="co-xr-stage" data-lens="off">
        {layer('human')}
        {layer('machine')}
        <span ref={ringRef} className="co-xr-ring" aria-hidden="true" />
      </div>
    </div>
  );
}
