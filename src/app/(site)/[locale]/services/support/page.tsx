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
import type { AccordionItem } from '@/app/design/ui/Accordion';
import type { SpecRow, SpecRowMessage } from '@/app/design/ui/SpecTable';

export const metadata: Metadata = {
  title: 'Support & Maintenance Services',
  description:
    'Ongoing support retainers with bug fixes, security patches, performance monitoring, and feature updates. 24/7 monitoring with 4-hour response time.',
  openGraph: {
    title: 'Support & Maintenance Services',
    description: 'Ongoing support retainers. Bug fixes, updates, performance monitoring.',
    url: 'https://www.craftsai.org/services/support',
  },
  alternates: { canonical: 'https://www.craftsai.org/services/support' },
};

interface Tier {
  slug: string;
  name: string;
  description: string;
  features: string[];
}

interface OnboardingPhase {
  index: string;
  title: string;
  detail: string;
}

/** Which tier gets the accent border. Presentation, so it stays out of the
 *  message file — a translator must not be able to move the highlight. */
const HIGHLIGHTED_TIER_SLUG = 'professional';

/** Chip row shared by the "Included" and "Stacks supported" spec rows. */
function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Services.support');

  const included = t.raw('included') as string[];
  const coverage = t.raw('coverage') as string[];
  const tiers = t.raw('tiers') as Tier[];
  const onboarding = t.raw('onboarding') as OnboardingPhase[];
  const faqItems = t.raw('faqItems') as AccordionItem[];

  /* Rows whose value is a rendered node rather than a string, keyed by the
     row's stable slug — never by array position, which a translator can reorder. */
  const specRowNodes: Record<string, ReactNode> = {
    included: <ChipList items={included} />,
    stacks: <ChipList items={coverage} />,
  };

  const specRows: SpecRow[] = (t.raw('specRows') as SpecRowMessage[]).map((row) => {
    const value = specRowNodes[row.slug] ?? row.value;
    if (value === undefined) {
      throw new Error(
        `Services.support.specRows: row "${row.slug}" has neither a value nor a node`,
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
          eyebrow={t('spec.eyebrow')}
          title={t('spec.title')}
        />
        <div className="mt-14">
          <SpecTable rows={specRows} />
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow={t('plans.eyebrow')}
            title={t('plans.title')}
            description={t('plans.description')}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                interactive
                className={tier.slug === HIGHLIGHTED_TIER_SLUG ? 'border-signal/60' : undefined}
              >
                <h3 className="font-display text-xl font-medium text-bone">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{tier.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-steel">
                      <span aria-hidden className="mt-0.5 font-mono text-signal">
                        +
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 03"
          eyebrow={t('onboardingSection.eyebrow')}
          title={t('onboardingSection.title')}
        />
        <ol className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {onboarding.map((phase) => (
            <li key={phase.index} className="bg-ink-950 p-6">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                {phase.index}
              </span>
              <h3 className="mt-4 font-display text-lg font-medium text-bone">{phase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{phase.detail}</p>
            </li>
          ))}
        </ol>
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
