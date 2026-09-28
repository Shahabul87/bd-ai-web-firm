import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import CompanyHero from '@/app/components/pages/company/CompanyHero';
import IntendedUse from '@/app/components/pages/company/IntendedUse';
import OutOfScope from '@/app/components/pages/company/OutOfScope';
import Principles from '@/app/components/pages/company/Principles';
import TwoLayers from '@/app/components/pages/company/TwoLayers';
import JoinBand from '@/app/components/pages/company/JoinBand';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.about' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/about', locale),
    },
    alternates: localeAlternates('/about', locale),
  };
}

/**
 * Company ("/about"): CraftsAI documented the way good AI is documented, as a
 * model card. Hero card → intended use → out of scope → evaluation &
 * principles → the two layers of a task → maintainers → CTA.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About.cta');

  return (
    <PageLayout>
      <div className="attn pg-company">
        <CompanyHero />
        <IntendedUse />
        <OutOfScope />
        <Principles />
        <TwoLayers />
        <JoinBand />
        <PageCTA
          id="co-cta-h"
          title={t('title')}
          lede={t('lede')}
          primaryLabel={t('primary')}
          secondaryLabel={t('secondary')}
        />
      </div>
    </PageLayout>
  );
}
