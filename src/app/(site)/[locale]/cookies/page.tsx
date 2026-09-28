import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import LegalDoc, { type LegalSection } from '@/app/components/pages/legal/LegalDoc';
import { MAIL, cookieTypesSchema } from '@/app/components/pages/legal/schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.cookies' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/cookies', locale),
    },
    alternates: localeAlternates('/cookies', locale),
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.cookies');
  const types = cookieTypesSchema.parse(t.raw('cookieTypes'));

  const sections: LegalSection[] = [
    {
      id: 'what-are-cookies',
      title: t('sections.whatAreCookies.title'),
      body: <p>{t('sections.whatAreCookies.body')}</p>,
    },
    {
      id: 'types-of-cookies',
      title: t('sections.typesOfCookies.title'),
      body: (
        <>
          <p>{t('sections.typesOfCookies.intro')}</p>
          <dl className="lg-defs">
            {types.map((type) => (
              <div key={type.title}>
                <dt>{type.title}</dt>
                <dd>{type.description}</dd>
              </div>
            ))}
          </dl>
        </>
      ),
    },
    {
      id: 'managing-cookies',
      title: t('sections.managingCookies.title'),
      body: <p>{t('sections.managingCookies.body')}</p>,
    },
    {
      id: 'updates',
      title: t('sections.updates.title'),
      body: <p>{t('sections.updates.body')}</p>,
    },
    {
      id: 'contact',
      title: t('sections.contact.title'),
      body: (
        <p>
          {t('sections.contact.bodyBefore')} <a href={`mailto:${MAIL}`}>{MAIL}</a> {t('sections.contact.bodyMiddle')}{' '}
          <Link href="/privacy">{t('sections.contact.linkLabel')}</Link> {t('sections.contact.bodyAfter')}
        </p>
      ),
    },
  ];

  return (
    <PageLayout>
      <LegalDoc doc="cookies" sections={sections} />
    </PageLayout>
  );
}
