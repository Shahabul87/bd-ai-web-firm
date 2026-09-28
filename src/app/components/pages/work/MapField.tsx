import type { CSSProperties, ReactNode } from 'react';
import {
  CLUSTERS,
  CLUSTER_KEYS,
  CONCEPT_POINTS,
  SCATTER,
  contourPath,
  driftOf,
  type ClusterKey,
} from './geometry';

interface MapFieldProps {
  /** Prefix for SVG ids, unique on the page. */
  idp: string;
  concepts: Record<ClusterKey, string[]>;
  clusters: Record<ClusterKey, string>;
  /** Only this cluster's concept words are labelled (the mini map on a product page). */
  focus?: ClusterKey;
  /** Extra SVG drawn over the field in map units (the query lines). */
  lines?: ReactNode;
}

const RINGS = [1, 0.7, 0.42] as const;

/** Zero-length round-capped strokes: dots that stay round however the SVG stretches. */
const dots = (big: boolean) =>
  SCATTER.filter((p) => p.big === big)
    .map((p) => `M${p.x} ${p.y}h.01`)
    .join('');

/**
 * The static latent space both maps sit on: a faint grid, a density halo and
 * contour rings per cluster, background points, and the drifting concept
 * words. No state, no effects: renders the same on the server and the client.
 */
export default function MapField({ idp, concepts, clusters, focus, lines }: MapFieldProps) {
  let gi = 0;
  return (
    <>
      <svg className="wk-field" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id={`${idp}-halo`}>
            <stop offset="0" stopColor="#F2B33D" stopOpacity="0.1" />
            <stop offset="0.6" stopColor="#F2B33D" stopOpacity="0.035" />
            <stop offset="1" stopColor="#F2B33D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="wk-grid"
          d={Array.from({ length: 9 }, (_, i) => `M${(i + 1) * 10} 0V100M0 ${(i + 1) * 10}H100`).join('')}
        />
        {CLUSTER_KEYS.map((key) => {
          const c = CLUSTERS[key];
          return (
            <g key={key} className="wk-halo" data-k={key} data-focus={focus === key ? '' : undefined}>
              <ellipse cx={c.x} cy={c.y} rx={c.rx * 1.15} ry={c.ry * 1.15} fill={`url(#${idp}-halo)`} />
              {RINGS.map((s) => (
                <path key={s} className="wk-ring" d={contourPath(c, s)} />
              ))}
            </g>
          );
        })}
        <path className="wk-scatter" d={dots(false)} />
        <path className="wk-scatter wk-scatter-b" d={dots(true)} />
        {lines}
      </svg>
      <div className="wk-concepts" aria-hidden="true">
        {CLUSTER_KEYS.flatMap((key) =>
          CONCEPT_POINTS[key].map((p, i) => {
            const idx = gi;
            gi += 1;
            const d = driftOf(idx);
            const word = concepts[key]?.[i];
            if (!word) return null;
            const style = {
              '--x': p.x,
              '--y': p.y,
              '--dx': `${d.dx}px`,
              '--dy': `${d.dy}px`,
              '--dur': `${d.dur}s`,
              '--del': `${d.delay}s`,
            } as CSSProperties;
            return (
              <span
                key={`${key}-${i}`}
                className="wk-c"
                data-k={key}
                data-ci={idx}
                data-muted={focus && focus !== key ? '' : undefined}
                style={style}
              >
                <i />
                <b>{word}</b>
              </span>
            );
          }),
        )}
        {CLUSTER_KEYS.map((key) => {
          const cap = CLUSTERS[key].cap;
          return (
            <span
              key={key}
              className="wk-cap"
              data-align={cap.align}
              data-k={key}
              style={{ '--x': cap.x, '--y': cap.y } as CSSProperties}
            >
              {clusters[key]}
            </span>
          );
        })}
      </div>
    </>
  );
}
