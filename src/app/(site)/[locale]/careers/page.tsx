import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import CareersHero from '@/app/components/pages/careers/CareersHero';
import { HowWeWork, LookFor, OpenRoles } from '@/app/components/pages/careers/CareersSections';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.careers' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/careers', locale),
    },
    alternates: localeAlternates('/careers', locale),
  };
}

/**
 * Careers — "Join the maintainers". Picks up the Company page's model card at
 * its last field: a tokenized headline beside the maintainers entry, then how
 * we work, what we look for, and the (honest, currently empty) open roles.
 */
export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Careers.cta');

  return (
    <PageLayout>
      <div className="attn pg-careers">
        <CareersHero />
        <HowWeWork />
        <LookFor />
        <OpenRoles />
        <PageCTA
          id="ca-cta-h"
          title={t('title')}
          lede={t('lede')}
          primaryLabel={t('primaryLabel')}
          primaryHref="/about"
          secondaryLabel={t('secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
