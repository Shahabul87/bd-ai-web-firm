import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/shared/PageHero';
import CTABand from '../../components/shared/CTABand';
import Card from '../../design/ui/Card';
import { getAllBlogs } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Blog - AI Development Insights',
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogListingPage() {
  const blogs = getAllBlogs();

  return (
    <PageLayout>
      <PageHero
        eyebrow="Resources / Blog"
        title="Field notes from the build."
        lede="Insights on AI-powered development, business strategy, and technology trends from the CraftsAI team."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        {blogs.length === 0 ? (
          <p className="text-base text-steel">No posts yet — check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/resources/blog/${blog.slug}`}
                className="group block h-full focus-visible:outline-none"
              >
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    <span className="text-signal">Blog</span>
                    <span>{blog.readTime} min read</span>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-medium text-bone">{blog.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{blog.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <time
                      dateTime={blog.date}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
                    >
                      {formatDate(blog.date)}
                    </time>
                    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                      Read
                      <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTABand />
    </PageLayout>
  );
}
