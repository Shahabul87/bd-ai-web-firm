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
  title: 'iOS Development Services',
  description:
    'Native iOS apps with Swift and SwiftUI. Beautiful, performant, App Store ready — built by our AI agents and reviewed by senior engineers.',
  openGraph: {
    title: 'iOS Development Services',
    description: 'Native iOS apps with Swift and SwiftUI. 8x faster delivery.',
    url: 'https://www.craftsai.org/services/ios-development',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/services/ios-development',
  },
};

const useCases = [
  {
    title: 'Business Apps',
    description:
      'Enterprise tools, CRM mobile clients, and field-service apps with secure data handling.',
  },
  {
    title: 'Health & Fitness',
    description:
      "HealthKit integration, workout tracking, and telehealth features that meet HIPAA guidelines.",
  },
  {
    title: 'Fintech',
    description:
      'Secure financial apps with biometric auth, real-time data, and Apple Pay integration.',
  },
  {
    title: 'Consumer Apps',
    description:
      'Polished consumer experiences with elegant animations and seamless onboarding.',
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

const specRows: SpecRow[] = [
  {
    label: 'Scope',
    value:
      'Business, consumer, health, education, fintech, and media apps — designed for iPhone, iPad, Apple Watch, and Catalyst.',
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
      "SwiftUI views, Core Data models, networking layers, and navigation stacks — generated from your requirements, following Apple's Human Interface Guidelines.",
  },
  {
    label: 'Reviewed by engineers',
    value:
      'UX refinement, App Store compliance, and rigorous testing on every build before it reaches your users.',
  },
];

const faqItems: AccordionItem[] = [
  {
    id: 'swiftui-uikit',
    question: 'Do you build with SwiftUI or UIKit?',
    answer:
      "We use SwiftUI for all new projects because it provides a modern, declarative approach to UI development and is Apple's recommended framework going forward. For projects that need to support older iOS versions or require features not yet available in SwiftUI, we use UIKit or a hybrid approach.",
  },
  {
    id: 'app-store-submission',
    question: 'Can you submit to the App Store for us?',
    answer:
      'Yes. We manage the entire submission process including App Store Connect setup, screenshots, metadata, and review compliance. We also handle TestFlight distribution for beta testing with your team or early users.',
  },
  {
    id: 'ipad-watch',
    question: 'Do you support iPad and Apple Watch?',
    answer:
      'Absolutely. Our SwiftUI layouts adapt to iPad, Apple Watch, and even macOS via Catalyst. We design for the full Apple ecosystem from day one, so your app feels native on every device.',
  },
  {
    id: 'iap',
    question: 'What about in-app purchases and subscriptions?',
    answer:
      'StoreKit 2 is part of our standard toolkit. We implement subscriptions, consumables, and non-consumable purchases with server-side receipt validation. We also handle the App Store pricing and tax configuration.',
  },
];

export default function IOSDevelopmentPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Services / iOS"
        title="iOS Development"
        lede="Native iOS apps with Swift and SwiftUI — built by our agents and shipped fast, with senior engineers reviewing every release."
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
          description="Our agents generate SwiftUI views and data models in hours — senior engineers handle UX and App Store compliance."
        />
        <div className="mt-14">
          <Card>
            <Pipeline stages={['Brief', 'Design', 'Build', 'Review', 'Ship']} />
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
        title="Ready to build your iOS app?"
        lede="Tell us about your project. We'll come back with a plan, a timeline, and a fixed estimate."
      />
    </PageLayout>
  );
}
