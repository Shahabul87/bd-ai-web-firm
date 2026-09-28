import type { CSSProperties } from 'react';
import InView from '@/app/components/home/InView';
import { toBengaliDigits } from '@/app/lib/numerals';

export const METHOD_KEYS = ['public', 'measured', 'maintained'] as const;
export type MethodKey = (typeof METHOD_KEYS)[number];

interface WorkMethodProps {
  title: string;
  items: Record<MethodKey, { title: string; body: string }>;
  bn: boolean;
}

/** Small line drawings, drawn on as the band scrolls in (pathLength = 1). */
function Glyph({ k }: { k: MethodKey }) {
  if (k === 'public') {
    // A live signal: a dot with rings opening outward.
    return (
      <svg className="wk-mg" viewBox="0 0 64 40" aria-hidden="true">
        <circle className="wk-mg-fill mi" cx="14" cy="20" r="4" />
        <path className="wk-mg-s mi" pathLength={1} d="M24 11a13 13 0 0 1 0 18" />
        <path className="wk-mg-s mi" pathLength={1} d="M31 5a22 22 0 0 1 0 30" style={{ '--i': 1 } as CSSProperties} />
        <path className="wk-mg-s" pathLength={1} d="M40 20H62" style={{ '--i': 2 } as CSSProperties} />
      </svg>
    );
  }
  if (k === 'measured') {
    // A score line climbing past the agreed bar.
    return (
      <svg className="wk-mg" viewBox="0 0 64 40" aria-hidden="true">
        <path className="wk-mg-s am" pathLength={1} d="M2 14H62" />
        <path className="wk-mg-s mi" pathLength={1} d="M2 34L14 30L24 31L34 22L44 18L54 10L62 8" style={{ '--i': 1 } as CSSProperties} />
        <circle className="wk-mg-fill mi" cx="62" cy="8" r="2.6" />
      </svg>
    );
  }
  // Looked after: a loop that keeps coming round.
  return (
    <svg className="wk-mg" viewBox="0 0 64 40" aria-hidden="true">
      <path className="wk-mg-s" pathLength={1} d="M20 8A12 12 0 1 0 32 20" />
      <path className="wk-mg-s am" pathLength={1} d="M32 20A12 12 0 1 1 44 32" style={{ '--i': 1 } as CSSProperties} />
      <path className="wk-mg-s am" pathLength={1} d="M40 36l4-4-4-4" style={{ '--i': 2 } as CSSProperties} />
    </svg>
  );
}

/** "Built the way we'd build yours": three short points, no numbers. */
export default function WorkMethod({ title, items, bn }: WorkMethodProps) {
  return (
    <section className="attn-sec wk-method" aria-labelledby="wk-method-h">
      <div className="attn-wrap">
        <InView once>
          <h2 id="wk-method-h" className="attn-sec-h pg-rise">
            {title}
          </h2>
          <ol className="wk-points-list">
            {METHOD_KEYS.map((k, i) => (
              <li key={k} className="wk-mp pg-rise" style={{ '--d': i + 1 } as CSSProperties}>
                <span className="wk-mp-n pg-cap">{(bn ? toBengaliDigits : String)(`0${i + 1}`)}</span>
                <Glyph k={k} />
                <h3>{items[k].title}</h3>
                <p>{items[k].body}</p>
              </li>
            ))}
          </ol>
        </InView>
      </div>
    </section>
  );
}
