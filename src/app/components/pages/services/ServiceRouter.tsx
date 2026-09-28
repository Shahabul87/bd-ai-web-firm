'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';

export interface RouterPrompt {
  chip: string;
  text: string;
}

export interface RouterExpert {
  /** Anchor id of the service's spec section on this page. */
  id: string;
  title: string;
}

export interface RouterLabels {
  label: string;
  example: string;
  chipsLabel: string;
  requestLabel: string;
  expertsLabel: string;
  routing: string;
  routedTo: string;
  readSpec: string;
  pause: string;
  play: string;
}

interface ServiceRouterProps {
  prompts: RouterPrompt[];
  experts: RouterExpert[];
  labels: RouterLabels;
  bengaliDigits: boolean;
}

/**
 * How well each example request fits each service (rows: prompts, columns:
 * services, both in page order). Illustrative, hand-set, each row sums to 1 —
 * the gate's softmax once it has "read" the request.
 */
const WEIGHTS: readonly (readonly number[])[] = [
  [0.71, 0.12, 0.03, 0.06, 0.05, 0.03],
  [0.09, 0.74, 0.04, 0.05, 0.05, 0.03],
  [0.03, 0.08, 0.68, 0.04, 0.14, 0.03],
  [0.08, 0.1, 0.03, 0.72, 0.03, 0.04],
  [0.03, 0.05, 0.12, 0.04, 0.73, 0.03],
  [0.1, 0.06, 0.03, 0.08, 0.04, 0.69],
];

const ROW = 44;
const FAN_W = 120;
const TYPE_MS = 26;
const ROUTE_MS = 1500;
const HOLD_MS = 4200;

type Phase = 'typing' | 'routing' | 'routed';

/** Split into user-perceived characters so Bengali conjuncts never tear mid-type. */
function graphemes(text: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: 'grapheme' }) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  return Array.from(text);
}

const argmax = (xs: readonly number[]) => xs.reduce((best, x, i) => (x > xs[best] ? i : best), 0);

/**
 * A mixture-of-experts gate for the six services. A request is typed in, the
 * gate "reads" it (the probabilities flicker, then settle), and the request is
 * routed to the best-fitting service, whose spec it links to. Cycles through
 * the example requests while on screen; any chip pins a request and stops the
 * cycle. The server HTML is the finished routing of the first request, so
 * no-JS and reduced-motion visitors get a complete, static picture.
 */
