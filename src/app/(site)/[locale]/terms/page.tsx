import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
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
  const t = await getTranslations({ locale, namespace: 'Meta.terms' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Terms of Service',
      description: 'Terms and conditions for using CraftsAI services.',
      ...localeOpenGraph('/terms', locale),
    },
    alternates: localeAlternates('/terms', locale),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.terms');

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>{t('sections.serviceTerms.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.serviceTerms.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.serviceTerms.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.intellectualProperty.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.intellectualProperty.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.intellectualProperty.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.paymentTerms.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.paymentTerms.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.paymentTerms.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.limitationOfLiability.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.limitationOfLiability.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.limitationOfLiability.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.termination.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.termination.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.termination.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.governingLaw.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.governingLaw.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.governingLaw.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.contact.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.contact.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.contact.body')}{' '}
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
