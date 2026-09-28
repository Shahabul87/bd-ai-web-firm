import type { CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';

export interface EndLink {
  href: string;
  title: string;
  /** e.g. "Guide" — shown above the title. */
  type?: string;
}

export interface RelatedLink extends EndLink {
  /** Word-overlap relevance in [0, 1]. */
  score: number;
  /** The score as shown (localised digits), e.g. "0.62". */
  scoreLabel: string;
}

interface ArticleEndProps {
  id: string;
  prev?: EndLink;
  next?: EndLink;
  related: RelatedLink[];
  labels: {
    nav: string;
    prev: string;
    next: string;
    related: string;
    relatedNote: string;
  };
  /** lang of the linked titles when it differs from the page. */
  contentLang?: string;
}

/**
 * The end of an article: previous/next in the same collection, then related
 * reading ranked by the same word-overlap score the /resources demo uses.
 */
export default function ArticleEnd({ id, prev, next, related, labels, contentLang }: ArticleEndProps) {
  return (
    <div className="rs-a-end">
      {prev || next ? (
        <nav className="rs-pn" aria-label={labels.nav}>
          {prev ? (
            <Link className="rs-pn-a rs-pn-prev" href={prev.href} rel="prev">
              <span className="pg-cap">
                <span aria-hidden="true">← </span>
                {labels.prev}
              </span>
              <b lang={contentLang}>{prev.title}</b>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="rs-pn-a rs-pn-next" href={next.href} rel="next">
              <span className="pg-cap">
                {labels.next}
                <span aria-hidden="true"> →</span>
              </span>
              <b lang={contentLang}>{next.title}</b>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {related.length > 0 ? (
        <section className="rs-rel" aria-labelledby={`${id}-rel-h`}>
          <h2 id={`${id}-rel-h`} className="rs-rel-h">
            {labels.related}
          </h2>
          <p className="rs-rel-note pg-cap">{labels.relatedNote}</p>
          <ol>
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="rs-rel-a">
                  {r.type ? <span className="rs-rel-type pg-cap">{r.type}</span> : null}
                  <b lang={contentLang}>{r.title}</b>
                  <span className="rs-bar" aria-hidden="true">
                    <i style={{ '--s': r.score } as CSSProperties} />
                  </span>
                  <span className="rs-rel-s pg-num">{r.scoreLabel}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
