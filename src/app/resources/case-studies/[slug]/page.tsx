import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { caseStudies } from '#content';
import { getCaseStudyBySlug } from '@/app/lib/content';
import PageLayout from '../../../components/layout/PageLayout';
import MdxContent from '../../../components/mdx/MdxContent';
import { Tag } from '../../../components/ui';

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

const industryGradients: Record<string, string> = {
  EdTech: 'from-indigo-500 to-cyan-500',
  FinTech: 'from-emerald-500 to-teal-500',
  Healthcare: 'from-rose-500 to-pink-500',
  default: 'from-purple-500 to-violet-500',
};

function getGradient(industry: string): string {
  return industryGradients[industry] ?? industryGradients.default;
}

export default async function CaseStudyDetailPage({
  params,
}: CaseStudyDetailPageProps) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);

  if (!cs) {
    notFound();
  }

  const gradient = getGradient(cs.industry);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20"
            style={{ background: 'var(--brand-accent)' }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav
            className="flex items-center space-x-2 text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Link
              href="/resources"
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Resources
            </Link>
            <span>/</span>
            <Link
              href="/resources/case-studies"
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Case Studies
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--foreground)' }}>{cs.title}</span>
          </nav>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Tag variant="primary" size="md">
              {cs.industry}
            </Tag>
            {cs.services.map((s) => (
              <Tag key={s} variant="success" size="md">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Tag>
            ))}
            <span
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Client: {cs.client}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {cs.title}
          </h1>
          <p
            className="text-lg sm:text-xl max-w-3xl mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            {cs.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {cs.tags.map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      {/* Results Metrics */}
      <section className="py-10 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {cs.results.map((result) => (
              <div
                key={result.metric}
                className="text-center p-6 sm:p-8 rounded-xl border"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient} mb-2`}
                >
                  {result.value}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {result.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MDX Content */}
      <section className="py-10 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <MdxContent code={cs.content} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="rounded-2xl p-8 sm:p-12 border"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Ready to Build Something Similar?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Let us help you bring your idea to life with the same quality and
              expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
              >
                Start Your Project
              </Link>
              <Link
                href="/resources/case-studies"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border font-medium transition-all duration-300 hover:shadow-md"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                View All Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
