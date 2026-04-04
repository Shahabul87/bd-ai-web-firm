import { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import ContentGrid from '../../components/content/ContentGrid';
import { getAllCaseStudies } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Case Studies - Real AI Development Results | CraftsAI',
  description:
    'See how our AI-powered development delivers real results. Browse case studies across EdTech, FinTech, and more.',
  openGraph: {
    title: 'Case Studies | CraftsAI',
    description:
      'Real results from our AI-powered development projects.',
    url: 'https://www.craftsai.org/resources/case-studies',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources/case-studies',
  },
};

export default function CaseStudiesListingPage() {
  const caseStudies = getAllCaseStudies();

  const items = caseStudies.map((cs) => ({
    title: cs.title,
    excerpt: cs.excerpt,
    type: 'case-study' as const,
    slug: cs.slug,
    date: cs.date,
    tags: [...cs.tags, cs.industry, ...cs.services],
  }));

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
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full blur-[150px] opacity-20"
            style={{ background: 'var(--brand-accent)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6">
            <span style={{ color: 'var(--foreground)' }}>Case </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
              Studies
            </span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Real projects, real results. See how AI-powered development
            delivers measurable outcomes for businesses across industries.
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContentGrid items={items} showFilter />
        </div>
      </section>
    </PageLayout>
  );
}
