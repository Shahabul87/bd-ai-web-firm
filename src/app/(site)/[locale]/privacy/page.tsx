import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import LegalDoc, { anchorId, type LegalSection } from '@/app/components/pages/legal/LegalDoc';
import { MAIL, stringListSchema, termDetailSchema } from '@/app/components/pages/legal/schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.privacy' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/privacy', locale),
    },
    alternates: localeAlternates('/privacy', locale),
  };
}

const KEYS = [
  'informationWeCollect',
  'howWeUse',
  'serviceProviders',
  'cookies',
  'dataRetention',
  'yourRights',
  'dataSecurity',
  'contactUs',
] as const;

type Key = (typeof KEYS)[number];

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.privacy.sections');
  const collect = termDetailSchema.parse(t.raw('informationWeCollect.items'));
  const uses = stringListSchema.parse(t.raw('howWeUse.items'));
  const providers = termDetailSchema.parse(t.raw('serviceProviders.items'));
  const mail = (
    <a href={`mailto:${MAIL}`}>{MAIL}</a>
  );

  /*
    FOUNDER TODO before public launch — finalize the bracketed [placeholders]
    in these sections with your real details and have this reviewed by a lawyer:
      • Named sub-processors (hosting/database provider, email provider).
      • Concrete data-retention periods per data category.
      • Your registered legal/business entity name & jurisdiction.
    The data categories and processor *types* described here are accurate to
    what the application actually collects and transmits as of this date.
  */
  const body: Record<Key, React.ReactNode> = {
    informationWeCollect: (
      <>
        <p>{t('informationWeCollect.intro')}</p>
        <ul>
          {collect.map((item) => (
            <li key={item.term}>
              <strong>{item.term}</strong> {item.detail}
            </li>
          ))}
        </ul>
      </>
    ),
    howWeUse: (
      <>
        <p>{t('howWeUse.intro')}</p>
        <ul>
          {uses.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    serviceProviders: (
      <>
        <p>{t('serviceProviders.intro')}</p>
        <ul>
          {providers.map((item) => (
            <li key={item.term}>
              <strong>{item.term}</strong> {item.detail}
            </li>
          ))}
        </ul>
        <p>{t('serviceProviders.outro')}</p>
      </>
    ),
    cookies: (
      <p>
        {t('cookies.body')} <Link href="/cookies">{t('cookies.linkLabel')}</Link>.
      </p>
    ),
    dataRetention: <p>{t('dataRetention.body')}</p>,
    yourRights: (
      <p>
        {t('yourRights.bodyBefore')} {mail} {t('yourRights.bodyAfter')}
      </p>
    ),
    dataSecurity: <p>{t('dataSecurity.body')}</p>,
    contactUs: (
      <p>
        {t('contactUs.body')} {mail}.
      </p>
    ),
  };

  const sections: LegalSection[] = KEYS.map((key) => ({
    id: anchorId(key),
    title: t(`${key}.title`),
    body: body[key],
  }));

  return (
    <PageLayout>
      <LegalDoc doc="privacy" sections={sections} />
    </PageLayout>
  );
}
