import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { guides } from '#content';
import { getAllGuides, getGuideBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';
import ArticlePage from '@/app/components/pages/resources/ArticlePage';
import { guideItem } from '@/app/components/pages/resources/library';

interface GuideDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuideDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.excerpt,
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      ...localeOpenGraph(`/resources/guides/${guide.slug}`, locale),
      type: 'article',
      publishedTime: guide.date,
    },
    alternates: localeAlternates(`/resources/guides/${guide.slug}`, locale),
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
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
      <ArticlePage
        collection="guides"
        item={guideItem(guide)}
        siblings={getAllGuides().map(guideItem)}
        code={guide.content}
        locale={locale}
      />
    </PageLayout>
  );
}
