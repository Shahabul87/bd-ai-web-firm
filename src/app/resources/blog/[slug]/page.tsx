import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogs } from '#content';
import { getBlogBySlug } from '@/app/lib/content';
import PageLayout from '../../../components/layout/PageLayout';
import PageHero from '../../../components/shared/PageHero';
import CTABand from '../../../components/shared/CTABand';
import MdxContent from '../../../components/mdx/MdxContent';
import ArticleJsonLd from '../../../components/ArticleJsonLd';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: `${blog.title} | CraftsAI Blog`,
    description: blog.excerpt,
    openGraph: {
      title: `${blog.title} | CraftsAI`,
      description: blog.excerpt,
      url: `https://www.craftsai.org/resources/blog/${blog.slug}`,
      siteName: 'CraftsAI',
      type: 'article',
      publishedTime: blog.date,
      authors: [blog.author],
    },
    alternates: {
      canonical: `https://www.craftsai.org/resources/blog/${blog.slug}`,
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <PageLayout>
      <ArticleJsonLd
        type="BlogPosting"
        headline={blog.title}
        description={blog.excerpt}
        urlPath={`/resources/blog/${blog.slug}`}
        datePublished={blog.date}
        author={blog.author}
      />
      <PageHero eyebrow="Resources / Blog" title={blog.title} lede={blog.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <span className="text-signal">By {blog.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={blog.date}>{formatDate(blog.date)}</time>
            <span aria-hidden>·</span>
            <span>{blog.readTime} min read</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
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
          <MdxContent code={blog.content} />
        </div>
      </section>

      <CTABand
        title="Ready to build your next project?"
        lede="Let our AI-powered team turn your idea into production-ready software at a fraction of the traditional cost."
        primaryLabel="Get a free quote"
        primaryHref="/quote"
        secondaryLabel="Back to blog"
        secondaryHref="/resources/blog"
      />
    </PageLayout>
  );
}
