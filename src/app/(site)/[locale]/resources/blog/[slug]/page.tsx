import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { blogs } from '#content';
import { getAllBlogs, getBlogBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';
import ArticlePage from '@/app/components/pages/resources/ArticlePage';
import { blogItem } from '@/app/components/pages/resources/library';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = getBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      ...localeOpenGraph(`/resources/blog/${blog.slug}`, locale),
      type: 'article',
      publishedTime: blog.date,
      authors: [blog.author],
    },
    alternates: localeAlternates(`/resources/blog/${blog.slug}`, locale),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
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
      <ArticlePage
        collection="blog"
        item={blogItem(blog)}
        siblings={getAllBlogs().map(blogItem)}
        code={blog.content}
        locale={locale}
      />
    </PageLayout>
  );
}
