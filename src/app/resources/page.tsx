import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import ContentGrid from '../components/content/ContentGrid';
import { getLatestContent } from '@/app/lib/content';
import type { LatestContentItem } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Resources - Blog, Case Studies & Guides | CraftsAI',
  description:
    'Explore our blog posts, case studies, and in-depth guides on AI-powered software development, web apps, mobile apps, and business strategy.',
  openGraph: {
    title: 'Resources | CraftsAI',
    description:
      'Blog posts, case studies, and guides on AI-powered development.',
    url: 'https://www.craftsai.org/resources',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources',
  },
};

const categories = [
  {
    icon: '\u{1F4DD}',
    title: 'Blog',
    description: 'Insights on AI development, strategy, and technology trends.',
    href: '/resources/blog',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Case Studies',
    description: 'Real results from our AI-powered development projects.',
    href: '/resources/case-studies',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '\u{1F4DA}',
    title: 'Guides',
    description:
      'In-depth guides on web development, mobile apps, and choosing the right approach.',
    href: '/resources/guides',
    gradient: 'from-purple-500 to-violet-500',
  },
];

export default function ResourcesPage() {
  const latestContent = getLatestContent(12);

  const items = latestContent.map((item: LatestContentItem) => ({
    title: item.title,
    excerpt: item.excerpt,
    type: item.type,
    slug: item.slug,
    date: item.date,
    readTime: 'readTime' in item ? (item as { readTime: number }).readTime : undefined,
    tags: item.tags,
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
            style={{ background: 'var(--brand-primary)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full blur-[120px] opacity-15"
            style={{ background: 'var(--brand-secondary)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6">
            <span style={{ color: 'var(--foreground)' }}>Resource </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Hub
            </span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Practical insights, real case studies, and expert guides to help you
            make smarter technology decisions.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href} className="group">
                <div
                  className="rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30 h-full"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${cat.gradient}`}
                  />
                  <div className="p-5 sm:p-6">
                    <span className="text-3xl mb-3 block">{cat.icon}</span>
                    <h2
                      className="text-xl font-bold mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {cat.title}
                    </h2>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 text-center"
            style={{ color: 'var(--foreground)' }}
          >
            Latest Content
          </h2>
          <ContentGrid items={items} />
        </div>
      </section>
    </PageLayout>
  );
}
