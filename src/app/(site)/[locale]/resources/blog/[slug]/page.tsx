import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { notFound } from 'next/navigation';
import { blogs } from '#content';
import { getBlogBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MdxContent from '@/app/components/mdx/MdxContent';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: `${blog.title} | CraftsAI`,
      description: blog.excerpt,
      ...localeOpenGraph(`/resources/blog/${blog.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'article',
      publishedTime: blog.date,
      authors: [blog.author],
    },
    alternates: localeAlternates(`/resources/blog/${blog.slug}`, locale),
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
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources.blog');
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <PageLayout>
      <ArticleJsonLd
        type="BlogPosting"
        locale={locale}
        headline={blog.title}
        description={blog.excerpt}
        urlPath={`/resources/blog/${blog.slug}`}
        datePublished={blog.date}
        author={blog.author}
      />
      <PageHero eyebrow={t('hero.eyebrow')} title={blog.title} lede={blog.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <span className="text-signal">{t('detail.by', { author: blog.author })}</span>
            <span aria-hidden>·</span>
            <time dateTime={blog.date}>{formatDate(blog.date)}</time>
            <span aria-hidden>·</span>
            <span>{t('readTime', { count: blog.readTime })}</span>
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
        title={t('detail.cta.title')}
        lede={t('detail.cta.lede')}
        primaryLabel={t('detail.cta.primaryLabel')}
        primaryHref="/quote"
        secondaryLabel={t('detail.cta.secondaryLabel')}
        secondaryHref="/resources/blog"
      />
    </PageLayout>
  );
}
