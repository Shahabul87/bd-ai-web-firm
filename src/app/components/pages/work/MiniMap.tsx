import type { CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';
import { toBengaliDigits } from '@/app/lib/numerals';
import MapField from './MapField';
import { fmtSim, nearest, placeOf, type ClusterKey } from './geometry';

interface MiniMapProps {
  products: { slug: string; title: string }[];
  current: string;
  concepts: Record<ClusterKey, string[]>;
  clusters: Record<ClusterKey, string>;
  caption: string;
  note: string;
  navLabel: string;
  bn: boolean;
}

/**
 * The product page's signature: the same embedding map as /products, drawn
 * static on the server with this product as the query and gold lines to its
 * three nearest neighbours. Every other point is a link to that product.
 */
export default function MiniMap({ products, current, concepts, clusters, caption, note, navLabel, bn }: MiniMapProps) {
  const places = products.map((p, i) => placeOf(p.slug, i));
  const self = products.findIndex((p) => p.slug === current);
  if (self < 0) return null;
  const here = places[self];
  const nb = nearest(
    here,
    places,
    products.map((_, i) => i).filter((i) => i !== self),
    3,
  );
  const simOf = new Map(nb.map((n) => [n.index, n.sim]));
  const fmt = (v: number) => (bn ? toBengaliDigits(fmtSim(v)) : fmtSim(v));

  return (
    <figure className="wk-mini">
      <div className="wk-map wk-map-mini">
        <MapField
          idp="wkd"
          concepts={concepts}
          clusters={clusters}
          focus={here.cluster}
          lines={
            <g className="wk-lines">
              {nb.map((n, k) => {
                const p = places[n.index];
                return (
                  <line
                    key={n.index}
                    className="wk-line"
                    x1={here.x}
                    y1={here.y}
                    x2={p.x}
                    y2={p.y}
                    strokeWidth={(0.8 + 2.2 * n.sim).toFixed(2)}
                    style={{ '--o': (0.22 + 0.78 * n.sim ** 1.4).toFixed(2), '--k': k } as CSSProperties}
                  />
                );
              })}
            </g>
          }
        />
        <div className="wk-scores" aria-hidden="true">
          {nb.map((n, k) => {
            const p = places[n.index];
            return (
              <span
                key={n.index}
                className="wk-score"
                style={
                  {
                    '--sx': (here.x + (p.x - here.x) * 0.56).toFixed(2),
                    '--sy': (here.y + (p.y - here.y) * 0.56).toFixed(2),
                    '--k': k,
                  } as CSSProperties
                }
              >
                {fmt(n.sim)}
              </span>
            );
          })}
        </div>
        <div className="wk-q wk-q-here" aria-hidden="true" style={{ '--qx': here.x, '--qy': here.y } as CSSProperties}>
          <i />
        </div>
        <nav className="wk-points" aria-label={navLabel}>
          {products.map((p, i) => {
            const place = places[i];
            const style = { '--x': place.x, '--y': place.y, '--i': i } as CSSProperties;
            const inner = (
              <>
                <span className="wk-dot" aria-hidden="true" />
                <span className="wk-lbl">{p.title}</span>
              </>
            );
            return (
              <div key={p.slug} className="wk-pt" data-side={place.side} style={style}>
                {i === self ? (
                  <span className="wk-p" aria-current="page" data-here="">
                    {inner}
                  </span>
                ) : (
                  <Link className="wk-p" href={`/products/${p.slug}`} data-near={simOf.has(i) ? '' : undefined}>
                    {inner}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <figcaption className="wk-mini-cap pg-cap">
        <span>{caption}</span> <span className="wk-mini-note">{note}</span>
      </figcaption>
    </figure>
  );
}
