import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import MonoLabel from '@/app/design/ui/MonoLabel';
import Accordion from '@/app/design/ui/Accordion';
import faqData from '@content/faq/faq.json';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.faq' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'FAQ',
      description:
        'Frequently asked questions about CraftsAI services, pricing, process, and support.',
      ...localeOpenGraph('/faq', locale),
    },
    alternates: localeAlternates('/faq', locale),
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')}>
        <Button variant="amber" size="lg" href="/contact">
          {t('hero.primaryCta')}
        </Button>
      </PageHero>

      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        {faqData.map((category, categoryIndex) => (
          <div key={category.category} className="mb-16 last:mb-0">
            <MonoLabel>
              {String(categoryIndex + 1).padStart(2, '0')} / {category.category}
            </MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone sm:text-3xl">
              {category.category}
            </h2>
            <div className="mt-6">
              <Accordion
                items={category.questions.map((q, questionIndex) => ({
                  id: `${category.category}-${questionIndex}`,
                  question: q.question,
                  answer: q.answer,
                }))}
              />
            </div>
          </div>
        ))}
      </section>

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="/contact"
        secondaryLabel={t('cta.secondaryLabel')}
        secondaryHref="/quote"
      />
    </PageLayout>
  );
}
