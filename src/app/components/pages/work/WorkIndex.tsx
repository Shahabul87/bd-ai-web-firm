import type { CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';
import InView from '@/app/components/home/InView';
import { toBengaliDigits } from '@/app/lib/numerals';
import VectorGlyph from './VectorGlyph';

export interface IndexProduct {
  slug: string;
  title: string;
  tagline: string;
  platforms: string[];
  stack: string[];
  live: { href: string; kind: 'site' | 'store' } | null;
}

export interface WorkIndexCopy {
  title: string;
  note: string;
  stack: string;
  /** "+{count} more" */
  more: string;
  live: string;
  store: string;
  details: string;
  /** Accessible names; "{title}" is replaced. */
  liveAria: string;
  storeAria: string;
  detailsAria: string;
}

interface WorkIndexProps {
  products: IndexProduct[];
  platformLabels: Record<string, string>;
  copy: WorkIndexCopy;
  bn: boolean;
}

const STACK_SHOWN = 3;
const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * The product index: an editorial list, one large row per product. Server
 * rendered; the hero's platform filter hides rows through a data attribute on
 * the page root (see page-work.css), so no-JS visitors see every row.
 */
export default function WorkIndex({ products, platformLabels, copy, bn }: WorkIndexProps) {
  const digits = (v: number) => (bn ? toBengaliDigits(v) : String(v));
  return (
    <section className="attn-sec wk-index" id="wk-index" aria-labelledby="wk-index-h">
      <div className="attn-wrap">
        <InView once className="wk-index-head">
          <h2 id="wk-index-h" className="attn-sec-h pg-rise">
            {copy.title}
          </h2>
          <p className="wk-index-note pg-rise" style={d(1)}>
            {copy.note}
          </p>
        </InView>
        <ol className="wk-rows">
          {products.map((p, i) => {
            const n = digits(i + 1).padStart(2, digits(0));
            const extra = p.stack.length - STACK_SHOWN;
            const fill = (tpl: string) => tpl.replace('{title}', p.title);
            return (
              <li key={p.slug} className="wk-row" data-p={p.platforms.join(' ')}>
                <InView once className="wk-row-in">
                  <span className="wk-n pg-rise" aria-hidden="true">
                    {n}
                  </span>
                  <div className="wk-row-main pg-rise" style={d(1)}>
                    <h3 className="wk-row-t">
                      <Link href={`/products/${p.slug}`}>{p.title}</Link>
                    </h3>
                    <p className="wk-row-d">{p.tagline}</p>
                  </div>
                  <div className="wk-row-meta pg-rise" style={d(2)}>
                    <ul className="wk-tags">
                      {p.platforms.map((pl) => (
                        <li key={pl}>{platformLabels[pl] ?? pl}</li>
                      ))}
                    </ul>
                    <p className="wk-stack">
                      <span className="wk-stack-l">{copy.stack}</span>{' '}
                      {p.stack.slice(0, STACK_SHOWN).join(' · ')}
                      {extra > 0 ? <span className="wk-stack-more"> {copy.more.replace('{count}', digits(extra))}</span> : null}
                    </p>
                  </div>
                  <div className="wk-row-side pg-rise" style={d(3)}>
                    <VectorGlyph slug={p.slug} />
                    <div className="wk-row-links">
                      {p.live ? (
                        <a
                          href={p.live.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={fill(p.live.kind === 'store' ? copy.storeAria : copy.liveAria)}
                        >
                          {p.live.kind === 'store' ? copy.store : copy.live}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : null}
                      <Link href={`/products/${p.slug}`} aria-label={fill(copy.detailsAria)}>
                        {copy.details}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    </div>
                  </div>
                </InView>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
