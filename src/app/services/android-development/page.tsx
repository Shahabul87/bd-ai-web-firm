import type { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/shared/PageHero';
import CTABand from '../../components/shared/CTABand';
import Button from '../../design/ui/Button';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import SpecTable from '../../design/ui/SpecTable';
import Accordion from '../../design/ui/Accordion';
import Pipeline from '../../design/ui/Pipeline';
import type { AccordionItem } from '../../design/ui/Accordion';
import type { SpecRow } from '../../design/ui/SpecTable';

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

const useCases = [
  {
    title: 'Business Apps',
    description:
      'Internal tools, CRM integrations, and field-service apps that streamline operations.',
  },
  {
    title: 'E-Commerce Mobile',
    description:
      'Shopping apps with product catalogs, in-app payments, and push notification campaigns.',
  },
  {
    title: 'Social & Community',
    description:
      'Chat, feeds, and real-time features that keep users engaged and connected.',
  },
  {
    title: 'Health & Fitness',
    description: 'Wearable integrations, workout trackers, and telehealth experiences.',
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

const specRows: SpecRow[] = [
  {
    label: 'Scope',
    value:
      'Business, social, e-commerce, health, education, and productivity apps — responsive across phones, tablets, and foldables.',
  },
  {
    label: 'Stack',
    value: (
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
  },
  {
    label: 'Timeline',
    value: '4–8 weeks, depending on scope — roughly 8x faster and 75% cheaper than a typical agency build.',
  },
  {
    label: 'Automated by agents',
    value:
      "Kotlin modules, Compose screens, Room database entities, and Hilt dependency graphs — generated from your requirements, following Google's MVVM + Repository architecture.",
  },
  {
    label: 'Reviewed by engineers',
    value:
      'UX polish, edge-case testing, and Play Store compliance on every release before it reaches production.',
  },
];

const faqItems: AccordionItem[] = [
  {
    id: 'kotlin-java',
    question: 'Do you build with Kotlin or Java?',
    answer:
      'We build exclusively with Kotlin and Jetpack Compose for all new projects. Kotlin is the official recommended language for Android development, and Compose provides a modern, declarative UI toolkit. If you have an existing Java codebase, we can maintain it or help you migrate incrementally.',
  },
  {
    id: 'play-store',
    question: 'Can you publish to the Google Play Store?',
    answer:
      'Yes. We handle the entire release process including Play Store listing, screenshots, app signing, and compliance review. We also set up staged rollouts and crash monitoring so you can ship with confidence.',
  },
  {
    id: 'tablets-foldables',
    question: 'Do you support tablets and foldables?',
    answer:
      'Absolutely. Our Compose-based layouts are responsive by default. We test on phones, tablets, and foldable devices to ensure a great experience across the entire Android ecosystem.',
  },
  {
    id: 'offline',
    question: 'What about offline functionality?',
    answer:
      'Room database and WorkManager are part of our standard stack. We architect every app with offline-first principles so users can keep working even without an internet connection. Data syncs automatically when connectivity returns.',
  },
];

export default function AndroidDevelopmentPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Services / Android"
        title="Android Development"
        lede="Native Android apps with Kotlin and Jetpack Compose — built by our agents and shipped fast, with senior engineers reviewing every release."
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
          eyebrow="How it ships"
          title="One brief. An agent drafts the app. Engineers ship it."
          description="Our agents generate Compose screens and data layers in hours — senior engineers handle UX polish and Play Store compliance."
        />
        <div className="mt-14">
          <Card>
            <Pipeline stages={['Brief', 'Design', 'Build', 'Review', 'Release']} />
          </Card>
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="What you get"
            title="Scope, stack, and delivery — in writing."
          />
          <div className="mt-14">
            <SpecTable rows={specRows} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 03"
          eyebrow="Use cases"
          title="Where this fits."
          description="A sample of the apps we build most often — not an exhaustive list."
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
          <SectionHeader index="fig. 04" eyebrow="FAQ" title="Common questions." />
          <div className="mt-14">
            <Accordion items={faqItems} />
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to build your Android app?"
        lede="Tell us about your project. We'll come back with a plan, a timeline, and a fixed estimate."
      />
    </PageLayout>
  );
}
