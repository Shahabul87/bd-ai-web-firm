import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import EvalList from '@/app/components/pages/casestudies/EvalList';
import { getEvalCopy, getReports } from '@/app/components/pages/casestudies/reports';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.portfolio' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/portfolio', locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates('/portfolio', locale),
  };
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;
const ROUTES = [
  { key: 'work', href: '/products' },
  { key: 'cases', href: '/resources/case-studies' },
] as const;

/**
 * Portfolio — a fork, not a third copy. Our work already lives in two places:
 * the products (/products) and the reports on how we built them
 * (/resources/case-studies). This page routes visitors to the one they need —
 * a drawn fork splits into the two destinations — and lists the reports with
 * the same eval-card rows the case studies page uses.
 */
export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Portfolio');
  const [reports, copy] = await Promise.all([getReports(locale), getEvalCopy(locale)]);
  const bn = locale === 'bn';

  return (
    <PageLayout>
      <div className="attn pg-portfolio">
        <section className="pg-hero pf-hero" aria-labelledby="pf-hero-h">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
            <h1 id="pf-hero-h" className="pg-h1 pf-h1 pg-enter" style={d(1)}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="pg-lede pg-enter" style={d(2)}>
              {t('hero.lede')}
            </p>

            <nav className="pf-fork pg-enter" style={d(3)} aria-label={t('routes.label')}>
              <svg className="pf-fork-lines" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
                <path className="pf-fork-p pf-fork-a" d="M500 0 C500 44 250 36 250 80" pathLength={1} />
                <path className="pf-fork-p pf-fork-b" d="M500 0 C500 44 750 36 750 80" pathLength={1} />
              </svg>
              <span className="pf-fork-root" aria-hidden="true" />
              <ul className="pf-routes">
                {ROUTES.map((r, i) => (
                  <li key={r.key} className={`pf-route pf-route-${r.key}`} style={d(i)}>
                    <Link href={r.href} className="pf-route-a pg-panel">
                      <span className="pf-route-n pg-cap">{t(`routes.${r.key}.name`)}</span>
                      <span className="pf-route-t">{t(`routes.${r.key}.title`)}</span>
                      <span className="pf-route-b">{t(`routes.${r.key}.body`)}</span>
                      <span className="pf-route-cta">
                        {t(`routes.${r.key}.cta`)}
                        <span className="pf-route-arr" aria-hidden="true">
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <section className="attn-sec pf-list" aria-labelledby="pf-list-h">
          <div className="attn-wrap">
            <InView once className="pf-list-head">
              <h2 id="pf-list-h" className="attn-sec-h pg-rise">
                {t('list.title')}
              </h2>
              <p className="pf-list-note pg-rise" style={d(1)}>
                {t('list.note')}
              </p>
            </InView>
            <EvalList reports={reports} copy={copy} bn={bn} compact />
          </div>
        </section>

        <PageCTA
          id="pf-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primaryLabel')}
          secondaryLabel={t('cta.secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
