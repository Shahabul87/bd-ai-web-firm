import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { caseStudies } from '#content';
import { getCaseStudyBySlug, getAllCaseStudies } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MdxContent from '@/app/components/mdx/MdxContent';
import SectionHeader from '@/app/design/ui/SectionHeader';
import SpecTable from '@/app/design/ui/SpecTable';
import Card from '@/app/design/ui/Card';

interface CaseStudyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};

  return {
    title: cs.title,
    description: cs.excerpt,
    openGraph: {
      title: `${cs.title} | CraftsAI`,
      description: cs.excerpt,
      ...localeOpenGraph(`/portfolio/${cs.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: localeAlternates(`/portfolio/${cs.slug}`, locale),
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Portfolio.detail');
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  // Related case studies (same industry or services, excluding current)
  const allStudies = getAllCaseStudies();
  const related = allStudies
    .filter(
      (other) =>
        other.slug !== cs.slug &&
        (other.industry === cs.industry ||
          other.services.some((s) => cs.services.includes(s)))
    )
    .slice(0, 2);

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow', { industry: cs.industry })} title={cs.title} lede={cs.excerpt} />

      <section className="mx-auto max-w-4xl px-6 pt-14">
        <SpecTable
          rows={[
            { label: t('spec.client'), value: cs.client },
            { label: t('spec.industry'), value: cs.industry },
            { label: t('spec.services'), value: cs.services.join(', ') },
            { label: t('spec.tags'), value: cs.tags.join(', ') },
          ]}
        />
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cs.results.map((result) => (
            <Card key={result.metric} className="text-center">
              <div className="font-display text-3xl font-medium text-signal">{result.value}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-steel">
                {result.metric}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
          <MdxContent code={cs.content} />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 01"
            eyebrow={t('related.eyebrow')}
            title={t('related.title')}
            align="center"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/portfolio/${r.slug}`} className="block h-full focus-visible:outline-none">
                <Card interactive className="h-full">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    {r.industry}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-medium text-bone">{r.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel">{r.excerpt}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="/quote"
        secondaryLabel={t('cta.secondaryLabel')}
        secondaryHref="/portfolio"
      />
    </PageLayout>
  );
}
