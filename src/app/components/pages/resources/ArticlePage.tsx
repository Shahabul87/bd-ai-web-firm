import { getTranslations } from 'next-intl/server';
import PageCTA from '@/app/components/pages/PageCTA';
import ArticleShell, { type ArticleMetaItem } from './ArticleShell';
import ArticleEnd from './ArticleEnd';
import { formatters, getLibrary, tagLabeler } from './library';
import { related } from './retrieval';
import type { LibraryItem, LibraryType } from './retrieval';

interface ArticlePageProps {
  /** Which `Resources.<collection>` copy to use. */
  collection: 'blog' | 'guides';
  item: LibraryItem;
  /** The item's collection, newest first (for previous / next). */
  siblings: LibraryItem[];
  /** Velite MDX of the item. */
  code: string;
  locale: string;
}

/** A blog post or guide in the reading room: ArticleShell + previous/next + related + CTA. */
export default async function ArticlePage({ collection, item, siblings, code, locale }: ArticlePageProps) {
  const t = await getTranslations('Resources');
  const f = formatters(locale);
  const contentLang = f.bn ? 'en' : undefined;
  const tagLabel = tagLabeler(t.raw('tags') as Record<string, string>);
  const typeLabel = (type: LibraryType) =>
    type === 'blog' ? t('typeLabels.blog') : type === 'guide' ? t('typeLabels.guide') : t('typeLabels.caseStudy');

  const meta: ArticleMetaItem[] = [
    ...(item.author ? [{ label: t('article.by', { author: item.author }) }] : []),
    { label: f.date(item.date), dateTime: item.date },
    ...(item.readTime ? [{ label: t('article.readTime', { n: f.num(item.readTime) }) }] : []),
  ];

  // Siblings are newest first: "previous" is the older piece, "next" the newer.
  const at = siblings.findIndex((s) => s.key === item.key);
  const older = at >= 0 ? siblings[at + 1] : undefined;
  const newer = at > 0 ? siblings[at - 1] : undefined;

  const library = getLibrary();
  const byKey = new Map(library.map((it) => [it.key, it]));
  const rel = related(item, library, 3).flatMap((r) => {
    const it = byKey.get(r.key);
    return it
      ? [{ href: it.href, title: it.title, type: typeLabel(it.type), score: r.score, scoreLabel: f.num(r.score.toFixed(2)) }]
      : [];
  });

  const id = collection === 'blog' ? 'rs-post' : 'rs-guide';
  const h2Count = (code.match(/\w+\.h2,\{id:/g) ?? []).length;

  return (
    <div className={`attn pg-resources rs-read rs-read-${collection}`}>
      <ArticleShell
        id={id}
        kicker={t(`${collection}.detail.kicker`)}
        back={{ href: `/resources/${collection}`, label: t(`${collection}.detail.back`) }}
        title={item.title}
        dek={item.excerpt}
        meta={meta}
        tags={item.tags.map(tagLabel)}
        code={code}
        contentLang={contentLang}
        labels={{ toc: t('article.toc'), tags: t('article.tags') }}
        numbers={Array.from({ length: h2Count }, (_, i) => f.ordinal(i))}
        after={
          <ArticleEnd
            id={id}
            prev={older ? { href: older.href, title: older.title } : undefined}
            next={newer ? { href: newer.href, title: newer.title } : undefined}
            related={rel}
            labels={{
              nav: t('article.nav'),
              prev: t('article.prev'),
              next: t('article.next'),
              related: t('article.related'),
              relatedNote: t('article.relatedNote'),
            }}
            contentLang={contentLang}
          />
        }
      />

      <PageCTA
        id={`${id}-cta-h`}
        title={t(`${collection}.detail.cta.title`)}
        lede={t(`${collection}.detail.cta.lede`)}
        primaryLabel={t(`${collection}.detail.cta.primaryLabel`)}
        secondaryLabel={t(`${collection}.detail.cta.secondaryLabel`)}
        secondaryHref={`/resources/${collection}`}
      />
    </div>
  );
}
