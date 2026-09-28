import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import { getAllBlogs } from '@/app/lib/content';
import CollectionPage from '@/app/components/pages/resources/CollectionPage';
import { blogItem } from '@/app/components/pages/resources/library';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resourcesBlog' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/resources/blog', locale),
      type: 'website',
    },
    alternates: localeAlternates('/resources/blog', locale),
  };
}

export default async function BlogListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageLayout>
      <CollectionPage collection="blog" items={getAllBlogs().map(blogItem)} locale={locale} />
    </PageLayout>
  );
}
