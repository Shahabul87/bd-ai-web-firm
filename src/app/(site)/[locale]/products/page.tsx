import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import { products } from '#content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import WorkMap, { type MapProduct, type WorkMapCopy } from '@/app/components/pages/work/WorkMap';
import WorkIndex, { type WorkIndexCopy } from '@/app/components/pages/work/WorkIndex';
import WorkMethod, { METHOD_KEYS } from '@/app/components/pages/work/WorkMethod';
import type { ClusterKey } from '@/app/components/pages/work/geometry';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.products' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/products', locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates('/products', locale),
  };
}

const PLATFORM_ORDER = ['web', 'android', 'ios', 'desktop'] as const;
const d = (n: number) => ({ '--d': n }) as CSSProperties;

type Live = MapProduct['live'];
const liveOf = (p: { demoUrl?: string; storeUrl?: string }): Live =>
  p.demoUrl ? { href: p.demoUrl, kind: 'site' } : p.storeUrl ? { href: p.storeUrl, kind: 'store' } : null;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Products');
  const bn = locale === 'bn';

  const platformLabels = t.raw('platformLabels') as Record<string, string>;
  const filters = PLATFORM_ORDER.filter((key) => products.some((p) => p.platforms.includes(key))).map((key) => ({
    key,
    label: platformLabels[key] ?? key,
  }));

  const mapProducts: MapProduct[] = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    platforms: [...p.platforms],
    live: liveOf(p),
  }));

  const mapCopy: WorkMapCopy = {
    mapLabel: t('map.label'),
    note: t('map.note'),
    hintFine: t('map.hint.fine'),
    hintCoarse: t('map.hint.coarse'),
    filterLabel: t('map.filterLabel'),
    all: t('map.all'),
    showing: t.raw('map.showing') as string,
    query: t('map.query'),
    nearest: t('map.nearest'),
    close: t('map.card.close'),
    closest: t('map.card.closest'),
    openSite: t('map.card.openSite'),
    openStore: t('map.card.openStore'),
    readMore: t('map.card.readMore'),
  };

  const indexCopy: WorkIndexCopy = {
    title: t('index.title'),
    note: t('index.note'),
    stack: t('index.stack'),
    more: t.raw('index.more') as string,
    live: t('index.live'),
    store: t('index.store'),
    details: t('index.details'),
    liveAria: t.raw('index.liveAria') as string,
    storeAria: t.raw('index.storeAria') as string,
    detailsAria: t.raw('index.detailsAria') as string,
  };

  const methodItems = Object.fromEntries(
    METHOD_KEYS.map((k) => [k, { title: t(`method.${k}.title`), body: t(`method.${k}.body`) }]),
  ) as Record<(typeof METHOD_KEYS)[number], { title: string; body: string }>;

  return (
    <PageLayout>
      <div className="attn pg-work">
        <section className="pg-hero wk-hero" aria-labelledby="wk-h1">
          <div className="attn-wrap">
            <div className="wk-hero-top">
              <div>
                <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
                <h1 id="wk-h1" className="pg-h1 pg-enter" style={d(1)}>
                  {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
                </h1>
              </div>
              <div className="wk-hero-side">
                <p className="pg-lede pg-enter" style={d(2)}>
                  {t('hero.lede')}
                </p>
                <div className="pg-actions pg-enter" style={d(3)}>
                  <Link className="attn-btn attn-btn-primary" href="/contact">
                    {t('hero.primary')}
                  </Link>
                  <a className="attn-btn attn-btn-secondary" href="#wk-index">
                    {t('hero.secondary')}
                  </a>
                </div>
              </div>
            </div>
            <div className="wk-stage">
              <WorkMap
                products={mapProducts}
                filters={filters}
                platformLabels={platformLabels}
                concepts={t.raw('map.concepts') as Record<ClusterKey, string[]>}
                clusters={t.raw('map.clusters') as Record<ClusterKey, string>}
                copy={mapCopy}
                bn={bn}
              />
            </div>
          </div>
        </section>

        <WorkIndex
          products={products.map((p) => ({
            slug: p.slug,
            title: p.title,
            tagline: p.tagline,
            platforms: [...p.platforms],
            stack: [...p.techStack],
            live: liveOf(p),
          }))}
          platformLabels={platformLabels}
          copy={indexCopy}
          bn={bn}
        />

        <WorkMethod title={t('method.title')} items={methodItems} bn={bn} />

        <PageCTA
          id="wk-cta"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primary')}
          primaryHref="/contact"
          secondaryLabel={t('cta.secondary')}
        />
      </div>
    </PageLayout>
  );
}
