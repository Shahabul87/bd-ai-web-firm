import type { HeroData } from './schema';
import {
  arcBetween,
  assignLines,
  boxFromOffsets,
  dimmedOpacity,
  restingPairs,
  restingStroke,
  type PlacedBox,
  type StageMetrics,
  type TokenBox,
} from './geometry';

/**
 * Drives the hero: the "model" writes the headline token by token, then
 * attention arcs link the words and any word can become the query.
 *
 * It is deliberately imperative. The animation touches dozens of nodes on
 * timers and per frame; routing that through React state would re-render the
 * whole hero dozens of times a second. React renders the markup once (the full
 * headline, for SSR and no-JS visitors); this controller only toggles classes
 * and inline styles on those nodes, and owns the SVG it draws into.
 */

export interface HeroElements {
  root: HTMLElement;
  stage: HTMLElement;
  headline: HTMLElement;
  tokens: HTMLElement[];
  arcs: SVGSVGElement;
  caret: HTMLElement;
  candidates: HTMLElement;
  ledeWords: HTMLElement[];
  actions: HTMLElement;
  hint: HTMLElement;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const f2 = (n: number): string => n.toFixed(2);

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  parent?: Element,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  parent?.appendChild(el);
  return el;
}

export function createHeroController(el: HeroElements, data: HeroData, reducedMotion: boolean) {
  let disposed = false;
  let ready = false;
  let drawnOnce = false;
  let queryIndex = -1;
  let pinned = false;
  let gBase: SVGGElement | null = null;
  let gQuery: SVGGElement | null = null;
  const timers = new Set<number>();
  const cleanups: Array<() => void> = [];

  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!disposed) fn();
    }, ms);
    timers.add(id);
  };

  /** Resolves after `ms`, or never if the controller is disposed meanwhile. */
  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      later(resolve, ms);
    });

  const metrics = (): StageMetrics => {
    const cs = getComputedStyle(el.stage);
    return {
      fontSize: parseFloat(getComputedStyle(el.headline).fontSize),
      padTop: parseFloat(cs.paddingTop),
      padBottom: parseFloat(cs.paddingBottom),
    };
  };

  // offset* ignores the entrance transform, so geometry is stable mid-animation.
  const tokenBox = (t: HTMLElement, fontSize: number): TokenBox =>
    boxFromOffsets(t.offsetLeft + el.headline.offsetLeft, t.offsetTop + el.headline.offsetTop, t.offsetWidth, fontSize);

  const layout = (): { boxes: PlacedBox[]; lines: number; m: StageMetrics } => {
    const m = metrics();
    const { boxes, lines } = assignLines(el.tokens.map((t) => tokenBox(t, m.fontSize)), m.fontSize);
    return { boxes, lines, m };
  };

  function buildArcs(animate: boolean): void {
    el.arcs.replaceChildren();
    el.arcs.classList.remove('breathing');
    const { boxes, lines, m } = layout();
    gBase = svg('g', { class: 'g-base' }, el.arcs);
    gQuery = svg('g', { class: 'g-q' }, el.arcs);
    // At rest, only words on the same line are linked: an S-curve squeezed
    // through the gap between lines reads as a stray tick, not an arc. Those
    // links still appear when a word is the query.
    const pairs = restingPairs(data.weights).filter(({ i, j }) => boxes[i].line === boxes[j].line);
    pairs.forEach(({ i, j, w }, n) => {
      const g = arcBetween(boxes[i], boxes[j], lines, m);
      const stroke = restingStroke(w, g.cross);
      const path = svg('path', {
        d: g.d,
        class: 'arc base',
        'stroke-width': f2(stroke.width),
        'stroke-opacity': f2(stroke.opacity),
      }, gBase ?? undefined);
      path.style.animationDelay = `${-n * 0.8}s`;
      if (animate) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len} ${len}`;
        path.style.strokeDashoffset = `${len}`;
        path.classList.add('draw');
        later(() => {
          path.style.strokeDashoffset = '0';
        }, 60 + n * 120);
      }
    });
    if (animate) later(() => el.arcs.classList.add('breathing'), 60 + pairs.length * 120 + 1300);
    else el.arcs.classList.add('breathing');
    if (queryIndex >= 0) drawQuery(queryIndex);
  }

  function drawQuery(i: number): void {
    if (!gQuery) return;
    gQuery.replaceChildren();
    if (i < 0) return;
    const { boxes, lines, m } = layout();
    const small = m.fontSize < 80;
    const labels: Array<{ mx: number; my: number; w: number }> = [];
    for (let j = 0; j < el.tokens.length; j++) {
      if (j === i) continue;
      const w = data.weights[i][j];
      const g = arcBetween(boxes[i], boxes[j], lines, m);
      svg('path', {
        d: g.d,
        class: 'arc qa',
        'stroke-width': f2(1.2 + w * 9),
        'stroke-opacity': f2(Math.min(1, 0.7 + w * 0.8)),
      }, gQuery);
      labels.push({ mx: g.mx, my: g.my, w });
    }
    for (const { mx, my, w } of labels) {
      if (small && w < 0.05) continue;
      const group = svg('g', { class: 'wlg' }, gQuery);
      const pill = svg('rect', { rx: 10, ry: 10, height: 20, fill: '#0E2621', stroke: 'rgba(242,179,61,.55)', 'stroke-width': 1 }, group);
      const text = svg('text', {
        x: f2(mx),
        y: f2(my),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': 13,
        'font-weight': 600,
        fill: '#ECE9E0',
      }, group);
      text.style.fontFamily = 'var(--attn-sans)';
      text.style.fontVariantNumeric = 'tabular-nums';
      text.textContent = w.toFixed(2);
      let tw = 30;
      try {
        tw = text.getBBox().width || tw;
      } catch {
        // getBBox throws when the SVG is not rendered (display:none); keep the estimate.
      }
      pill.setAttribute('x', f2(mx - tw / 2 - 8));
      pill.setAttribute('y', f2(my - 10));
      pill.setAttribute('width', f2(tw + 16));
    }
  }

  function setQuery(i: number): void {
    if (!ready) return;
    queryIndex = i;
    el.arcs.classList.toggle('querying', i >= 0);
    if (gBase) gBase.style.opacity = i >= 0 ? '.06' : '';
    el.tokens.forEach((t, j) => {
      t.classList.toggle('q', j === i);
      t.setAttribute('aria-pressed', String(j === i && pinned));
      t.style.opacity = i >= 0 && j !== i ? f2(dimmedOpacity(data.weights[i][j])) : '';
    });
    drawQuery(i);
  }

  // ── Interaction ────────────────────────────────────────────────
  el.tokens.forEach((t, i) => {
    const enter = () => {
      if (!pinned) setQuery(i);
    };
    const leave = () => {
      if (!pinned) setQuery(-1);
    };
    const focus = () => setQuery(i);
    const toggle = () => {
      if (pinned && queryIndex === i) {
        pinned = false;
        setQuery(-1);
        return;
      }
      pinned = true;
      setQuery(i);
    };
    const click = (e: MouseEvent) => {
      e.stopPropagation();
      toggle();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle();
    };
    t.addEventListener('mouseenter', enter);
    t.addEventListener('mouseleave', leave);
    t.addEventListener('focus', focus);
    t.addEventListener('blur', leave);
    t.addEventListener('click', click);
    t.addEventListener('keydown', key);
    cleanups.push(() => {
      t.removeEventListener('keydown', key);
      t.removeEventListener('mouseenter', enter);
      t.removeEventListener('mouseleave', leave);
      t.removeEventListener('focus', focus);
      t.removeEventListener('blur', leave);
      t.removeEventListener('click', click);
    });
  });

  const onPointerDown = (e: PointerEvent) => {
    if (pinned && !el.headline.contains(e.target as Node)) {
      pinned = false;
      setQuery(-1);
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && queryIndex >= 0) {
      pinned = false;
      setQuery(-1);
    }
  };
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (drawnOnce && !disposed) buildArcs(false);
    }, 140);
  };
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  cleanups.push(() => {
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    window.clearTimeout(resizeTimer);
  });

  // ── Generation ─────────────────────────────────────────────────
  function placeCaret(t: HTMLElement, fontSize: number): TokenBox {
    const b = tokenBox(t, fontSize);
    el.caret.style.left = `${b.left - fontSize * 0.06}px`;
    el.caret.style.top = `${b.capTop}px`;
    el.caret.style.height = `${b.base - b.capTop}px`;
    return b;
  }

  interface CandidateRow {
    row: HTMLDivElement;
    p: number;
    bar: HTMLElement;
    num: HTMLElement;
  }

  async function think(i: number, b: TokenBox, fontSize: number): Promise<CandidateRow[]> {
    const rows: CandidateRow[] = data.tokens[i].candidates.map(({ word, p }) => {
      const row = document.createElement('div');
      row.className = 'cand';
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = word;
      const barWrap = document.createElement('span');
      barWrap.className = 'bar';
      const bar = document.createElement('i');
      barWrap.appendChild(bar);
      const num = document.createElement('span');
      num.className = 'p';
      row.append(w, barWrap, num);
      el.candidates.appendChild(row);
      return { row, p, bar, num };
    });
    const colW = el.candidates.offsetWidth || 196;
    el.candidates.style.left = `${Math.max(0, Math.min(b.left, el.stage.clientWidth - colW))}px`;
    el.candidates.style.top = `${b.base + fontSize * 0.16}px`;
    rows.forEach((o, k) => later(() => o.row.classList.add('in'), 40 + k * 55));

    const duration = data.tokens[i].think;
    const t0 = performance.now();
    // Probabilities start noisy and converge; the second candidate is nudged
    // up early so the lead visibly flickers before it settles.
    await new Promise<void>((resolve) => {
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / duration);
        const noise = Math.pow(1 - k, 1.4);
        let best = 0;
        let bestV = -1;
        rows.forEach((o, idx) => {
          const v = Math.max(0.01, Math.min(0.99, o.p + (Math.random() - 0.5) * 0.5 * noise + (idx === 1 ? 0.18 * noise : 0)));
          o.bar.style.width = `${v * 100}%`;
          o.num.textContent = v.toFixed(2);
          if (v > bestV) {
            bestV = v;
            best = idx;
          }
        });
        rows.forEach((o, idx) => o.row.classList.toggle('lead', idx === best));
        if (k < 1) later(step, 70 + Math.random() * 50);
        else resolve();
      };
      step();
    });
    rows.forEach((o, idx) => {
      o.bar.style.width = `${o.p * 100}%`;
      o.num.textContent = o.p.toFixed(2);
      o.row.classList.toggle('lead', idx === 0);
    });
    await sleep(duration > 1000 ? 260 : 120);
    return rows;
  }

  async function commit(rows: CandidateRow[], t: HTMLElement): Promise<void> {
    rows.forEach((o, idx) => o.row.classList.add(idx === 0 ? 'pick' : 'drop'));
    t.classList.add('on');
    await sleep(200);
    later(() => rows.forEach((o) => o.row.remove()), 320);
  }

  async function streamLede(): Promise<void> {
    for (const w of el.ledeWords) {
      w.classList.add('on');
      const text = w.textContent ?? '';
      await sleep(/[,.:;—।]$/.test(text) || text === '—' ? 150 : 22 + Math.random() * 30);
    }
  }

  function finishStatic(): void {
    el.tokens.forEach((t) => t.classList.add('on'));
    el.ledeWords.forEach((w) => w.classList.add('on'));
    el.actions.classList.add('on');
    el.hint.classList.add('on');
    ready = true;
    buildArcs(false);
    drawnOnce = true;
  }

  async function run(): Promise<void> {
    el.root.dataset.state = 'live';
    const { fontSize } = metrics();
    await sleep(450);
    el.caret.classList.add('on');
    for (let i = 0; i < el.tokens.length; i++) {
      placeCaret(el.tokens[i], fontSize);
      await sleep(i === 0 ? 380 : 90);
      const rows = await think(i, tokenBox(el.tokens[i], fontSize), fontSize);
      await commit(rows, el.tokens[i]);
      await sleep(60 + Math.random() * 120);
    }
    const last = el.tokens[el.tokens.length - 1];
    const lastBox = tokenBox(last, fontSize);
    el.caret.style.left = `${lastBox.left + last.offsetWidth + fontSize * 0.04}px`;
    el.caret.classList.add('blink');
    await sleep(420);
    ready = true;
    buildArcs(true);
    drawnOnce = true;
    await sleep(700);
    el.caret.classList.remove('on', 'blink');
    el.hint.classList.add('on');
    await streamLede();
    el.actions.classList.add('on');
    el.root.dataset.state = 'done';
  }

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  if (reducedMotion) {
    el.root.dataset.state = 'static';
    void fontsReady.then(() => {
      if (!disposed) finishStatic();
    });
  } else {
    // Claim the hero synchronously so the CSS failsafe never races the fonts.
    el.root.dataset.state = 'live';
    void fontsReady.then(() => {
      if (!disposed) void run();
    });
  }

  return {
    dispose(): void {
      disposed = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      cleanups.forEach((fn) => fn());
      el.candidates.replaceChildren();
    },
  };
}
