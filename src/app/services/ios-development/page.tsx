import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import Accordion from '../../components/ui/Accordion';

export const metadata: Metadata = {
  title: 'iOS Development Services | CraftsAI',
  description:
    'Native iOS apps with Swift and SwiftUI. Beautiful, performant, App Store ready. 8x faster delivery powered by our iOSForge AI agent.',
  openGraph: {
    title: 'iOS Development Services | CraftsAI',
    description:
      'Native iOS apps with Swift and SwiftUI. 8x faster delivery.',
    url: 'https://www.craftsai.org/services/ios-development',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/services/ios-development',
  },
};

const projectTypes = [
  {
    title: 'Business Apps',
    description:
      'Enterprise tools, CRM mobile clients, and field-service apps with secure data handling.',
  },
  {
    title: 'Consumer Apps',
    description:
      'Polished consumer experiences with elegant animations and seamless onboarding.',
  },
  {
    title: 'Health & Fitness',
    description:
      'HealthKit integration, workout tracking, and telehealth features that meet HIPAA guidelines.',
  },
  {
    title: 'Education',
    description:
      'Interactive learning apps with offline content, progress tracking, and in-app purchases.',
  },
  {
    title: 'Fintech',
    description:
      'Secure financial apps with biometric auth, real-time data, and Apple Pay integration.',
  },
  {
    title: 'Media & Entertainment',
    description:
      'Streaming, social sharing, and content creation tools optimised for the Apple ecosystem.',
  },
];

const techStack = [
  'Swift',
  'SwiftUI',
  'UIKit',
  'Core Data',
  'CloudKit',
  'Combine',
  'MapKit',
  'HealthKit',
  'StoreKit',
  'Core ML',
];

const stats = [
  { label: 'Faster Delivery', value: '8x' },
  { label: 'Cost Savings', value: '75%' },
  { label: 'Typical Timeline', value: '4-8 weeks' },
];

const faqItems = [
  {
    question: 'Do you build with SwiftUI or UIKit?',
    answer:
      'We use SwiftUI for all new projects because it provides a modern, declarative approach to UI development and is Apple\u2019s recommended framework going forward. For projects that need to support older iOS versions or require features not yet available in SwiftUI, we use UIKit or a hybrid approach.',
  },
  {
    question: 'Can you submit to the App Store for us?',
    answer:
      'Yes. We manage the entire submission process including App Store Connect setup, screenshots, metadata, and review compliance. We also handle TestFlight distribution for beta testing with your team or early users.',
  },
  {
    question: 'Do you support iPad and Apple Watch?',
    answer:
      'Absolutely. Our SwiftUI layouts adapt to iPad, Apple Watch, and even macOS via Catalyst. We design for the full Apple ecosystem from day one, so your app feels native on every device.',
  },
  {
    question: 'What about in-app purchases and subscriptions?',
    answer:
      'StoreKit 2 is part of our standard toolkit. We implement subscriptions, consumables, and non-consumable purchases with server-side receipt validation. We also handle the App Store pricing and tax configuration.',
  },
];

export default function IOSDevelopmentPage() {
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
            / iOS Development
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            iOS Development
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Native iOS apps with Swift and SwiftUI &mdash; delivered 8x faster
            with our iOSForge AI agent.
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

      {/* What We Build */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            What We Build
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectTypes.map((project) => (
              <div
                key={project.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Tech Stack
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <Tag key={tech} variant="primary" size="md">
                {tech}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            How Our AI Agent Works
          </h2>
          <div className="mt-8 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  iOSForge AI
                </h3>
                <p className="text-sm text-indigo-500">iOS Development Agent</p>
              </div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
              iOSForge AI generates SwiftUI views, Core Data models, networking
              layers, and navigation stacks from your requirements. It follows
              Apple&apos;s Human Interface Guidelines and produces clean,
              idiomatic Swift code. Human engineers refine the UX, handle App
              Store compliance, and ensure every build passes rigorous testing
              before it reaches your users.
            </p>
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
            Ready to build your iOS app?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Tell us about your project and get a free quote within 24 hours.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">
              Start Your Project
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
