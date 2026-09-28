import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.quote' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/quote', locale),
    },
    alternates: localeAlternates('/quote', locale),
  };
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
