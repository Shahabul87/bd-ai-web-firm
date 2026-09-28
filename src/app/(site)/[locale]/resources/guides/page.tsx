import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import { getAllGuides } from '@/app/lib/content';
import CollectionPage from '@/app/components/pages/resources/CollectionPage';
import { guideItem } from '@/app/components/pages/resources/library';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resourcesGuides' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/resources/guides', locale),
      type: 'website',
    },
    alternates: localeAlternates('/resources/guides', locale),
  };
}

export default async function GuidesListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageLayout>
      <CollectionPage collection="guides" items={getAllGuides().map(guideItem)} locale={locale} />
    </PageLayout>
  );
}
