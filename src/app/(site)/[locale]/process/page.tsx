import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { toBengaliDigits } from '@/app/lib/numerals';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import HeroRun from '@/app/components/pages/process/HeroRun';
import StageRun, { type StageCopy } from '@/app/components/pages/process/StageRun';
import LoopFeed, { type LoopItem } from '@/app/components/pages/process/LoopFeed';
import WontDo, { type WontItem } from '@/app/components/pages/process/WontDo';
import type { ChartCopy } from '@/app/components/pages/process/RunPlot';
import type { ArtifactCopy } from '@/app/components/pages/process/StageArtifacts';
import { STAGE_KEYS } from '@/app/components/pages/process/run';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.process' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/process', locale),
    },
    alternates: localeAlternates('/process', locale),
  };
}

/**
 * /process — "The training run". The project is drawn as a quality curve
 * measured against the bar agreed in Discover: it draws itself in the hero,
 * then the five stages scroll past a sticky chart that converges stage by
 * stage. Copy is resolved here; the chart islands get it as typed props.
 */
export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Process');
  const bn = locale === 'bn';
  const num = (n: number) => {
    const s = String(n).padStart(2, '0');
    return bn ? toBengaliDigits(s) : s;
  };

  const chart: ChartCopy = {
    example: t('chart.example'),
    quality: t('chart.quality'),
    bar: t('chart.bar'),
    cost: t('chart.cost'),
    stage: t('chart.stage'),
    vsBar: t('chart.vsBar'),
  };

  const stages: StageCopy[] = STAGE_KEYS.map((key, i) => ({
    key,
    number: num(i + 1),
    title: t(`stages.${key}.title`),
    body: t(`stages.${key}.body`),
    get: t(`stages.${key}.get`),
    decide: t(`stages.${key}.decide`),
  }));

  const artifacts = Object.fromEntries(
    STAGE_KEYS.map((key) => [key, t.raw(`stages.${key}.artifact`)]),
  ) as ArtifactCopy;

  return (
    <PageLayout>
      <div className="attn pg-process">
        <section className="pg-hero pr-hero" aria-labelledby="pr-hero-h">
          <div className="attn-wrap pr-hero-grid">
            <div className="pr-hero-copy">
              <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
              <h1 className="pg-h1 pg-enter" id="pr-hero-h" style={{ '--d': 1 } as CSSProperties}>
                {t('hero.title')}
              </h1>
              <p className="pg-lede pg-enter" style={{ '--d': 2 } as CSSProperties}>
                {t('hero.lede')}
              </p>
              <div className="pg-actions pg-enter" style={{ '--d': 3 } as CSSProperties}>
                <Link className="attn-btn attn-btn-primary" href="/contact">
                  {t('hero.primary')}
                </Link>
                <a className="attn-btn attn-btn-secondary" href="#pr-run">
                  {t('hero.secondary')}
                </a>
              </div>
            </div>
            <HeroRun
              copy={chart}
              stages={stages.map((s) => s.title)}
              label={t('hero.chartLabel')}
              replay={t('hero.replay')}
              bn={bn}
            />
          </div>
        </section>

        <StageRun
          title={t('run.title')}
          note={t('run.note')}
          listLabel={t('run.listLabel')}
          youGet={t('run.youGet')}
          youDecide={t('run.youDecide')}
          chartLabel={t('run.chartLabel')}
          chart={chart}
          example={t('run.example')}
          stages={stages}
          artifacts={artifacts}
          bn={bn}
        />

        <LoopFeed
          title={t('loop.title')}
          note={t('loop.note')}
          channel={t('loop.channel')}
          from={t('loop.from')}
          example={t('loop.example')}
          legendDecide={t('loop.legendDecide')}
          legendDone={t('loop.legendDone')}
          items={t.raw('loop.items') as LoopItem[]}
        />

        <WontDo title={t('wont.title')} items={t.raw('wont.items') as WontItem[]} />

        <PageCTA
          id="pr-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primary')}
          primaryHref="/contact"
          secondaryLabel={t('cta.secondary')}
          secondaryHref="/services"
        />
      </div>
    </PageLayout>
  );
}
