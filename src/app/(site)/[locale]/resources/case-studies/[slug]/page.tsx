import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { caseStudies } from '#content';
import { getCaseStudyBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';
import ArticleShell from '@/app/components/pages/resources/ArticleShell';
import { formatters, tagLabeler } from '@/app/components/pages/resources/library';
import { decodeEntities } from '@/app/components/pages/work/text';
import EvalCard from '@/app/components/pages/casestudies/EvalCard';
import EvalList from '@/app/components/pages/casestudies/EvalList';
import { getEvalCopy, getReports } from '@/app/components/pages/casestudies/reports';

interface CaseStudyDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};
  const title = decodeEntities(cs.title);
  const description = decodeEntities(cs.excerpt);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...localeOpenGraph(`/resources/case-studies/${cs.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: localeAlternates(`/resources/case-studies/${cs.slug}`, locale),
  };
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * One case study as an eval report, in the reading room's ArticleShell (TOC
 * that tracks position, ~68ch measure, reading progress). Before the write-up
 * sits the report itself: the problem → approach → outcome eval card with
 * platform, stack and a link to the live product, then the facts that
 * shipped. Other reports follow as eval-card rows.
 */
export default async function CaseStudyDetailPage({ params }: CaseStudyDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources');
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  const [reports, copy] = await Promise.all([getReports(locale), getEvalCopy(locale)]);
  const report = reports.find((r) => r.slug === cs.slug);
  if (!report) notFound();
  const others = reports.filter((r) => r.slug !== cs.slug);
  const f = formatters(locale);
  const contentLang = f.bn ? 'en' : undefined;
  const tagLabel = tagLabeler(t.raw('tags') as Record<string, string>);
  const stack = report.product?.stack ?? [];
  const h2Count = (cs.content.match(/\w+\.h2,\{id:/g) ?? []).length;

  const lead = (
    <div className="cs-lead">
      <section className="cs-summary pg-panel" aria-labelledby="cs-summary-h">
        <h2 id="cs-summary-h" className="cs-summary-h">
          {t('caseStudies.detail.summary.label')}
        </h2>
        {report.stages ? (
          <InView once className="cs-summary-fig">
            <EvalCard
              label={copy.cardLabel.replace('{title}', report.title)}
              stages={[
                { key: 'problem', label: copy.problem, text: report.stages.problem },
                { key: 'approach', label: copy.approach, text: report.stages.approach },
                { key: 'outcome', label: copy.outcome, text: report.stages.outcome },
              ]}
            />
          </InView>
        ) : null}
        <dl className="cs-summary-dl">
          {report.ownProduct ? (
            <div>
              <dt className="pg-cap">{t('caseStudies.detail.summary.builtBy')}</dt>
              <dd>{t('caseStudies.detail.summary.builtByValue')}</dd>
            </div>
          ) : null}
          <div>
            <dt className="pg-cap">{t('caseStudies.detail.summary.platform')}</dt>
            <dd>{report.platforms.join(' · ')}</dd>
          </div>
          {stack.length > 0 ? (
            <div className="cs-summary-stack">
              <dt className="pg-cap">{t('caseStudies.detail.summary.stack')}</dt>
              <dd>
                <ul className="cs-stack">
                  {stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
        {report.product ? (
          <Link className="cs-product" href={`/products/${report.product.slug}`}>
            <span className="cs-product-t">
              {t('caseStudies.detail.summary.product', { title: report.product.title })}
              <span className="cs-more-arr" aria-hidden="true">
                →
              </span>
            </span>
            <span className="cs-product-n">{t('caseStudies.detail.summary.productNote')}</span>
          </Link>
        ) : null}
      </section>

      <section className="cs-results" aria-labelledby="cs-results-h">
        <InView once>
          <h2 id="cs-results-h" className="cs-results-h pg-rise">
            {t('caseStudies.detail.results.title')}
          </h2>
          <p className="cs-results-note pg-rise" style={d(1)}>
            {t('caseStudies.detail.results.note')}
          </p>
          <dl className="cs-facts">
            {report.facts.map((fact, i) => (
              <div key={fact.label} className="cs-fact pg-rise" style={d(i + 1)}>
                <dt className="pg-cap">{fact.label}</dt>
                <dd>{fact.value}</dd>
                <span className="cs-fact-ok" aria-hidden="true">
                  <svg viewBox="0 0 12 12">
                    <path d="M2.6 6.3 5 8.6 9.4 3.6" pathLength={1} />
                  </svg>
                </span>
              </div>
            ))}
          </dl>
        </InView>
      </section>
    </div>
  );

  return (
    <PageLayout>
      <ArticleJsonLd
        headline={report.title}
        description={report.excerpt}
        urlPath={`/resources/case-studies/${cs.slug}`}
      />
      <div className="attn pg-resources rs-read cs-page cs-detail">
        <ArticleShell
          id="cs-d"
          kicker={t('caseStudies.detail.kicker', { industry: report.industry })}
          back={{ href: '/resources/case-studies', label: t('caseStudies.detail.back') }}
          title={report.title}
          dek={report.excerpt}
          meta={[
            ...(report.ownProduct ? [{ label: copy.ownProduct }] : []),
            { label: f.date(cs.date), dateTime: cs.date },
          ]}
          tags={report.tags.map(tagLabel)}
          code={cs.content}
          contentLang={contentLang}
          labels={{ toc: t('article.toc'), tags: t('article.tags') }}
          numbers={Array.from({ length: h2Count }, (_, i) => f.ordinal(i))}
          lead={lead}
        />

        {others.length > 0 ? (
          <section className="attn-sec cs-others" aria-labelledby="cs-others-h">
            <div className="attn-wrap">
              <InView once>
                <h2 id="cs-others-h" className="attn-sec-h pg-rise">
                  {t('caseStudies.detail.more.title')}
                </h2>
              </InView>
              <EvalList reports={others} copy={copy} bn={f.bn} compact />
            </div>
          </section>
        ) : null}

        <PageCTA
          id="cs-d-cta"
          title={t('caseStudies.detail.cta.title')}
          lede={t('caseStudies.detail.cta.lede')}
          primaryLabel={t('caseStudies.detail.cta.primaryLabel')}
          secondaryLabel={t('caseStudies.detail.cta.secondaryLabel')}
          secondaryHref="/resources/case-studies"
        />
      </div>
    </PageLayout>
  );
}
