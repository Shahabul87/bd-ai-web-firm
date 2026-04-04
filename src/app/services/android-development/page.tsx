import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import Accordion from '../../components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Android Development Services | CraftsAI',
  description:
    'Native Android apps with Kotlin and Jetpack Compose. Material Design 3, Firebase integration. 8x faster delivery powered by our DroidMaster AI agent.',
  openGraph: {
    title: 'Android Development Services | CraftsAI',
    description:
      'Native Android apps with Kotlin and Jetpack Compose. 8x faster delivery.',
    url: 'https://www.craftsai.org/services/android-development',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/services/android-development',
  },
};

const projectTypes = [
  {
    title: 'Business Apps',
    description:
      'Internal tools, CRM integrations, and field-service apps that streamline operations.',
  },
  {
    title: 'Social &amp; Community',
    description:
      'Chat, feeds, and real-time features that keep users engaged and connected.',
  },
  {
    title: 'E-Commerce Mobile',
    description:
      'Shopping apps with product catalogs, in-app payments, and push notification campaigns.',
  },
  {
    title: 'Health &amp; Fitness',
    description:
      'Wearable integrations, workout trackers, and telehealth experiences.',
  },
  {
    title: 'Education',
    description:
      'Interactive learning apps with offline support, progress tracking, and gamification.',
  },
  {
    title: 'Productivity',
    description:
      'Task managers, note-taking tools, and workflow automation with widget support.',
  },
];

const techStack = [
  'Kotlin',
  'Jetpack Compose',
  'Material Design 3',
  'Firebase',
  'Room DB',
  'Retrofit',
  'ML Kit',
  'Google Play Services',
  'Coroutines',
  'Hilt',
];

const stats = [
  { label: 'Faster Delivery', value: '8x' },
  { label: 'Cost Savings', value: '75%' },
  { label: 'Typical Timeline', value: '4-8 weeks' },
];

const faqItems = [
  {
    question: 'Do you build with Kotlin or Java?',
    answer:
      'We build exclusively with Kotlin and Jetpack Compose for all new projects. Kotlin is the official recommended language for Android development, and Compose provides a modern, declarative UI toolkit. If you have an existing Java codebase, we can maintain it or help you migrate incrementally.',
  },
  {
    question: 'Can you publish to the Google Play Store?',
    answer:
      'Yes. We handle the entire release process including Play Store listing, screenshots, app signing, and compliance review. We also set up staged rollouts and crash monitoring so you can ship with confidence.',
  },
  {
    question: 'Do you support tablets and foldables?',
    answer:
      'Absolutely. Our Compose-based layouts are responsive by default. We test on phones, tablets, and foldable devices to ensure a great experience across the entire Android ecosystem.',
  },
  {
    question: 'What about offline functionality?',
    answer:
      'Room database and WorkManager are part of our standard stack. We architect every app with offline-first principles so users can keep working even without an internet connection. Data syncs automatically when connectivity returns.',
  },
];

export default function AndroidDevelopmentPage() {
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
            / Android Development
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            Android Development
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Native Android apps with Kotlin and Jetpack Compose &mdash;
            delivered 8x faster with our DroidMaster AI agent.
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
                  DroidMaster AI
                </h3>
                <p className="text-sm text-indigo-500">
                  Android Development Agent
                </p>
              </div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
              DroidMaster AI generates Kotlin modules, Compose screens, Room
              database entities, and Hilt dependency graphs from your
              requirements. It follows Google&apos;s recommended architecture
              (MVVM + Repository pattern) and produces idiomatic Kotlin code.
              Human engineers handle UX polish, edge-case testing, and Play Store
              compliance so every release meets production standards.
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
            Ready to build your Android app?
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
