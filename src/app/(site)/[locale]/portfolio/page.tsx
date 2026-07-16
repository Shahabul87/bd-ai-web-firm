import { getTranslations } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import PortfolioGrid from '@/app/components/portfolio/PortfolioGrid';
import { caseStudies } from '#content';

export default async function Portfolio() {
  const t = await getTranslations('Portfolio');

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')} />

      <PortfolioGrid caseStudies={caseStudies} />

      <CTABand title={t('cta.title')} lede={t('cta.lede')} />
    </PageLayout>
  );
}
