'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { Link } from '@/i18n/navigation';
import { toBengaliDigits } from '@/app/lib/numerals';
import MapField from './MapField';
import {
  CLUSTER_KEYS,
  CONCEPT_POINTS,
  PARKED,
  fmtSim,
  idlePath,
  nearest,
  placeOf,
  type ClusterKey,
  type Pt,
} from './geometry';

export interface MapProduct {
  slug: string;
  title: string;
  tagline: string;
  platforms: string[];
  live: { href: string; kind: 'site' | 'store' } | null;
}

export interface WorkMapCopy {
  mapLabel: string;
  note: string;
  hintFine: string;
  hintCoarse: string;
  filterLabel: string;
  all: string;
  /** "Showing {count} of {total}" */
  showing: string;
  query: string;
  nearest: string;
  close: string;
  closest: string;
  openSite: string;
  openStore: string;
  readMore: string;
}

interface WorkMapProps {
  products: MapProduct[];
  /** Platforms that exist in the data, in display order. */
  filters: { key: string; label: string }[];
  platformLabels: Record<string, string>;
  concepts: Record<ClusterKey, string[]>;
  clusters: Record<ClusterKey, string>;
  copy: WorkMapCopy;
  bn: boolean;
}

/** Idle clock start: puts the Lissajous path near the parked query on load. */
const IDLE_T0 = 132.4;
/** Concepts within this distance of the query light up. */
const HOT_RADIUS = 11;
const CONCEPT_PTS: Pt[] = CLUSTER_KEYS.flatMap((k) => [...CONCEPT_POINTS[k]]);

const f2 = (n: number) => n.toFixed(2);
const lineOpacity = (sim: number) => f2(0.22 + 0.78 * sim ** 1.4);
const lineWidth = (sim: number) => f2(0.8 + 2.2 * sim);

function setText(el: Element | null, text: string) {
  if (!el) return;
  const node = el.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue !== text) node.nodeValue = text;
  } else {
    el.textContent = text;
  }
}

interface Controller {
  kick: () => void;
}

/**
 * The embedding map. Every product is a focusable point in a hand-placed 2-D
 * "latent space"; the pointer (or, when nobody is interacting, a query dot on
 * a slow Lissajous path) is a query vector joined to its three nearest
 * products by similarity-weighted gold lines.
 *
 * React renders the structure (and, on the server, the parked query with its
 * lines drawn, which is also the reduced-motion and no-JS picture); the
 * per-frame query movement is written straight to the DOM by one rAF loop that
 * runs only while the map is on screen and the tab is visible.
 */
