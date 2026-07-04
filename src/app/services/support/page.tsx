import type { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/shared/PageHero';
import CTABand from '../../components/shared/CTABand';
import Button from '../../design/ui/Button';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import SpecTable from '../../design/ui/SpecTable';
import Accordion from '../../design/ui/Accordion';
import type { AccordionItem } from '../../design/ui/Accordion';
import type { SpecRow } from '../../design/ui/SpecTable';

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
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Basic',
    description: 'Bug fixes and routine updates for smaller applications.',
    features: [
      'Bug fixes within 48 hours',
      'Dependency updates',
      'Monthly health report',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    description: 'Priority support with proactive monitoring for growing products.',
    features: [
      'Bug fixes within 24 hours',
      'Performance monitoring',
      'Security patches',
      'Weekly health reports',
      'WhatsApp & email support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Dedicated team with SLA guarantees for mission-critical systems.',
    features: [
      '4-hour response SLA',
      '24/7 monitoring & alerting',
      'Dedicated support engineer',
      'Quarterly architecture reviews',
      'Priority feature development',
      'Custom SLA terms',
    ],
  },
];

const included = [
  'Bug Fixes',
  'Security Patches',
  'Performance Monitoring',
  'Feature Updates',
  'Database Maintenance',
  'Backup Management',
];

const coverage = [
  'React',
  'Next.js',
  'Node.js',
  'Kotlin',
  'Swift',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Vercel',
  'Firebase',
];

const specRows: SpecRow[] = [
  {
    label: 'Monitoring',
    value: '24/7 automated monitoring and alerting, with a 4-hour response SLA on Enterprise.',
  },
  {
    label: 'Uptime SLA',
    value: '99.9% — backed by quarterly architecture reviews on Enterprise plans.',
  },
  {
    label: 'Included',
    value: (
      <div className="flex flex-wrap gap-2">
        {included.map((item) => (
          <span
            key={item}
            className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
          >
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: 'Stacks supported',
    value: (
      <div className="flex flex-wrap gap-2">
        {coverage.map((tech) => (
          <span
            key={tech}
            className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
          >
            {tech}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: 'Billing',
    value:
      'A fixed monthly fee per tier — no surprise charges. Work beyond retainer scope is quoted before we proceed. Change tiers any time with 30 days notice.',
  },
];

const onboarding = [
  {
    index: '01',
    title: 'Audit',
    detail:
      'We review your existing codebase, infrastructure, and monitoring setup to identify risks and quick wins.',
  },
  {
    index: '02',
    title: 'Setup',
    detail:
      'We configure monitoring, alerting, CI/CD pipelines, and backup systems tailored to your stack.',
  },
  {
    index: '03',
    title: 'Launch',
    detail:
      'Your retainer begins. You get a dedicated channel for requests and a dashboard to track every issue.',
  },
];

const faqItems: AccordionItem[] = [
  {
    id: 'other-teams',
    question: 'Can you support apps you did not build?',
    answer:
      'Yes. We regularly take over maintenance for applications built by other teams. Our onboarding audit identifies technical debt and risks so we can hit the ground running.',
  },
  {
    id: 'technologies',
    question: 'What technologies do you support?',
    answer:
      'We support React, Next.js, Node.js, Kotlin, Swift, PostgreSQL, MongoDB, AWS, Vercel, Firebase, and more. If your stack is not listed, ask us — we are happy to evaluate.',
  },
  {
    id: 'billing',
    question: 'How does billing work?',
    answer:
      'Support retainers are billed monthly with a fixed fee based on your chosen tier. There are no surprise charges. If an issue requires work beyond the retainer scope, we provide a quote before proceeding.',
  },
  {
    id: 'change-plan',
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Absolutely. You can change tiers at any time with 30 days notice. We will help you transition smoothly and adjust monitoring and SLA terms accordingly.',
  },
];

export default function SupportPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Services / Support"
        title="Support & Maintenance"
        lede="Ongoing support retainers so your product stays fast, secure, and up to date — without hiring a full-time team."
      >
        <Button variant="amber" size="lg" href="/contact">
          Start a project
        </Button>
        <Button variant="chalk" size="lg" href="/quote">
          Get an estimate
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="Snapshot"
          title="Coverage, response time, and billing — in writing."
        />
        <div className="mt-14">
          <SpecTable rows={specRows} />
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="Plans"
            title="Choose your tier."
            description="Every tier is a monthly retainer. Upgrade, downgrade, or cancel with 30 days notice."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                interactive
                className={tier.highlighted ? 'border-signal/60' : undefined}
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
          eyebrow="Onboarding"
          title="Three steps to your first retainer month."
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
          <SectionHeader index="fig. 04" eyebrow="FAQ" title="Common questions." />
          <div className="mt-14">
            <Accordion items={faqItems} />
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to secure your product?"
        lede="Tell us about your application and we'll recommend the right support tier."
      />
    </PageLayout>
  );
}
