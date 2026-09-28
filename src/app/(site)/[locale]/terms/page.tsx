import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import LegalDoc, { anchorId, type LegalSection } from '@/app/components/pages/legal/LegalDoc';
import { MAIL } from '@/app/components/pages/legal/schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.terms' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/terms', locale),
    },
    alternates: localeAlternates('/terms', locale),
  };
}

const KEYS = [
  'serviceTerms',
  'intellectualProperty',
  'paymentTerms',
  'limitationOfLiability',
  'termination',
  'governingLaw',
] as const;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.terms.sections');

  const sections: LegalSection[] = [
    ...KEYS.map((key) => ({
      id: anchorId(key),
      title: t(`${key}.title`),
      body: <p>{t(`${key}.body`)}</p>,
    })),
    {
      id: 'contact',
      title: t('contact.title'),
      body: (
        <p>
          {t('contact.body')} <a href={`mailto:${MAIL}`}>{MAIL}</a>.
        </p>
      ),
    },
  ];

  return (
    <PageLayout>
      <LegalDoc doc="terms" sections={sections} />
    </PageLayout>
  );
}
