import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { products } from '#content';
import { getProductBySlug } from '@/app/lib/content';
import { toBengaliDigits } from '@/app/lib/numerals';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import MdxContent from '@/app/components/mdx/MdxContent';
import MiniMap from '@/app/components/pages/work/MiniMap';
import { decodeEntities } from '@/app/components/pages/work/text';
import type { ClusterKey } from '@/app/components/pages/work/geometry';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.tagline,
    openGraph: {
      title: `${product.title} | CraftsAI`,
      description: product.tagline,
      ...localeOpenGraph(`/products/${product.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates(`/products/${product.slug}`, locale),
  };
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Products');
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const bn = locale === 'bn';
  const num = (n: number) => {
    const s = String(n).padStart(2, '0');
    return bn ? toBengaliDigits(s) : s;
  };

  const platformLabels = t.raw('detail.platformLabels') as Record<string, string>;
  const shortPlatformLabels = t.raw('platformLabels') as Record<string, string>;
  const platforms = product.platforms
    .map((p) => platformLabels[p] ?? p)
    .join(' + ');

  const downloads = product.downloads ?? [];

  return (
    <PageLayout>
      <div className="attn pg-work wk-detail">
        <section className="pg-hero wk-d-hero" aria-labelledby="wk-d-h1">
          <div className="attn-wrap wk-d-grid">
            <div className="wk-d-text">
              <Link className="wk-back pg-enter" href="/products">
                <span aria-hidden="true">← </span>
                {t('detail.hero.back')}
              </Link>
              <p className="pg-kicker pg-enter">{t('detail.hero.eyebrow', { platforms })}</p>
              <h1 id="wk-d-h1" className="pg-h1 wk-d-h1 pg-enter" style={d(1)}>
                {product.title}
              </h1>
              <p className="pg-lede pg-enter" style={d(2)}>
                {product.tagline}
              </p>
              <ul className="wk-tags wk-d-tags pg-enter" style={d(2)}>
                {product.platforms.map((p) => (
                  <li key={p}>{shortPlatformLabels[p] ?? p}</li>
                ))}
              </ul>
              <div className="pg-actions pg-enter" style={d(3)}>
                {product.demoUrl ? (
                  <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="attn-btn attn-btn-primary">
                    {t('detail.hero.viewDemo')}
                    <span aria-hidden="true">&nbsp;↗</span>
                  </a>
                ) : null}
                {product.storeUrl ? (
                  <a
                    href={product.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`attn-btn ${product.demoUrl ? 'attn-btn-secondary' : 'attn-btn-primary'}`}
                  >
                    {t('detail.hero.getOnPlayStore')}
                    <span aria-hidden="true">&nbsp;↗</span>
                  </a>
                ) : null}
                {downloads.length > 0 ? (
                  <a
                    href="#downloads"
                    className={`attn-btn ${product.demoUrl || product.storeUrl ? 'attn-btn-secondary' : 'attn-btn-primary'}`}
                  >
                    {t('detail.hero.downloadDesktop')}
                  </a>
                ) : null}
                <Link className="attn-btn attn-btn-secondary" href="/quote">
                  {t('detail.hero.requestCustomization')}
                </Link>
              </div>
            </div>
            <div className="wk-d-fig pg-enter" style={d(2)}>
              <MiniMap
                products={products.map((p) => ({ slug: p.slug, title: p.title }))}
                current={product.slug}
                concepts={t.raw('map.concepts') as Record<ClusterKey, string[]>}
                clusters={t.raw('map.clusters') as Record<ClusterKey, string>}
                caption={t('detail.map.caption', { title: product.title })}
                note={t('detail.map.note')}
                navLabel={t('detail.map.navLabel')}
                bn={bn}
              />
            </div>
          </div>
        </section>

        {downloads.length > 0 ? (
          <section id="downloads" className="attn-sec wk-d-sec wk-d-dl" aria-labelledby="wk-d-dl-h">
            <div className="attn-wrap">
              <InView once>
                <p className="pg-kicker pg-rise">{t('detail.downloads.eyebrow')}</p>
                <h2 id="wk-d-dl-h" className="attn-sec-h pg-rise" style={d(1)}>
                  {t('detail.downloads.title')}
                </h2>
                <ul className="wk-dl-list">
                  {downloads.map((dl, i) => (
                    <li key={dl.os} className="wk-dl pg-rise" style={d(i + 2)}>
                      <span className="wk-dl-os">{dl.os}</span>
                      <div className="wk-dl-main">
                        <h3>{dl.label}</h3>
                        {dl.note ? <p>{decodeEntities(dl.note)}</p> : null}
                      </div>
                      <span className="wk-dl-size pg-cap">{dl.size}</span>
                      <a href={dl.url} className="attn-btn attn-btn-primary attn-btn-sm">
                        {t('detail.downloads.download')}
                      </a>
                    </li>
                  ))}
                </ul>
              </InView>
            </div>
          </section>
        ) : null}

        <section className="attn-sec wk-d-sec" aria-labelledby="wk-d-ft-h">
          <div className="attn-wrap">
            <InView once>
              <p className="pg-kicker pg-rise">{t('detail.features.eyebrow')}</p>
              <h2 id="wk-d-ft-h" className="attn-sec-h pg-rise" style={d(1)}>
                {t('detail.features.title')}
              </h2>
            </InView>
            <ol className="wk-feats">
              {product.features.map((feature, i) => (
                <li key={feature.title}>
                  <InView once className="wk-feat">
                    <span className="wk-feat-n pg-cap pg-rise">
                      {num(i + 1)}
                      <span className="wk-feat-i" aria-hidden="true">
                        {feature.icon}
                      </span>
                    </span>
                    <h3 className="pg-rise" style={d(1)}>
                      {decodeEntities(feature.title)}
                    </h3>
                    <p className="pg-rise" style={d(2)}>
                      {decodeEntities(feature.description)}
                    </p>
                  </InView>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="attn-sec wk-d-sec" aria-labelledby="wk-d-uc-h">
          <div className="attn-wrap">
            <InView once>
              <p className="pg-kicker pg-rise">{t('detail.useCases.eyebrow')}</p>
              <h2 id="wk-d-uc-h" className="attn-sec-h pg-rise" style={d(1)}>
                {t('detail.useCases.title')}
              </h2>
              <ul className="wk-uses">
                {product.useCases.map((useCase, i) => (
                  <li key={useCase.title} className="pg-rise" style={d(i + 2)}>
                    <h3>{decodeEntities(useCase.title)}</h3>
                    <p>{decodeEntities(useCase.description)}</p>
                  </li>
                ))}
              </ul>
            </InView>
          </div>
        </section>

        <section className="attn-sec wk-d-sec wk-d-about" aria-labelledby="wk-d-st-h">
          <div className="attn-wrap wk-d-about-grid">
            <aside className="wk-d-stack">
              <p className="pg-kicker">{t('detail.techStack.eyebrow')}</p>
              <h2 id="wk-d-st-h" className="wk-d-stack-h">
                {t('detail.techStack.title')}
              </h2>
              <ul className="wk-chips-static">
                {product.techStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </aside>
            <div className="wk-mdx" lang={bn ? 'en' : undefined}>
              <MdxContent code={product.content} className="wk-prose" />
            </div>
          </div>
        </section>

        <PageCTA
          id="wk-d-cta"
          title={t('detail.cta.title', { title: product.title })}
          lede={t('detail.cta.lede')}
          primaryLabel={t('detail.cta.primaryLabel')}
          primaryHref="/quote"
          secondaryLabel={t('detail.cta.secondaryLabel')}
          secondaryHref="/products"
        />
      </div>
    </PageLayout>
  );
}
