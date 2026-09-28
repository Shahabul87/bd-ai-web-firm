import { Link } from '@/i18n/navigation';

export interface IndexRowData {
  key: string;
  href: string;
  /** Localised ordinal, e.g. "01". */
  n: string;
  title: string;
  excerpt: string;
  typeLabel?: string;
  dateLabel: string;
  dateTime: string;
  readLabel?: string;
  /** Tag ids (for filtering) and their labels. */
  tags: { id: string; label: string }[];
}

interface IndexRowProps {
  row: IndexRowData;
  /** Heading level of the title within the page outline. */
  as?: 'h2' | 'h3';
  contentLang?: string;
  tagsLabel: string;
}

/**
 * One entry of an editorial index: ordinal, a large serif title (the whole
 * row is the link's hit area), the standfirst, and a meta column. A gold rule
 * draws across the top on hover and keyboard focus.
 */
export default function IndexRow({ row, as: H = 'h3', contentLang, tagsLabel }: IndexRowProps) {
  return (
    <article className="rs-row">
      <span className="rs-row-n pg-cap" aria-hidden="true">
        {row.n}
      </span>
      <div className="rs-row-main">
        <H className="rs-row-t" lang={contentLang}>
          <Link href={row.href} className="rs-row-a">
            {row.title}
          </Link>
        </H>
        <p className="rs-row-x" lang={contentLang}>
          {row.excerpt}
        </p>
      </div>
      <div className="rs-row-meta">
        <p className="rs-row-line pg-cap">
          {row.typeLabel ? <span className="rs-row-type">{row.typeLabel}</span> : null}
          <time dateTime={row.dateTime}>{row.dateLabel}</time>
          {row.readLabel ? <span>{row.readLabel}</span> : null}
        </p>
        {row.tags.length > 0 ? (
          <ul className="rs-tags" aria-label={tagsLabel}>
            {row.tags.map((t) => (
              <li key={t.id}>{t.label}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className="rs-row-go" aria-hidden="true">
        →
      </span>
    </article>
  );
}
