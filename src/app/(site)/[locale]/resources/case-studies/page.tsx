import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import EvalCard from '@/app/components/pages/casestudies/EvalCard';
import EvalList from '@/app/components/pages/casestudies/EvalList';
import { getEvalCopy, getReports } from '@/app/components/pages/casestudies/reports';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resourcesCaseStudies' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/resources/case-studies', locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates('/resources/case-studies', locale),
  };
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * Case studies — "Eval reports". Each of our own products is written up like
 * an evaluation report: problem → approach → outcome, facts only. The hero's
 * legend runs the pipeline once so the rows below read at a glance; every row
 * carries its own tiny eval card that draws in view and replays on hover.
 */
export default async function CaseStudiesListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources.caseStudies');
  const [reports, copy] = await Promise.all([getReports(locale), getEvalCopy(locale)]);
  const bn = locale === 'bn';

  return (
    <PageLayout>
      <div className="attn pg-resources cs-page">
        <section className="pg-hero cs-hero" aria-labelledby="cs-hero-h">
          <div className="attn-wrap cs-hero-grid">
            <div>
              <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
              <h1 id="cs-hero-h" className="pg-h1 cs-h1 pg-enter" style={d(1)}>
                {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
              </h1>
              <p className="pg-lede pg-enter" style={d(2)}>
                {t('hero.lede')}
              </p>
              <div className="pg-actions pg-enter" style={d(3)}>
                <a className="attn-btn attn-btn-primary" href="#cs-reports">
                  {t('hero.primaryCta')}
                </a>
                <Link className="attn-btn attn-btn-secondary" href="/products">
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </div>
            <aside className="cs-legend pg-panel pg-enter" style={d(3)} aria-labelledby="cs-legend-h">
              <p id="cs-legend-h" className="cs-legend-h">
                {t('legend.label')}
              </p>
              <InView className="cs-legend-fig">
                <EvalCard
                  size="legend"
                  label={t('legend.caption')}
                  stages={[
                    { key: 'problem', label: copy.problem },
                    { key: 'approach', label: copy.approach },
                    { key: 'outcome', label: copy.outcome },
                  ]}
                />
              </InView>
              <p className="cs-legend-cap pg-cap">{t('legend.caption')}</p>
              <p className="cs-legend-rule">{t('legend.rule')}</p>
            </aside>
          </div>
        </section>

        <section className="attn-sec cs-index" id="cs-reports" aria-labelledby="cs-reports-h">
          <div className="attn-wrap">
            <InView once className="cs-index-head">
              <h2 id="cs-reports-h" className="attn-sec-h pg-rise">
                {t('list.title')}
              </h2>
              <p className="cs-index-note pg-rise" style={d(1)}>
                {t('list.note')}
              </p>
            </InView>
            {reports.length === 0 ? (
              <p className="cs-empty">{t('empty')}</p>
            ) : (
              <EvalList reports={reports} copy={copy} bn={bn} />
            )}
          </div>
        </section>

        <PageCTA
          id="cs-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primaryLabel')}
          secondaryLabel={t('cta.secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
