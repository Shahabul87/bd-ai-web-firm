import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageCTA from '@/app/components/pages/PageCTA';
import ArchiveIndex, { type ArchiveTag } from './ArchiveIndex';
import type { IndexRowData } from './IndexRow';
import { formatters, tagLabeler } from './library';
import type { LibraryItem } from './retrieval';

interface CollectionPageProps {
  /** Which `Resources.<collection>` copy to use. */
  collection: 'blog' | 'guides';
  items: LibraryItem[];
  locale: string;
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/** The blog and guides index pages: a hero, then the filterable editorial index. */
export default async function CollectionPage({ collection, items, locale }: CollectionPageProps) {
  const t = await getTranslations('Resources');
  const f = formatters(locale);
  const contentLang = f.bn ? 'en' : undefined;
  const tagLabel = tagLabeler(t.raw('tags') as Record<string, string>);
  const c = (key: string) => t(`${collection}.${key}`);

  const rows: IndexRowData[] = items.map((item, i) => ({
    key: item.key,
    href: item.href,
    n: f.ordinal(i),
    title: item.title,
    excerpt: item.excerpt,
    dateLabel: f.date(item.date),
    dateTime: item.date,
    readLabel: item.readTime ? t('article.readTime', { n: f.num(item.readTime) }) : undefined,
    tags: item.tags.map((id) => ({ id, label: tagLabel(id) })),
  }));

  const counts = new Map<string, number>();
  for (const item of items) for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const tags: ArchiveTag[] = Array.from(counts, ([id, count]) => ({ id, label: tagLabel(id), count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );

  const hId = `rs-${collection}-h`;

  return (
    <div className={`attn pg-resources rs-coll rs-coll-${collection}`}>
      <section className="pg-hero rs-c-hero" aria-labelledby={hId}>
        <div className="attn-wrap">
          <Link className="rs-back pg-enter" href="/resources">
            <span aria-hidden="true">← </span>
            {c('back')}
          </Link>
          <p className="pg-kicker pg-enter">{c('hero.kicker')}</p>
          <h1 className="pg-h1 rs-c-h1 pg-enter" id={hId} style={d(1)}>
            {t.rich(`${collection}.hero.title`, { em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <div className="rs-c-sub pg-enter" style={d(2)}>
            <p className="pg-lede">{c('hero.lede')}</p>
            <p className="rs-c-count pg-cap">{t(`${collection}.count`, { n: f.num(items.length) })}</p>
          </div>
        </div>
      </section>

      <div className="rs-c-list">
        <div className="attn-wrap">
          {rows.length === 0 ? (
            <p className="rs-empty">{c('empty')}</p>
          ) : (
            <ArchiveIndex
              rows={rows}
              tags={tags}
              labels={{
                filter: c('filter'),
                all: c('all'),
                showing: t.raw(`${collection}.showing`) as string,
                empty: c('noMatch'),
                tags: t('article.tags'),
              }}
              bengaliDigits={f.bn}
              contentLang={contentLang}
            />
          )}
        </div>
      </div>

      <PageCTA
        id={`rs-${collection}-cta-h`}
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        secondaryLabel={t('cta.secondaryLabel')}
      />
    </div>
  );
}
