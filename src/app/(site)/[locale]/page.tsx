import { setRequestLocale } from 'next-intl/server';
import HomePage from '@/app/components/HomePage';
import PageLayout from '@/app/components/layout/PageLayout';

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