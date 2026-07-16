import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import PillarCards from '@/app/components/shared/PillarCards';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.services' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      ...localeOpenGraph('/services', locale),
    },
    alternates: localeAlternates('/services', locale),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Services.index');

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')}>
        <Button variant="amber" size="lg" href="/contact">
          {t('hero.primaryCta')}
        </Button>
        <Button variant="chalk" size="lg" href="/quote">
          {t('hero.secondaryCta')}
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow={t('pillars.eyebrow')}
          title={t('pillars.title')}
          description={t('pillars.description')}
        />
        <div className="mt-14">
          <PillarCards />
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
