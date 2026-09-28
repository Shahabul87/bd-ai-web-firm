import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import ServiceDetail, { serviceDetailMetadata } from '@/app/components/pages/service-detail/ServiceDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return serviceDetailMetadata('ios', locale);
}

export default async function IosDevelopmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageLayout>
      <ServiceDetail slug="ios" locale={locale} />
    </PageLayout>
  );
}
