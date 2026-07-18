import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { notFound } from 'next/navigation';
import { caseStudies } from '#content';
import { getCaseStudyBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Card from '@/app/design/ui/Card';
import MdxContent from '@/app/components/mdx/MdxContent';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';

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

  return {
    title: cs.title,
    description: cs.excerpt,
    openGraph: {
      title: `${cs.title} | CraftsAI`,
      description: cs.excerpt,
      ...localeOpenGraph(`/resources/case-studies/${cs.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: localeAlternates(`/resources/case-studies/${cs.slug}`, locale),
  };
}

export default async function CaseStudyDetailPage({
  params,
}: CaseStudyDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources.caseStudies');
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  return (
    <PageLayout>
      <ArticleJsonLd
        headline={cs.title}
        description={cs.excerpt}
        urlPath={`/resources/case-studies/${cs.slug}`}
        locale={locale}
        datePublished={cs.date}
      />
      <PageHero eyebrow={t('hero.eyebrow')} title={cs.title} lede={cs.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <span className="text-signal">{cs.industry}</span>
            <span aria-hidden>·</span>
            <span>{t('detail.client', { client: cs.client })}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {cs.services.map((service) => (
              <span
                key={service}
                className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
              >
                {service}
              </span>
            ))}
            {cs.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {cs.results.map((result) => (
              <Card key={result.metric} className="text-center">
                <div className="font-display text-3xl font-medium text-signal sm:text-4xl">
                  {result.value}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                  {result.metric}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <MdxContent code={cs.content} />
        </div>
      </section>

      <CTABand
        title={t('detail.cta.title')}
        lede={t('detail.cta.lede')}
        primaryLabel={t('detail.cta.primaryLabel')}
        primaryHref="/contact"
        secondaryLabel={t('detail.cta.secondaryLabel')}
        secondaryHref="/resources/case-studies"
      />
    </PageLayout>
  );
}