export default function ServiceRouter({ prompts, experts, labels, bengaliDigits }: ServiceRouterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState<number | null>(null); // null = whole request
  const [phase, setPhase] = useState<Phase>('routed');
  const [probs, setProbs] = useState<readonly number[]>(WEIGHTS[0]);
  const [auto, setAuto] = useState(true);
  const [motion, setMotion] = useState<'pending' | 'full' | 'reduced'>('pending');
  const [announce, setAnnounce] = useState('');

  const timers = useRef<number[]>([]);
  const raf = useRef(0);
  const activeRef = useRef(0);
  const visibleRef = useRef(false);
  const waitingRef = useRef(false);
  /** Set once the visitor picks a request; the cycle never restarts after that. */
  const pinnedRef = useRef(false);
  const nextRef = useRef<() => void>(() => {});

  const clear = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    cancelAnimationFrame(raf.current);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** Jump straight to the finished routing of a request (reduced motion, pause). */
  const settle = useCallback(
    (index: number) => {
      clear();
      activeRef.current = index;
      setActive(index);
      setTyped(null);
      setProbs(WEIGHTS[index % WEIGHTS.length]);
      setPhase('routed');
    },
    [clear],
  );

  const play = useCallback(
    (index: number, keepCycling: boolean) => {
      clear();
      const chars = graphemes(prompts[index].text);
      const target = WEIGHTS[index % WEIGHTS.length];
      activeRef.current = index;
      setActive(index);
      setTyped(0);
      setPhase('typing');
      setProbs(target.map(() => 0));

      const route = () => {
        setPhase('routing');
        const start = performance.now();
        const frame = (now: number) => {
          const k = Math.min(1, (now - start) / ROUTE_MS);
          const settleBy = 1 - Math.pow(1 - k, 3);
          // Before it settles the gate is undecided: every service flickers
          // around an even share, then the real fit takes over.
          const raw = target.map((p, j) => {
            const undecided = 1 / 6 + 0.1 * Math.sin(now / 95 + j * 1.9) + 0.05 * Math.sin(now / 41 + j * 3.1);
            return p * settleBy + Math.max(0.01, undecided) * (1 - settleBy);
          });
          const sum = raw.reduce((a, b) => a + b, 0);
          if (k < 1) {
            setProbs(raw.map((v) => v / sum));
            raf.current = requestAnimationFrame(frame);
          } else {
            setProbs(target);
            setPhase('routed');
            if (keepCycling) later(() => nextRef.current(), HOLD_MS);
          }
        };
        raf.current = requestAnimationFrame(frame);
      };

      let n = 0;
      const typeNext = () => {
        n += 1;
        setTyped(n);
        if (n < chars.length) later(typeNext, chars[n - 1] === ' ' ? TYPE_MS * 2.4 : TYPE_MS);
        else later(route, 280);
      };
      later(typeNext, 240);
    },
    [clear, later, prompts],
  );

  // The cycle only advances while someone can see it.
  useEffect(() => {
    nextRef.current = () => {
      if (!visibleRef.current || document.hidden) {
        waitingRef.current = true;
        return;
      }
      waitingRef.current = false;
      play((activeRef.current + 1) % prompts.length, true);
    };
  }, [play, prompts.length]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMotion(reduced ? 'reduced' : 'full');
    if (reduced) setAuto(false);
  }, []);

  useEffect(() => {
    if (motion !== 'full') return;
    const node = rootRef.current;
    if (!node) return;
    let started = false;
    const resume = () => {
      if (waitingRef.current && visibleRef.current && !document.hidden) nextRef.current();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !started) {
          started = true;
          if (!pinnedRef.current) play(0, true);
        } else resume();
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    document.addEventListener('visibilitychange', resume);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', resume);
      clear();
    };
  }, [motion, play, clear]);

  const choose = (index: number) => {
    pinnedRef.current = true;
    setAuto(false);
    waitingRef.current = false;
    setAnnounce(`${labels.routedTo}: ${experts[argmax(WEIGHTS[index])].title}`);
    if (motion === 'full') play(index, false);
    else settle(index);
  };

  const toggleAuto = () => {
    if (auto) {
      setAuto(false);
      settle(activeRef.current);
    } else {
      pinnedRef.current = false;
      setAuto(true);
      play((activeRef.current + 1) % prompts.length, true);
    }
  };

  const request = prompts[active];
  const chars = typed === null ? null : graphemes(request.text);
  const shown = chars ? chars.slice(0, typed ?? 0).join('') : request.text;
  const winner = argmax(WEIGHTS[active % WEIGHTS.length]);
  const routed = phase === 'routed';
  const fmt = (p: number) => {
    const s = p.toFixed(2);
    return bengaliDigits ? toBengaliDigits(s) : s;
  };

  const H = experts.length * ROW;
  const gateY = H / 2;

  return (
    <div
      ref={rootRef}
      className="sv-router pg-panel"
      data-phase={phase}
      data-live={motion === 'pending' ? undefined : 'true'}
    >
      <div className="sv-router-head">
        <span className="sv-router-title">
          <b>{labels.label}</b>
          <span className="pg-cap">{labels.example}</span>
        </span>
        {motion === 'full' ? (
          <button type="button" className="sv-router-toggle" aria-pressed={!auto} onClick={toggleAuto}>
            <span aria-hidden="true" className={auto ? 'sv-ico-pause' : 'sv-ico-play'} />
            {auto ? labels.pause : labels.play}
          </button>
        ) : null}
      </div>

      <div className="sv-chips" role="group" aria-label={labels.chipsLabel}>
        {prompts.map((p, i) => (
          <button
            key={p.chip}
            type="button"
            className="sv-chip"
            aria-pressed={i === active}
            onClick={() => choose(i)}
          >
            {p.chip}
          </button>
        ))}
      </div>

      <div className="sv-router-body">
        <div className="sv-req">
          <span className="pg-cap">{labels.requestLabel}</span>
          <p className="sv-req-text">
            <span aria-hidden="true">
              “{shown}
              {phase === 'typing' ? <span className="sv-caret" /> : null}
              {phase !== 'typing' ? '”' : null}
            </span>
            <span className="sr-only">{request.text}</span>
          </p>
          <span className={`sv-req-state pg-cap${phase === 'routing' ? ' on' : ''}`} aria-hidden="true">
            {labels.routing}
          </span>
        </div>

        <svg className="sv-fan" viewBox={`0 0 ${FAN_W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {experts.map((e, j) => {
            const y = ROW * j + ROW / 2;
            const d = `M14 ${gateY} C 60 ${gateY}, 68 ${y}, ${FAN_W} ${y}`;
            const p = probs[j] ?? 0;
            const win = routed && j === winner;
            return (
              <g key={e.id}>
                <path
                  d={d}
                  className={win ? 'sv-wire is-win' : 'sv-wire'}
                  style={{ strokeOpacity: 0.1 + 0.9 * p, strokeWidth: 1 + p * 2.2 }}
                />
                {win ? <path d={d} className="sv-wire-pulse" /> : null}
              </g>
            );
          })}
          <circle cx="14" cy={gateY} r="10" className="sv-gate-ring" />
          <circle cx="14" cy={gateY} r="5" className="sv-gate" />
        </svg>

        <ol className="sv-experts" aria-label={labels.expertsLabel}>
          {experts.map((e, j) => {
            const p = probs[j] ?? 0;
            const win = routed && j === winner;
            return (
              <li key={e.id} className={win ? 'is-win' : undefined}>
                <span className="sv-ex-name">{e.title}</span>
                <span className="sv-ex-bar" aria-hidden="true">
                  <i style={{ transform: `scaleX(${p})` }} />
                </span>
                <span className="sv-ex-p">{phase === 'typing' ? '—' : fmt(p)}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`sv-routed${routed ? ' on' : ''}`}>
        <span className="pg-cap">{labels.routedTo}</span>
        <a href={`#${experts[winner].id}`} className="sv-routed-link" tabIndex={routed ? undefined : -1}>
          <b>{experts[winner].title}</b>
          <span>
            {labels.readSpec} <span aria-hidden="true">↓</span>
          </span>
        </a>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
