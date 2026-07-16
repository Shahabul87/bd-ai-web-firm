import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import SectionHeader from '@/app/design/ui/SectionHeader';
import Card from '@/app/design/ui/Card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.careers' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Careers',
      description: 'Join the CraftsAI team and build the future of AI-powered software development.',
      url: 'https://www.craftsai.org/careers',
    },
    alternates: { canonical: 'https://www.craftsai.org/careers' },
  };
}

interface CultureCard {
  title: string;
  description: string;
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Careers');

  const cultureCards = t.raw('culture.cards') as CultureCard[];

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')} />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow={t('culture.eyebrow')} title={t('culture.title')} />
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {cultureCards.map((card) => (
            <div key={card.title} className="bg-ink-950 p-8">
              <h3 className="font-display text-xl font-medium text-bone">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow={t('openPositions.eyebrow')}
            title={t('openPositions.title')}
            align="center"
          />
          <div className="mt-10">
            <Card>
              <p className="text-base leading-relaxed text-steel">
                {t('openPositions.cardLead')}{' '}
                <a
                  href="mailto:careers@craftsai.org"
                  className="text-signal underline-offset-4 hover:underline"
                >
                  careers@craftsai.org
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </section>

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="mailto:careers@craftsai.org"
        secondaryLabel={t('cta.secondaryLabel')}
        secondaryHref="/portfolio"
      />
    </PageLayout>
  );
}
