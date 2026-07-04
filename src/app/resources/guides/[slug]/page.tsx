import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guides } from '#content';
import { getGuideBySlug } from '@/app/lib/content';
import PageLayout from '../../../components/layout/PageLayout';
import PageHero from '../../../components/shared/PageHero';
import CTABand from '../../../components/shared/CTABand';
import MdxContent from '../../../components/mdx/MdxContent';
import ArticleJsonLd from '../../../components/ArticleJsonLd';

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
      <ArticleJsonLd
        headline={guide.title}
        description={guide.excerpt}
        urlPath={`/resources/guides/${guide.slug}`}
        datePublished={guide.date}
      />
      <PageHero eyebrow="Resources / Guides" title={guide.title} lede={guide.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <time dateTime={guide.date} className="text-signal">
              {formatDate(guide.date)}
            </time>
            <span aria-hidden>·</span>
            <span>{guide.readTime} min read</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
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
          <MdxContent code={guide.content} />
        </div>
      </section>

      <CTABand
        title="Need expert help with your project?"
        lede="Our AI-powered team can help you go from idea to launch faster and more affordably than you thought possible."
        primaryLabel="Get a free quote"
        primaryHref="/quote"
        secondaryLabel="Back to guides"
        secondaryHref="/resources/guides"
      />
    </PageLayout>
  );
}
