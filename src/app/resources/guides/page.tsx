import { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import ContentGrid from '../../components/content/ContentGrid';
import { getAllGuides } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Guides & Whitepapers - In-Depth Development Resources | CraftsAI',
  description:
    'Comprehensive guides on web app development, choosing a development partner, and building successful software products.',
  openGraph: {
    title: 'Guides & Whitepapers | CraftsAI',
    description:
      'In-depth guides on web development, mobile apps, and business strategy.',
    url: 'https://www.craftsai.org/resources/guides',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources/guides',
  },
};

export default function GuidesListingPage() {
  const guides = getAllGuides();

  const items = guides.map((guide) => ({
    title: guide.title,
    excerpt: guide.excerpt,
    type: 'guide' as const,
    slug: guide.slug,
    date: guide.date,
    readTime: guide.readTime,
    tags: guide.tags,
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
            style={{ background: 'var(--brand-secondary)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6">
            <span style={{ color: 'var(--foreground)' }}>Guides &amp; </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-500">
              Whitepapers
            </span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            In-depth resources to help you plan, build, and ship successful
            software products.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContentGrid items={items} showFilter />
        </div>
      </section>
    </PageLayout>
  );
}
