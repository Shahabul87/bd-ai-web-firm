type Segmenter = new (
  locale?: string,
  options?: { granularity: 'grapheme' },
) => { segment(s: string): Iterable<{ segment: string }> };

/** Split into user-perceived characters so Bengali conjuncts never tear mid-type. */
export function graphemes(text: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter;
  if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  return Array.from(text);
}
