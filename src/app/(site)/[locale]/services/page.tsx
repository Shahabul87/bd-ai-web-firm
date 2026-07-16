import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import PillarCards from '@/app/components/shared/PillarCards';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'What CraftsAI builds: custom AI agents, agent-built websites and mobile apps, and agent integration into your existing systems.',
};

export default async function ServicesPage() {
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
          index={t('pillars.index')}
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
