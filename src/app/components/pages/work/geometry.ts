/**
 * Geometry of the Work page's "embedding map". Pure data and functions, no DOM,
 * no randomness: every position is hand-tuned or an integer hash of its index,
 * so the server HTML and the first client render are identical.
 *
 * The map uses a 0–100 space on both axes (percent of the map box). The box
 * changes aspect ratio with the viewport; the field SVG stretches with it and
 * every mark that must stay round (dots, the query) is either an HTML element
 * or a zero-length stroke with `vector-effect: non-scaling-stroke`.
 */

export type ClusterKey = 'learn' | 'lang' | 'docs' | 'money';
export const CLUSTER_KEYS: readonly ClusterKey[] = ['learn', 'lang', 'docs', 'money'];

export interface Pt {
  x: number;
  y: number;
}

/** Where a product's label sits relative to its dot. */
export type LabelSide = 'r' | 'l' | 'b';

export interface ProductPlace extends Pt {
  cluster: ClusterKey;
  side: LabelSide;
}

/**
 * Hand-placed so related products cluster: the four learning products sit
 * together (MathPhysics, the bilingual one, leans toward Banglu), language,
 * documents and money each get their own region. Label sides are chosen so no
 * two labels collide from 390px to 1440px wide.
 */
export const PRODUCT_PLACES: Readonly<Record<string, ProductPlace>> = {
  'book-ai': { x: 18, y: 27, cluster: 'learn', side: 'r' },
  mathphysics: { x: 43, y: 17, cluster: 'learn', side: 'r' },
  taxomind: { x: 27, y: 50, cluster: 'learn', side: 'r' },
  'taxomind-schools': { x: 45, y: 38, cluster: 'learn', side: 'r' },
  banglu: { x: 80, y: 28, cluster: 'lang', side: 'l' },
  file2insight: { x: 74, y: 66, cluster: 'docs', side: 'b' },
  'fincoach-ai': { x: 24, y: 80, cluster: 'money', side: 'r' },
};

export interface ClusterShape extends Pt {
  rx: number;
  ry: number;
  /** Caption position and alignment (captions sit at the edge of the halo). */
  cap: Pt & { align: 'start' | 'end' };
  seed: number;
}

export const CLUSTERS: Readonly<Record<ClusterKey, ClusterShape>> = {
  learn: { x: 31, y: 40, rx: 27, ry: 33, cap: { x: 5, y: 7, align: 'start' }, seed: 1 },
  lang: { x: 78, y: 24, rx: 15, ry: 19, cap: { x: 95, y: 5, align: 'end' }, seed: 2 },
  docs: { x: 73, y: 70, rx: 16, ry: 20, cap: { x: 95, y: 93, align: 'end' }, seed: 3 },
  money: { x: 25, y: 84, rx: 17, ry: 13, cap: { x: 44, y: 96, align: 'start' }, seed: 4 },
};

/**
 * Labelled concept points, per cluster, in the same order as the concept words
 * in messages (`Products.map.concepts.<cluster>`). Hand-placed around each
 * cluster, clear of the product labels.
 */
export const CONCEPT_POINTS: Readonly<Record<ClusterKey, readonly Pt[]>> = {
  learn: [
    { x: 12, y: 38 }, // lessons
    { x: 33, y: 33 }, // students
    { x: 38, y: 58 }, // exams
    { x: 16, y: 58 }, // questions
    { x: 52, y: 46 }, // teachers
    { x: 30, y: 21 }, // practice
    { x: 54, y: 25 }, // animations
    { x: 8, y: 19 }, // vectors
    { x: 50, y: 56 }, // curriculum
    { x: 19, y: 67 }, // progress
  ],
  lang: [
    { x: 63, y: 13 }, // Bangla
    { x: 86, y: 16 }, // keyboard
    { x: 89, y: 30 }, // phonetic
    { x: 71, y: 36 }, // script
    { x: 84, y: 41 }, // typing
    { x: 71, y: 8 }, // conjuncts
  ],
  docs: [
    { x: 64, y: 57 }, // PDF
    { x: 82, y: 59 }, // summaries
    { x: 62, y: 77 }, // answers
    { x: 83, y: 77 }, // extraction
    { x: 72, y: 85 }, // reports
    { x: 57, y: 66 }, // sources
  ],
  money: [
    { x: 11, y: 76 }, // budget
    { x: 34, y: 89 }, // spending
    { x: 13, y: 88 }, // goals
    { x: 38, y: 73 }, // bills
    { x: 23, y: 93 }, // savings
  ],
};

