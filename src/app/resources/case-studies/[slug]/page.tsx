import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { caseStudies } from '#content';
import { getCaseStudyBySlug } from '@/app/lib/content';
import PageLayout from '../../../components/layout/PageLayout';
import PageHero from '../../../components/shared/PageHero';
import CTABand from '../../../components/shared/CTABand';
import Card from '../../../design/ui/Card';
import MdxContent from '../../../components/mdx/MdxContent';

interface CaseStudyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};

  return {
    title: `${cs.title} | CraftsAI Case Studies`,
    description: cs.excerpt,
    openGraph: {
      title: `${cs.title} | CraftsAI`,
      description: cs.excerpt,
      url: `https://www.craftsai.org/resources/case-studies/${cs.slug}`,
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: {
      canonical: `https://www.craftsai.org/resources/case-studies/${cs.slug}`,
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: CaseStudyDetailPageProps) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  return (
    <PageLayout>
      <PageHero eyebrow="Resources / Case studies" title={cs.title} lede={cs.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <span className="text-signal">{cs.industry}</span>
            <span aria-hidden>·</span>
            <span>Client: {cs.client}</span>
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
        title="Ready to build something similar?"
        lede="Let us help you bring your idea to life with the same quality and expertise."
        primaryLabel="Start your project"
        primaryHref="/contact"
        secondaryLabel="View all case studies"
        secondaryHref="/resources/case-studies"
      />
    </PageLayout>
  );
}
