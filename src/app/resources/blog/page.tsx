import { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import ContentGrid from '../../components/content/ContentGrid';
import { getAllBlogs } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Blog - AI Development Insights | CraftsAI',
  description:
    'Read our latest articles on AI-powered development, web and mobile strategy, cost savings, and technology trends.',
  openGraph: {
    title: 'Blog | CraftsAI',
    description:
      'Articles on AI-powered development, strategy, and technology.',
    url: 'https://www.craftsai.org/resources/blog',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources/blog',
  },
};

export default function BlogListingPage() {
  const blogs = getAllBlogs();

  const items = blogs.map((blog) => ({
    title: blog.title,
    excerpt: blog.excerpt,
    type: 'blog' as const,
    slug: blog.slug,
    date: blog.date,
    readTime: blog.readTime,
    tags: blog.tags,
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
            style={{ background: 'var(--brand-warning)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6">
            <span style={{ color: 'var(--foreground)' }}>Our </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Blog
            </span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Insights on AI-powered development, business strategy, and
            technology trends from the CraftsAI team.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContentGrid items={items} showFilter />
        </div>
      </section>
    </PageLayout>
  );
}
