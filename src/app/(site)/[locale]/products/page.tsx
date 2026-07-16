import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import { products } from '#content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Card from '@/app/design/ui/Card';

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
      title: 'Our Products',
      description: 'Ready-made solutions, battle-tested and production-ready.',
      ...localeOpenGraph('/products', locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates('/products', locale),
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Products');

  const platformLabels = t.raw('platformLabels') as Record<string, string>;

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')} />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="block h-full focus-visible:outline-none"
            >
              <Card interactive className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                  {product.platforms.map((p) => (
                    <span key={p} className="border border-line px-2 py-1 text-steel">
                      {platformLabels[p] ?? p}
                    </span>
                  ))}
                </div>

                <h2 className="mt-6 font-display text-2xl font-medium text-bone">
                  {product.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {product.tagline}
                </p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {product.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-steel"
                    >
                      {tech}
                    </span>
                  ))}
                  {product.techStack.length > 4 ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
                      +{product.techStack.length - 4} {t('more')}
                    </span>
                  ) : null}
                </div>

                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                  {t('learnMore')}
                  <span aria-hidden>→</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="/quote"
      />
    </PageLayout>
  );
}
