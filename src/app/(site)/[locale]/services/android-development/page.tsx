import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';
import Card from '@/app/design/ui/Card';
import SpecTable from '@/app/design/ui/SpecTable';
import Accordion from '@/app/design/ui/Accordion';
import Pipeline from '@/app/design/ui/Pipeline';
import type { AccordionItem } from '@/app/design/ui/Accordion';
import type { SpecRow, SpecRowMessage } from '@/app/design/ui/SpecTable';

export const metadata: Metadata = {
  title: 'Android Development Services',
  description:
    'Native Android apps with Kotlin and Jetpack Compose. Material Design 3, Firebase integration — built by our AI agents and reviewed by senior engineers.',
  openGraph: {
    title: 'Android Development Services',
    description: 'Native Android apps with Kotlin and Jetpack Compose. 8x faster delivery.',
    url: 'https://www.craftsai.org/services/android-development',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/services/android-development',
  },
};

interface UseCase {
  title: string;
  description: string;
}

export default async function AndroidDevelopmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Services.android');

  const techStack = t.raw('techStack') as string[];
  const useCases = t.raw('useCases') as UseCase[];
  const faqItems = t.raw('faqItems') as AccordionItem[];

  /* Rows whose value is a rendered node rather than a string, keyed by the
     row's stable slug — never by array position, which a translator can reorder. */
  const specRowNodes: Record<string, ReactNode> = {
    stack: (
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
          >
            {tech}
          </span>
        ))}
      </div>
    ),
  };

  const specRows: SpecRow[] = (t.raw('specRows') as SpecRowMessage[]).map((row) => {
    const value = specRowNodes[row.slug] ?? row.value;
    if (value === undefined) {
      throw new Error(
        `Services.android.specRows: row "${row.slug}" has neither a value nor a node`,
      );
    }
    return { label: row.label, value };
  });

  return (
    <PageLayout>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} lede={t('hero.lede')}>
        <Button variant="amber" size="lg" href="/contact">
          {t('hero.primaryCta')}
        </Button>
        <Button variant="chalk" size="lg" href="/quote">
          {t('hero.secondaryCta')}
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow={t('pipeline.eyebrow')}
          title={t('pipeline.title')}
          description={t('pipeline.description')}
        />
        <div className="mt-14">
          <Card>
            <Pipeline stages={t.raw('pipeline.stages') as string[]} />
          </Card>
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow={t('spec.eyebrow')}
            title={t('spec.title')}
          />
          <div className="mt-14">
            <SpecTable rows={specRows} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 03"
          eyebrow={t('useCasesSection.eyebrow')}
          title={t('useCasesSection.title')}
          description={t('useCasesSection.description')}
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} interactive>
              <h3 className="font-display text-lg font-medium text-bone">{useCase.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <SectionHeader index="fig. 04" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
          <div className="mt-14">
            <Accordion items={faqItems} />
          </div>
        </div>
      </section>

      <CTABand title={t('cta.title')} lede={t('cta.lede')} />
    </PageLayout>
  );
}
