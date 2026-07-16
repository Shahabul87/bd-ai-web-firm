import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import SectionHeader from '@/app/design/ui/SectionHeader';
import ConveyorProcess, { ConveyorPhase } from '@/app/components/process/ConveyorProcess';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.process' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Our Development Process',
      description: 'From discovery to launch in 5 clear phases.',
      url: 'https://www.craftsai.org/process',
    },
    alternates: { canonical: 'https://www.craftsai.org/process' },
  };
}

interface CommunicationItem {
  title: string;
  description: string;
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Process');

  /* A real sequence — station numbers encode the order the work happens in. */
  const phases = t.raw('phases') as ConveyorPhase[];
  const communicationItems = t.raw('communication.items') as CommunicationItem[];

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')} />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow={t('line.eyebrow')} title={t('line.title')} />
        <ConveyorProcess phases={phases} totalNote={t('line.totalNote')} />
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow={t('communication.eyebrow')}
            title={t('communication.title')}
            description={t('communication.description')}
          />
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {communicationItems.map((item) => (
              <div key={item.title} className="bg-ink-950 p-6">
                <h3 className="font-display text-lg font-medium text-bone">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="/quote"
        secondaryLabel={t('cta.secondaryLabel')}
        secondaryHref="/services"
      />
    </PageLayout>
  );
}