/** A small integer hash → [0, 1). Deterministic on every JS engine. */
export function hash01(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Hash of a string (FNV-1a) → unsigned int. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Faint unlabelled background points: the rest of the latent space. */
export const SCATTER: readonly (Pt & { big: boolean })[] = Array.from({ length: 84 }, (_, i) => ({
  x: r1(3 + hash01(i * 2 + 11) * 94),
  y: r1(4 + hash01(i * 2 + 12) * 92),
  big: hash01(i + 400) > 0.82,
}));

/** Tiny per-index drift for concept points (CSS reads these as custom properties). */
export function driftOf(i: number): { dx: number; dy: number; dur: number; delay: number } {
  return {
    dx: r1((hash01(i + 900) - 0.5) * 10),
    dy: r1((hash01(i + 950) - 0.5) * 8),
    dur: r1(9 + hash01(i + 990) * 7),
    delay: r1(-hash01(i + 1030) * 12),
  };
}

/**
 * A closed, slightly irregular contour around a cluster (the "density" rings).
 * `scale` shrinks it toward the centre; the wobble is a fixed sum of sines.
 */
export function contourPath(c: ClusterShape, scale: number, points = 56): string {
  const parts: string[] = [];
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    const wob = 1 + 0.09 * Math.sin(3 * a + c.seed * 1.7) + 0.05 * Math.sin(5 * a + c.seed * 0.9);
    const x = c.x + Math.cos(a) * c.rx * scale * wob;
    const y = c.y + Math.sin(a) * c.ry * scale * wob;
    parts.push(`${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${parts.join('')}Z`;
}

/** Deterministic fallback for a product the table above doesn't know yet. */
export function placeOf(slug: string, index: number): ProductPlace {
  const known = PRODUCT_PLACES[slug];
  if (known) return known;
  const h = hashString(slug);
  return {
    x: r1(12 + hash01(h) * 70),
    y: r1(14 + hash01(h + index + 1) * 70),
    cluster: 'learn',
    side: 'r',
  };
}

/* ── Similarity ─────────────────────────────────────────────────────── */

/** Width of the similarity kernel, in map units. */
export const SIGMA = 30;

/** Gaussian similarity from distance on the map: 1.00 at the point, ~0.4 at 40 units. */
export function similarity(a: Pt, b: Pt): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA));
}

export interface Neighbour {
  index: number;
  sim: number;
}

/** The `k` most similar points to `q` among `candidates` (by index into `points`). */
export function nearest(q: Pt, points: readonly Pt[], candidates: readonly number[], k = 3): Neighbour[] {
  return candidates
    .map((index) => ({ index, sim: similarity(q, points[index]) }))
    .sort((a, b) => b.sim - a.sim || a.index - b.index)
    .slice(0, k);
}

/** Where the query rests when nothing moves it: inside the learning cluster. */
export const PARKED: Pt = { x: 35, y: 40 };

/**
 * The idle query's path: a slow Lissajous figure (frequency ratio ~3:4) that
 * sweeps every cluster. `t` in seconds.
 */
export function idlePath(t: number): Pt {
  return {
    x: 50 + 35 * Math.sin(0.23 * t + 0.6),
    y: 50 + 36 * Math.sin(0.31 * t),
  };
}

/** Ten bar heights (0.2–1) for a product's little "vector" glyph. */
export function vectorBars(slug: string, count = 10): number[] {
  const h = hashString(slug);
  return Array.from({ length: count }, (_, i) => Math.round((0.2 + hash01(h + i * 7) * 0.8) * 100) / 100);
}

/** 0.00–1.00 with two decimals. */
export const fmtSim = (v: number) => v.toFixed(2);
