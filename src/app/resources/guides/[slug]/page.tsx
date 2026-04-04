import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides } from '#content';
import { getGuideBySlug } from '@/app/lib/content';
import PageLayout from '../../../components/layout/PageLayout';
import MdxContent from '../../../components/mdx/MdxContent';
import { Tag } from '../../../components/ui';

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuideDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | CraftsAI Guides`,
    description: guide.excerpt,
    openGraph: {
      title: `${guide.title} | CraftsAI`,
      description: guide.excerpt,
      url: `https://www.craftsai.org/resources/guides/${guide.slug}`,
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: {
      canonical: `https://www.craftsai.org/resources/guides/${guide.slug}`,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function GuideDetailPage({
  params,
}: GuideDetailPageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

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
            style={{ background: 'var(--brand-secondary)' }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              href="/resources/guides"
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Guides
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--foreground)' }}>{guide.title}</span>
          </nav>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Tag
              variant="primary"
              size="md"
              className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            >
              Guide
            </Tag>
            <time
              className="text-sm"
              dateTime={guide.date}
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatDate(guide.date)}
            </time>
            <span
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              &middot;
            </span>
            <span
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {guide.readTime} min read
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {guide.title}
          </h1>
          <p
            className="text-lg sm:text-xl mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            {guide.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      {/* MDX Content */}
      <section className="py-10 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <MdxContent code={guide.content} />
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
              Need Expert Help With Your Project?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Our AI-powered team can help you go from idea to launch faster
              and more affordably than you thought possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/resources/guides"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border font-medium transition-all duration-300 hover:shadow-md"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                Back to Guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
