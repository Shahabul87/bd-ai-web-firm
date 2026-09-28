import type { CSSProperties } from 'react';
import { vectorBars } from './geometry';

/**
 * A product's tiny "embedding": ten bars whose heights are a fixed hash of its
 * slug. Static by default; the bars breathe while its index row is hovered or
 * focused (CSS only, off under reduced motion).
 */
export default function VectorGlyph({ slug }: { slug: string }) {
  const bars = vectorBars(slug);
  return (
    <svg className="wk-vec" viewBox="0 0 60 24" aria-hidden="true">
      <path className="wk-vec-base" d="M0 23.5H60" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 6 + 0.6}
          y={23 - h * 22}
          width="3.6"
          height={h * 22}
          rx="0.8"
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </svg>
  );
}
