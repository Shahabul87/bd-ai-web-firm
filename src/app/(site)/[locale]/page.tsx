import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HomePage from '@/app/components/HomePage';
import PageLayout from '@/app/components/layout/PageLayout';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';

// The home page has no metadata of its own, so without this it inherits the
// layout's static English canonical + og:locale — leaving /bn (the most
// SEO-critical page) pointing its canonical at the English homepage. This
// overrides just those per-locale; title/description/robots stay from the layout.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: localeAlternates('/', locale),
    openGraph: localeOpenGraph('/', locale),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageLayout>
      <HomePage />
    </PageLayout>
  );
}