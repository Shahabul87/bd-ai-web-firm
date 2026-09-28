import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import FaqExplorer, { type FaqLabels } from '@/app/components/pages/faq/FaqExplorer';
import { loadFaq } from '@/app/components/pages/faq/data';
import { delay } from '@/app/components/pages/company/cssVars';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.faq' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/faq', locale),
    },
    alternates: localeAlternates('/faq', locale),
  };
}

const LABEL_KEYS = [
  'label',
  'placeholder',
  'clear',
  'hint',
  'count',
  'ranked',
  'results',
  'inAnswer',
  'chipsLabel',
  'all',
  'empty',
  'emptyBody',
  'emptyCta',
  'link',
  'copied',
] as const satisfies readonly (keyof FaqLabels)[];

/**
 * FAQ — "Ask". The questions from content/faq/faq.json behind a search box
 * that filters, ranks and highlights as you type, with topic chips and a
 * deep-linkable accordion. The FAQPage JSON-LD for this content is emitted by
 * the site-wide StructuredData component on /faq only.
 */
export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');
  const { categories, items } = loadFaq(locale);
  const labels = Object.fromEntries(LABEL_KEYS.map((k) => [k, t.raw(`search.${k}`) as string])) as unknown as FaqLabels;

  return (
    <PageLayout>
      <div className="attn pg-faq">
        <section className="pg-hero fq-hero" aria-labelledby="fq-h1">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
            <h1 className="pg-h1 pg-enter" id="fq-h1" style={delay(1)}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="pg-lede pg-enter" style={delay(2)}>
              {t('hero.lede')}
            </p>
          </div>
        </section>

        <FaqExplorer
          items={items}
          categories={categories}
          labels={labels}
          bengaliDigits={locale === 'bn'}
          contactHref="/contact"
        />

        <PageCTA
          id="fq-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primaryLabel')}
          secondaryLabel={t('cta.secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
