import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MonoLabel from '@/app/design/ui/MonoLabel';

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
      title: 'Privacy Policy',
      description: 'How CraftsAI collects, uses, and protects your data.',
      ...localeOpenGraph('/privacy', locale),
    },
    alternates: localeAlternates('/privacy', locale),
  };
}

type TermDetail = { term: string; detail: string };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.privacy');
  const collectItems = t.raw('sections.informationWeCollect.items') as TermDetail[];
  const useItems = t.raw('sections.howWeUse.items') as string[];
  const providerItems = t.raw('sections.serviceProviders.items') as TermDetail[];

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      {/*
        FOUNDER TODO before public launch — finalize the bracketed [placeholders]
        below with your real details and have this reviewed by a lawyer:
          • Named sub-processors (hosting/database provider, email provider).
          • Concrete data-retention periods per data category.
          • Your registered legal/business entity name & jurisdiction.
        The data categories and processor *types* described here are accurate to
        what the application actually collects and transmits as of this date.
      */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>{t('sections.informationWeCollect.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.informationWeCollect.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.informationWeCollect.intro')}
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              {collectItems.map((item) => (
                <li key={item.term}>
                  <strong className="text-bone">{item.term}</strong>{` ${item.detail}`}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <MonoLabel>{t('sections.howWeUse.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.howWeUse.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">{t('sections.howWeUse.intro')}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              {useItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <MonoLabel>{t('sections.serviceProviders.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.serviceProviders.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.serviceProviders.intro')}
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              {providerItems.map((item) => (
                <li key={item.term}>
                  <strong className="text-bone">{item.term}</strong>{` ${item.detail}`}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.serviceProviders.outro')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.cookies.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.cookies.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.cookies.body')}{' '}
              <Link
                href="/cookies"
                className="text-signal underline-offset-4 hover:underline"
              >
                {t('sections.cookies.linkLabel')}
              </Link>
              .
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.dataRetention.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.dataRetention.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.dataRetention.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.yourRights.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.yourRights.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.yourRights.bodyBefore')}{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>{' '}
              {t('sections.yourRights.bodyAfter')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.dataSecurity.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.dataSecurity.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.dataSecurity.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.contactUs.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.contactUs.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.contactUs.body')}{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
