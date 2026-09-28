import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import RetrievalDemo from '@/app/components/pages/resources/RetrievalDemo';
import type { DemoLabels, DemoQuery, DemoRanking } from '@/app/components/pages/resources/RetrievalDemo';
import EditorialList from '@/app/components/pages/resources/EditorialList';
import type { IndexRowData } from '@/app/components/pages/resources/IndexRow';
import { formatters, getLibrary, tagLabeler } from '@/app/components/pages/resources/library';
import { rank, score, titleHits } from '@/app/components/pages/resources/retrieval';
import type { LibraryItem, LibraryType } from '@/app/components/pages/resources/retrieval';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resources' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/resources', locale),
      type: 'website',
    },
    alternates: localeAlternates('/resources', locale),
  };
}

const DEMO_LABELS = [
  'label',
  'example',
  'chipsLabel',
  'queryLabel',
  'termsLabel',
  'resultsLabel',
  'ranking',
  'pause',
  'play',
  'note',
  'topMatch',
] as const;

const SHELVES: { key: 'blog' | 'guides' | 'caseStudies'; type: LibraryType; href: string; limit: number }[] = [
  { key: 'blog', type: 'blog', href: '/resources/blog', limit: 3 },
  { key: 'guides', type: 'guide', href: '/resources/guides', limit: 3 },
  { key: 'caseStudies', type: 'case-study', href: '/resources/case-studies', limit: 3 },
];

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * Resources — "The reading room". The hero is a retrieval demo over the real
 * library: a question is typed, its key terms pulled out, and every post,
 * guide and case study re-ranks by honest word overlap. Below it, the three
 * shelves as editorial indexes.
 */
export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources');
  const f = formatters(locale);
  const contentLang = f.bn ? 'en' : undefined;
  const tagLabel = tagLabeler(t.raw('tags') as Record<string, string>);

  const library = getLibrary();
  const typeLabel = (type: LibraryType) =>
    type === 'blog' ? t('typeLabels.blog') : type === 'guide' ? t('typeLabels.guide') : t('typeLabels.caseStudy');

  const queries = t.raw('retrieval.queries') as DemoQuery[];
  const fmtScore = (s: number) => f.num(s.toFixed(2));
  const rankings: DemoRanking[] = queries.map((q) => {
    const ranked = rank(q.terms, library);
    return {
      order: ranked.map((r) => r.key),
      scores: Object.fromEntries(ranked.map((r) => [r.key, { value: r.score, label: fmtScore(r.score) }])),
      hits: Object.fromEntries(library.map((it) => [it.key, score(q.terms, it) > 0 ? titleHits(q.terms, it.title) : []])),
    };
  });
  const demoLabels = Object.fromEntries(DEMO_LABELS.map((k) => [k, t(`retrieval.${k}`)])) as unknown as DemoLabels;

  const toRow = (item: LibraryItem, i: number): IndexRowData => ({
    key: item.key,
    href: item.href,
    n: f.ordinal(i),
    title: item.title,
    excerpt: item.excerpt,
    dateLabel: f.date(item.date),
    dateTime: item.date,
    readLabel: item.readTime ? t('article.readTime', { n: f.num(item.readTime) }) : undefined,
    tags: item.tags.map((id) => ({ id, label: tagLabel(id) })),
  });

  return (
    <PageLayout>
      <div className="attn pg-resources rs-hub">
        <section className="pg-hero rs-hero" aria-labelledby="rs-hero-h">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
            <h1 className="pg-h1 pg-enter" id="rs-hero-h" style={d(1)}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <div className="rs-hero-grid">
              <div className="rs-hero-copy pg-enter" style={d(2)}>
                <p className="pg-lede">{t('hero.lede')}</p>
                <div className="pg-actions">
                  <Link className="attn-btn attn-btn-primary" href="/resources/blog">
                    {t('hero.primaryCta')}
                  </Link>
                  <Link className="attn-btn attn-btn-secondary" href="/contact">
                    {t('hero.secondaryCta')}
                  </Link>
                </div>
              </div>
              <div className="pg-enter" style={d(3)}>
                <RetrievalDemo
                  queries={queries}
                  items={library.map((it) => ({ key: it.key, href: it.href, title: it.title, typeLabel: typeLabel(it.type) }))}
                  rankings={rankings}
                  labels={demoLabels}
                  contentLang={contentLang}
                />
              </div>
            </div>
          </div>
        </section>

        {SHELVES.map((shelf, si) => {
          const items = library.filter((it) => it.type === shelf.type).slice(0, shelf.limit);
          if (items.length === 0) return null;
          const hId = `rs-shelf-${shelf.key}-h`;
          return (
            <section key={shelf.key} className="attn-sec rs-shelf" id={shelf.key} aria-labelledby={hId}>
              <div className="attn-wrap rs-shelf-grid">
                <InView once className="rs-shelf-head">
                  <span className="rs-shelf-n pg-rise" aria-hidden="true">
                    {f.ordinal(si)}
                  </span>
                  <h2 className="rs-shelf-h pg-rise" id={hId} style={d(1)}>
                    {t(`shelves.${shelf.key}.title`)}
                  </h2>
                  <p className="rs-shelf-note pg-rise" style={d(2)}>
                    {t(`shelves.${shelf.key}.note`)}
                  </p>
                  <Link className="rs-more pg-rise" style={d(3)} href={shelf.href}>
                    {t(`shelves.${shelf.key}.link`)}
                    <span aria-hidden="true"> →</span>
                  </Link>
                </InView>
                <EditorialList
                  rows={items.map(toRow)}
                  contentLang={contentLang}
                  tagsLabel={t('shelves.tagsLabel')}
                />
              </div>
            </section>
          );
        })}

        <PageCTA
          id="rs-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primaryLabel')}
          secondaryLabel={t('cta.secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
