/**
 * Pure geometry for the attention arcs. No DOM access here, so every rule
 * (which arcs are drawn, how they bend, where a label sits) is unit-tested.
 */

export interface TokenBox {
  /** Horizontal centre of the word. */
  cx: number;
  left: number;
  /** Approximate top of the capitals and the baseline, from the font size. */
  capTop: number;
  base: number;
  /** Top of the word's line box; used to group words into lines. */
  rowTop: number;
}

export interface PlacedBox extends TokenBox {
  line: number;
}

export interface StageMetrics {
  fontSize: number;
  padTop: number;
  padBottom: number;
}

export interface ArcGeometry {
  d: string;
  /** Apex of the curve, where a weight label goes. */
  mx: number;
  my: number;
  /** The arc joins words on different lines. */
  cross: boolean;
}

const f2 = (n: number): string => n.toFixed(2);

/** Cap-top and baseline as fractions of the font size (serif display face). */
export const CAP_TOP = 0.2;
export const BASELINE = 0.86;

export function boxFromOffsets(x: number, y: number, width: number, fontSize: number): TokenBox {
  return { cx: x + width / 2, left: x, capTop: y + fontSize * CAP_TOP, base: y + fontSize * BASELINE, rowTop: y };
}

/** Assign each box a line index; a new line starts when a word sits half an em lower. */
export function assignLines(boxes: TokenBox[], fontSize: number): { boxes: PlacedBox[]; lines: number } {
  const order = boxes.map((b, i) => ({ b, i })).sort((a, c) => a.b.rowTop - c.b.rowTop);
  const placed: PlacedBox[] = new Array(boxes.length);
  let line = -1;
  let last = -Infinity;
  for (const { b, i } of order) {
    if (b.rowTop - last > fontSize * 0.5) {
      line += 1;
      last = b.rowTop;
    }
    placed[i] = { ...b, line };
  }
  return { boxes: placed, lines: line + 1 };
}

/**
 * The curve between two words. Words on the first line (or a middle line) get
 * an arch above them; on the last line of a multi-line headline the arch hangs
 * below; words on different lines are joined by an S-curve through the gap.
 */
export function arcBetween(a: PlacedBox, b: PlacedBox, lines: number, m: StageMetrics): ArcGeometry {
  const k = m.fontSize * 0.07;
  if (a.line === b.line) {
    const mx = (a.cx + b.cx) / 2;
    const dx = Math.abs(b.cx - a.cx);
    if (a.line === lines - 1 && lines > 1) {
      const y = a.base + k;
      const h = Math.min(m.padBottom * 0.8, 8 + dx * 0.28);
      return { d: `M${f2(a.cx)} ${f2(y)}Q${f2(mx)} ${f2(y + 2 * h)} ${f2(b.cx)} ${f2(y)}`, mx, my: y + h, cross: false };
    }
    const room = a.line === 0 ? m.padTop * 0.86 : m.fontSize * 0.26;
    const y = a.capTop - k;
    const h = Math.min(room, 8 + dx * 0.3);
    return { d: `M${f2(a.cx)} ${f2(y)}Q${f2(mx)} ${f2(y - 2 * h)} ${f2(b.cx)} ${f2(y)}`, mx, my: y - h, cross: false };
  }
  const upper = a.line < b.line ? a : b;
  const lower = a.line < b.line ? b : a;
  const y1 = upper.base + k;
  const y2 = lower.capTop - k;
  const g = Math.max(6, y2 - y1);
  return {
    d: `M${f2(upper.cx)} ${f2(y1)}C${f2(upper.cx)} ${f2(y1 + g * 0.95)} ${f2(lower.cx)} ${f2(y2 - g * 0.95)} ${f2(lower.cx)} ${f2(y2)}`,
    mx: (upper.cx + lower.cx) / 2,
    my: (y1 + y2) / 2,
    cross: true,
  };
}

/** Attention is directional; the resting picture shows the mean of both directions. */
export function symmetricWeight(weights: number[][], i: number, j: number): number {
  return (weights[i][j] + weights[j][i]) / 2;
}

/** Pairs worth drawing at rest: every i<j whose mean weight clears the threshold. */
export function restingPairs(weights: number[][], threshold = 0.1): Array<{ i: number; j: number; w: number }> {
  const pairs: Array<{ i: number; j: number; w: number }> = [];
  for (let i = 0; i < weights.length; i++) {
    for (let j = i + 1; j < weights.length; j++) {
      const w = symmetricWeight(weights, i, j);
      if (w >= threshold) pairs.push({ i, j, w });
    }
  }
  return pairs;
}

/** Stroke width and opacity for a resting arc of mean weight `w`. */
export function restingStroke(w: number, cross: boolean): { width: number; opacity: number } {
  return { width: 0.7 + w * 5, opacity: Math.min(0.9, (cross ? 0.1 : 0.16) + w * 1.5) };
}

/** Opacity of a non-query word while another word is the query. */
export function dimmedOpacity(w: number): number {
  return 0.22 + Math.min(1, w * 1.9) * 0.78;
}