export default function WorkMap({ products, filters, platformLabels, concepts, clusters, copy, bn }: WorkMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const scoreRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const readXYRef = useRef<HTMLSpanElement>(null);
  const readNearRef = useRef<HTMLSpanElement>(null);
  const ctl = useRef<Controller | null>(null);
  const openedAt = useRef(0);
  const skipFocusPin = useRef(false);

  const [filter, setFilter] = useState('all');
  const [pinned, setPinned] = useState<number | null>(null);

  const places = useMemo(() => products.map((p, i) => placeOf(p.slug, i)), [products]);
  const allIdx = useMemo(() => products.map((_, i) => i), [products]);
  const visible = useMemo(
    () => (filter === 'all' ? allIdx : allIdx.filter((i) => products[i].platforms.includes(filter))),
    [filter, allIdx, products],
  );
  const initial = useMemo(() => nearest(PARKED, places, allIdx, 3), [places, allIdx]);
  const fmt = useCallback((v: number) => (bn ? toBengaliDigits(fmtSim(v)) : fmtSim(v)), [bn]);
  const digits = (v: number) => (bn ? toBengaliDigits(v) : String(v));

  // Live values the animation loop reads without re-subscribing.
  const live = useRef({ pinned: null as number | null, visible: allIdx });
  useEffect(() => {
    live.current = { pinned, visible };
    ctl.current?.kick();
  }, [pinned, visible]);

  // The index below the hero filters through a data attribute on the page root.
  useEffect(() => {
    const page = rootRef.current?.closest('.pg-work');
    if (!page) return;
    if (filter === 'all') page.removeAttribute('data-wk-filter');
    else page.setAttribute('data-wk-filter', filter);
  }, [filter]);

  useEffect(() => {
    const map = mapRef.current;
    const q = queryRef.current;
    if (!map || !q) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const concepts = Array.from(map.querySelectorAll<HTMLElement>('.wk-c'));
    const hot = concepts.map(() => false);
    const cur: Pt = { ...PARKED };
    let pointer: Pt | null = null;
    let pointerUntil = Infinity;
    let idleT = IDLE_T0;
    let raf = 0;
    let last = 0;
    let running = false;
    let onScreen = false;
    let lastNear = -1;

    const render = () => {
      const s = live.current;
      const cands = s.visible.filter((i) => i !== s.pinned);
      const nb = nearest(cur, places, cands, 3);
      q.style.setProperty('--qx', f2(cur.x));
      q.style.setProperty('--qy', f2(cur.y));
      for (let k = 0; k < 3; k += 1) {
        const line = lineRefs.current[k];
        const score = scoreRefs.current[k];
        if (!line || !score) continue;
        const n = nb[k];
        if (!n) {
          line.style.opacity = '0';
          score.style.opacity = '0';
          continue;
        }
        const p = places[n.index];
        line.setAttribute('x1', f2(cur.x));
        line.setAttribute('y1', f2(cur.y));
        line.setAttribute('x2', f2(p.x));
        line.setAttribute('y2', f2(p.y));
        line.setAttribute('stroke-width', lineWidth(n.sim));
        line.style.opacity = lineOpacity(n.sim);
        score.style.setProperty('--sx', f2(cur.x + (p.x - cur.x) * 0.56));
        score.style.setProperty('--sy', f2(cur.y + (p.y - cur.y) * 0.56));
        score.style.opacity = '';
        setText(score, fmt(n.sim));
      }
      const ni = nb[0]?.index ?? -1;
      if (ni !== lastNear) {
        btnRefs.current[lastNear]?.removeAttribute('data-near');
        btnRefs.current[ni]?.setAttribute('data-near', '');
        lastNear = ni;
      }
      for (let i = 0; i < concepts.length; i += 1) {
        const c = CONCEPT_PTS[Number(concepts[i].dataset.ci)];
        if (!c) continue;
        const isHot = Math.hypot(c.x - cur.x, c.y - cur.y) < HOT_RADIUS;
        if (isHot !== hot[i]) {
          hot[i] = isHot;
          if (isHot) concepts[i].setAttribute('data-hot', '');
          else concepts[i].removeAttribute('data-hot');
        }
      }
      setText(readXYRef.current, `${fmt(cur.x / 100)}, ${fmt(1 - cur.y / 100)}`);
      setText(readNearRef.current, nb[0] ? `${products[nb[0].index].title} ${fmt(nb[0].sim)}` : '—');
    };

    const step = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const s = live.current;
      if (pointer && now > pointerUntil) pointer = null;
      let target: Pt;
      let tau: number;
      if (s.pinned !== null) {
        target = places[s.pinned];
        tau = 240;
      } else if (pointer) {
        target = pointer;
        tau = 90;
      } else if (reduced) {
        target = PARKED;
        tau = 0;
      } else {
        idleT += dt / 1000;
        target = idlePath(idleT);
        tau = 700;
      }
      if (reduced || tau === 0) {
        cur.x = target.x;
        cur.y = target.y;
      } else {
        const k = 1 - Math.exp(-dt / tau);
        cur.x += (target.x - cur.x) * k;
        cur.y += (target.y - cur.y) * k;
      }
      render();
    };

    const loop = (now: number) => {
      step(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || running || !onScreen || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const kick = () => {
      if (running) return;
      last = 0;
      step(performance.now());
    };
    ctl.current = { kick };

    const toMap = (e: PointerEvent): Pt => {
      const r = map.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
        y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
      };
    };
    const inside = (t: EventTarget | null, sel: string) => t instanceof Element && !!t.closest(sel);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || inside(e.target, '.wk-card')) return;
      pointer = toMap(e);
      pointerUntil = Infinity;
      kick();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (reduced) {
        pointer = null;
        kick();
      } else {
        pointerUntil = performance.now() + 900;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (inside(e.target, '.wk-p, .wk-card')) return;
      setPinned(null);
      if (e.pointerType !== 'mouse') {
        // Touch and pen: a tap on empty space moves the query there.
        pointer = toMap(e);
        pointerUntil = reduced ? Infinity : performance.now() + 6000;
        kick();
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    map.addEventListener('pointermove', onMove);
    map.addEventListener('pointerleave', onLeave);
    map.addEventListener('pointerdown', onDown);
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        map.toggleAttribute('data-live', onScreen && !reduced);
        if (onScreen) start();
        else stop();
      });
      io.observe(map);
    } else {
      onScreen = true;
      start();
    }
    map.setAttribute('data-ready', '');
    render();

    return () => {
      stop();
      io?.disconnect();
      ctl.current = null;
      map.removeEventListener('pointermove', onMove);
      map.removeEventListener('pointerleave', onLeave);
      map.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [places, products, fmt]);

  const pin = (i: number) => {
    openedAt.current = performance.now();
    setPinned(i);
  };

  const unpinTo = (i: number) => {
    setPinned(null);
    skipFocusPin.current = true;
    btnRefs.current[i]?.focus();
    skipFocusPin.current = false;
  };

  const onPointFocus = (i: number) => {
    if (skipFocusPin.current) return;
    pin(i);
  };

  const onPointClick = (i: number) => {
    // A mouse press focuses (and pins) first; only a later click toggles it shut.
    if (pinned === i && performance.now() - openedAt.current > 350) setPinned(null);
    else pin(i);
  };

  const onPointKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const at = visible.indexOf(i);
    const next = visible[(at + dir + visible.length) % visible.length];
    btnRefs.current[next]?.focus();
  };

  const onMapKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape' || pinned === null) return;
    e.preventDefault();
    unpinTo(pinned);
  };

  const onMapBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (!(next instanceof Node) || !e.currentTarget.contains(next)) setPinned(null);
  };

  const choose = (key: string) => {
    setFilter(key);
    if (pinned !== null && key !== 'all' && !products[pinned].platforms.includes(key)) setPinned(null);
  };

  const showing = copy.showing
    .replace('{count}', digits(visible.length))
    .replace('{total}', digits(products.length));

  return (
    <div ref={rootRef} className="wk-explorer">
      <div className="wk-bar">
        <div className="wk-chips" role="group" aria-label={copy.filterLabel}>
          {[{ key: 'all', label: copy.all }, ...filters].map((f) => (
            <button
              key={f.key}
              type="button"
              className="wk-chip"
              aria-pressed={filter === f.key}
              onClick={() => choose(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="wk-status pg-cap" aria-live="polite">
          {showing}
        </p>
      </div>

      <div
        ref={mapRef}
        className="wk-map"
        role="group"
        aria-label={copy.mapLabel}
        aria-describedby="wk-map-hint"
        onKeyDown={onMapKey}
        onBlur={onMapBlur}
      >
        <MapField
          idp="wk"
          concepts={concepts}
          clusters={clusters}
          lines={
            <g className="wk-lines">
              {[0, 1, 2].map((k) => {
                const n = initial[k];
                const p = n ? places[n.index] : PARKED;
                return (
                  <line
                    key={k}
                    ref={(el) => {
                      lineRefs.current[k] = el;
                    }}
                    className="wk-line"
                    x1={PARKED.x}
                    y1={PARKED.y}
                    x2={p.x}
                    y2={p.y}
                    strokeWidth={n ? lineWidth(n.sim) : 0}
                    style={{ opacity: n ? lineOpacity(n.sim) : 0 }}
                  />
                );
              })}
            </g>
          }
        />

        <div className="wk-scores" aria-hidden="true">
          {[0, 1, 2].map((k) => {
            const n = initial[k];
            const p = n ? places[n.index] : PARKED;
            return (
              <span
                key={k}
                ref={(el) => {
                  scoreRefs.current[k] = el;
                }}
                className="wk-score"
                style={
                  {
                    '--sx': f2(PARKED.x + (p.x - PARKED.x) * 0.56),
                    '--sy': f2(PARKED.y + (p.y - PARKED.y) * 0.56),
                    opacity: n ? undefined : 0,
                  } as CSSProperties
                }
              >
                {n ? fmt(n.sim) : ''}
              </span>
            );
          })}
        </div>

        <div
          ref={queryRef}
          className="wk-q"
          aria-hidden="true"
          style={{ '--qx': PARKED.x, '--qy': PARKED.y } as CSSProperties}
        >
          <i />
        </div>

        <div className="wk-points">
          {products.map((p, i) => {
            const place = places[i];
            const out = !visible.includes(i);
            const open = pinned === i;
            const cardId = `wk-card-${p.slug}`;
            const neighbours = open ? nearest(place, places, allIdx.filter((j) => j !== i), 2) : [];
            return (
              <div
                key={p.slug}
                className="wk-pt"
                data-side={place.side}
                data-out={out ? '' : undefined}
                style={{ '--x': place.x, '--y': place.y, '--i': i } as CSSProperties}
              >
                <button
                  ref={(el) => {
                    btnRefs.current[i] = el;
                  }}
                  type="button"
                  className="wk-p"
                  disabled={out}
                  aria-expanded={open}
                  aria-controls={open ? cardId : undefined}
                  data-near={initial[0]?.index === i ? '' : undefined}
                  onFocus={() => onPointFocus(i)}
                  onClick={() => onPointClick(i)}
                  onKeyDown={(e) => onPointKey(e, i)}
                >
                  <span className="wk-dot" aria-hidden="true" />
                  <span className="wk-lbl">{p.title}</span>
                </button>
                {open ? (
                  <div
                    id={cardId}
                    className="wk-card"
                    role="group"
                    aria-label={p.title}
                    data-h={place.x > 56 ? 'l' : 'r'}
                    data-v={place.y > 55 ? 'up' : 'down'}
                  >
                    <button type="button" className="wk-card-x" aria-label={copy.close} onClick={() => unpinTo(i)}>
                      <span aria-hidden="true">×</span>
                    </button>
                    <p className="wk-card-t">{p.title}</p>
                    <p className="wk-card-d">{p.tagline}</p>
                    <ul className="wk-tags">
                      {p.platforms.map((pl) => (
                        <li key={pl}>{platformLabels[pl] ?? pl}</li>
                      ))}
                    </ul>
                    {neighbours.length ? (
                      <p className="wk-card-nb pg-cap">
                        <span>{copy.closest}</span>{' '}
                        {neighbours.map((n, j) => (
                          <span key={n.index} className="wk-card-nbi">
                            {j ? ' · ' : ''}
                            {products[n.index].title} <b>{fmt(n.sim)}</b>
                          </span>
                        ))}
                      </p>
                    ) : null}
                    <div className="wk-card-a">
                      {p.live ? (
                        <a
                          className="attn-btn attn-btn-primary attn-btn-sm"
                          href={p.live.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.live.kind === 'store' ? copy.openStore : copy.openSite}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : null}
                      <Link className="attn-btn attn-btn-secondary attn-btn-sm" href={`/products/${p.slug}`}>
                        {copy.readMore}
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="wk-foot">
        <p id="wk-map-hint" className="wk-hint pg-cap">
          <span className="wk-hint-fine">{copy.hintFine}</span>
          <span className="wk-hint-coarse">{copy.hintCoarse}</span>
        </p>
        <p className="wk-read pg-cap pg-num" aria-hidden="true">
          <span>{copy.query}</span>
          <span ref={readXYRef} className="wk-read-v">
            {`${fmt(PARKED.x / 100)}, ${fmt(1 - PARKED.y / 100)}`}
          </span>
          <span>{copy.nearest}</span>
          <span ref={readNearRef} className="wk-read-v">
            {initial[0] ? `${products[initial[0].index].title} ${fmt(initial[0].sim)}` : '—'}
          </span>
        </p>
      </div>
      <p className="wk-note pg-cap">{copy.note}</p>
    </div>
  );
}
