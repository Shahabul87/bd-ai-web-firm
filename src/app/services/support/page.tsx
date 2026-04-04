import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import Accordion from '../../components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Support & Maintenance Services | CraftsAI',
  description:
    'Ongoing support retainers with bug fixes, security patches, performance monitoring, and feature updates. 24/7 monitoring with 4-hour response time.',
  openGraph: {
    title: 'Support & Maintenance Services | CraftsAI',
    description:
      'Ongoing support retainers. Bug fixes, updates, performance monitoring.',
    url: 'https://www.craftsai.org/services/support',
  },
  alternates: { canonical: 'https://www.craftsai.org/services/support' },
};

const stats = [
  { label: 'Monitoring', value: '24/7' },
  { label: 'Response Time', value: '4hr' },
  { label: 'Uptime SLA', value: '99.9%' },
];

const tiers = [
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
    description:
      'Priority support with proactive monitoring for growing products.',
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
    description:
      'Dedicated team with SLA guarantees for mission-critical systems.',
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

const onboarding = [
  {
    step: '1',
    title: 'Audit',
    description:
      'We review your existing codebase, infrastructure, and monitoring setup to identify risks and quick wins.',
  },
  {
    step: '2',
    title: 'Setup',
    description:
      'We configure monitoring, alerting, CI/CD pipelines, and backup systems tailored to your stack.',
  },
  {
    step: '3',
    title: 'Launch',
    description:
      'Your retainer begins. You get a dedicated channel for requests and a dashboard to track every issue.',
  },
];

const faqItems = [
  {
    question: 'Can you support apps you did not build?',
    answer:
      'Yes. We regularly take over maintenance for applications built by other teams. Our onboarding audit identifies technical debt and risks so we can hit the ground running.',
  },
  {
    question: 'What technologies do you support?',
    answer:
      'We support React, Next.js, Node.js, Kotlin, Swift, PostgreSQL, MongoDB, AWS, Vercel, Firebase, and more. If your stack is not listed, ask us \u2014 we are happy to evaluate.',
  },
  {
    question: 'How does billing work?',
    answer:
      'Support retainers are billed monthly with a fixed fee based on your chosen tier. There are no surprise charges. If an issue requires work beyond the retainer scope, we provide a quote before proceeding.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Absolutely. You can change tiers at any time with 30 days notice. We will help you transition smoothly and adjust monitoring and SLA terms accordingly.',
  },
];

export default function SupportPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section
        className="py-20 md:py-28"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-indigo-500">
            <Link href="/services" className="hover:underline">
              Services
            </Link>{' '}
            / Support & Maintenance
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            Support & Maintenance
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Ongoing support retainers so your product stays fast, secure, and
            up to date &mdash; without hiring a full-time team.
          </p>

          <div className="mt-10 flex flex-wrap gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-indigo-500">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button href="/quote" size="lg">
              Get a Free Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Support Tiers
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={[
                  'rounded-xl border p-6 md:p-8',
                  tier.highlighted
                    ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)]',
                ].join(' ')}
              >
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="mt-0.5 text-emerald-500">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Is Included */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            What Is Included
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {included.map((item) => (
              <Tag key={item} variant="primary" size="md">
                {item}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Onboarding Process
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {onboarding.map((phase) => (
              <div key={phase.step}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                  {phase.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Frequently Asked Questions
          </h2>
          <div className="mt-8">
            <Accordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Ready to secure your product?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Tell us about your application and we will recommend the right
            support tier.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">
              Get a Support Quote
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
