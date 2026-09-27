'use client';

import { useCallback, useEffect, useRef } from 'react';
import { StepArtifact, type ArtifactCopy, type StepKey } from './ProcessArtifacts';

interface Step {
  key: StepKey;
  number: string;
  title: string;
  body: string;
}

interface ProcessStepsProps {
  title: string;
  note: string;
  exampleLabel: string;
  steps: Step[];
  artifacts: ArtifactCopy;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const f2 = (n: number) => n.toFixed(2);
/** Attention from the active step back to earlier ones, nearest first. */
const BACK_WEIGHTS = [0.52, 0.24, 0.14, 0.1];

/** Matches the CSS: the section pins only at >=900px and with motion allowed. */
const pinned = () => window.innerWidth >= 900 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Desktop: the section is pinned and scroll progress picks the active step.
 * Narrow screens and reduced motion: the step nearest the viewport middle is
 * active. The active step's artifact plays; arcs link it to earlier steps.
 *
 * Like the hero, this toggles classes imperatively on server-rendered nodes:
 * a scroll handler setting React state would re-render on every frame.
 */
export default function ProcessSteps({ title, note, exampleLabel, steps, artifacts }: ProcessStepsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const arcsRef = useRef<SVGSVGElement>(null);
  const activeRef = useRef(-1);

  const draw = useCallback(() => {
    const wrap = wrapRef.current;
    const svgEl = arcsRef.current;
    if (!wrap || !svgEl) return;
    svgEl.replaceChildren();
    const items = Array.from(wrap.querySelectorAll<HTMLElement>('.attn-step'));
    const wr = wrap.getBoundingClientRect();
    const horizontal = window.innerWidth >= 900;
    const pts = items.map((li) => {
      const h = li.querySelector<HTMLElement>('.attn-step-btn')?.getBoundingClientRect() ?? li.getBoundingClientRect();
      const lr = li.getBoundingClientRect();
      return horizontal
        ? { x: h.left - wr.left + Math.min(h.width / 2, 60), y: lr.top - wr.top - 16 }
        : { x: lr.left - wr.left - 26, y: h.top - wr.top + h.height / 2 };
    });
    const path = (a: { x: number; y: number }, b: { x: number; y: number }, lift: number) => {
      if (horizontal) {
        const h = Math.min(104, lift + Math.abs(b.x - a.x) * 0.22);
        return `M${f2(a.x)} ${f2(a.y)}Q${f2((a.x + b.x) / 2)} ${f2(a.y - 2 * h)} ${f2(b.x)} ${f2(b.y)}`;
      }
      const bulge = Math.min(a.x - 4, lift * 0.6 + Math.abs(b.y - a.y) * 0.08);
      return `M${f2(a.x)} ${f2(a.y)}Q${f2(a.x - 2 * bulge)} ${f2((a.y + b.y) / 2)} ${f2(b.x)} ${f2(b.y)}`;
    };
    const add = (tag: 'path' | 'circle', attrs: Record<string, string>) => {
      const node = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
      svgEl.appendChild(node);
    };
    const active = Math.max(0, activeRef.current);
    for (let i = 0; i < pts.length - 1; i++) {
      add('path', {
        d: path(pts[i], pts[i + 1], 14),
        class: 'parc',
        stroke: 'var(--parchment)',
        'stroke-opacity': i < active ? '.34' : '.12',
        'stroke-width': '1',
      });
    }
    for (let j = active - 1; j >= 0; j--) {
      const w = BACK_WEIGHTS[active - 1 - j] ?? 0.08;
      add('path', {
        d: path(pts[active], pts[j], 26 + (active - j) * 10),
        class: 'parc',
        stroke: 'var(--gold)',
        'stroke-opacity': f2(0.3 + w),
        'stroke-width': f2(1 + w * 4),
      });
    }
    pts.forEach((p, i) =>
      add('circle', {
        cx: f2(p.x),
        cy: f2(p.y),
        r: i === active ? '4.5' : '3',
        fill: i === active ? 'var(--gold)' : i < active ? 'var(--parchment)' : 'rgba(236,233,224,.25)',
      }),
    );
  }, []);

  const activate = useCallback(
    (a: number) => {
      const section = sectionRef.current;
      if (!section || a === activeRef.current) return;
      activeRef.current = a;
      section.querySelectorAll<HTMLElement>('.attn-step').forEach((li, i) => {
        li.classList.toggle('is-active', i === a);
        li.classList.toggle('is-past', i < a);
        const btn = li.querySelector('.attn-step-btn');
        if (i === a) btn?.setAttribute('aria-current', 'step');
        else btn?.removeAttribute('aria-current');
        // Inline (narrow-screen) artifacts stay revealed once reached.
        li.querySelector('.attn-art')?.classList.toggle('is-active', i <= a);
      });
      section.querySelectorAll<HTMLElement>('.attn-art-stage > .attn-art').forEach((art, i) => {
        art.classList.toggle('is-active', i === a);
      });
      draw();
    },
    [draw],
  );

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>('.attn-step'));
    let a = 0;
    if (pinned()) {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      a = Math.min(items.length - 1, Math.floor(progress * items.length * 0.999));
    } else {
      const mid = window.innerHeight * 0.55;
      let best = Infinity;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < best) {
          best = d;
          a = i;
        }
      });
    }
    activate(a);
  }, [activate]);

  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        update();
        draw();
      }, 140);
    };
    update();
    draw();
    void document.fonts?.ready.then(draw);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, [update, draw]);

  /** Clicking a step jumps to it: on desktop that means scrolling the pinned track. */
  const jumpTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    if (pinned()) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / steps.length) * span, behavior: 'smooth' });
    } else {
      activate(i);
    }
  };

  return (
    <section ref={sectionRef} className="attn-process" id="process" aria-labelledby="attn-process-h">
      <div className="attn-process-pin">
        <div className="attn-wrap">
          <h2 className="attn-sec-h" id="attn-process-h">
            {title}
          </h2>
          <p className="attn-sec-note">{note}</p>
          <div ref={wrapRef} className="attn-steps-wrap">
            <svg ref={arcsRef} className="attn-parcs" aria-hidden="true" />
            <ol className="attn-steps">
              {steps.map((step, i) => (
                <li key={step.key} className="attn-step">
                  <span className="num">{step.number}</span>
                  <h3 style={{ margin: 0 }}>
                    <button type="button" className="attn-step-btn" onClick={() => jumpTo(i)}>
                      {step.title}
                    </button>
                  </h3>
                  <p>{step.body}</p>
                  <div className="attn-art" aria-hidden="true">
                    <StepArtifact step={step.key} copy={artifacts} label={exampleLabel} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="attn-art-stage" aria-hidden="true">
            {steps.map((step) => (
              <div key={step.key} className="attn-art">
                <StepArtifact step={step.key} copy={artifacts} label={exampleLabel} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
