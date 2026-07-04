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
  title: 'Web Development Services',
  description:
    'Full-stack web applications built with React, Next.js, TypeScript, and modern cloud infrastructure — built by our AI agents and reviewed by senior engineers.',
  openGraph: {
    title: 'Web Development Services',
    description:
      'Full-stack web applications built with React, Next.js, and modern cloud infrastructure.',
    url: 'https://www.craftsai.org/services/web-development',
  },
  alternates: { canonical: 'https://www.craftsai.org/services/web-development' },
};

const useCases = [
  {
    title: 'SaaS Platforms',
    description:
      'Multi-tenant applications with subscription billing, user management, and analytics dashboards.',
  },
  {
    title: 'E-Commerce',
    description:
      'Online stores with inventory management, payment processing, and order fulfillment.',
  },
  {
    title: 'Enterprise Dashboards',
    description:
      'Data-rich dashboards with real-time charts, role-based access, and reporting tools.',
  },
  {
    title: 'MVPs & Prototypes',
    description:
      'Rapid prototypes to validate your idea and attract funding in weeks, not months.',
  },
];

const techStack = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Vercel',
  'Docker',
  'GraphQL',
  'REST APIs',
  'Tailwind CSS',
];

const specRows: SpecRow[] = [
  {
    label: 'Scope',
    value:
      'SaaS platforms, e-commerce, enterprise dashboards, MVPs, APIs, and progressive web apps — full-stack, schema to deploy.',
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
    value: '2–6 weeks, depending on scope — roughly 10x faster and 80% cheaper than a typical agency build.',
  },
  {
    label: 'Automated by agents',
    value:
      'Next.js page structures, API routes, database schemas, and Tailwind component libraries, generated from a plain-English brief.',
  },
  {
    label: 'Reviewed by engineers',
    value:
      'Every pull request, integration test, and product decision that only a person can make — before anything ships.',
  },
];

const faqItems: AccordionItem[] = [
  {
    id: 'ai-speed',
    question: 'How does AI speed up web development?',
    answer:
      'Our agents generate boilerplate code, database schemas, and component scaffolding in minutes. Human engineers then review, refine, and customize everything to your exact requirements. This eliminates repetitive work and lets us focus on what makes your product unique.',
  },
  {
    id: 'existing-codebase',
    question: 'Can you work with my existing codebase?',
    answer:
      'Absolutely. We regularly join projects mid-stream. Our onboarding process includes a thorough code audit, and our AI agent adapts to your existing patterns, conventions, and tech stack.',
  },
  {
    id: 'timeline',
    question: 'What does the delivery timeline look like?',
    answer:
      'Most web projects ship in 2 to 6 weeks depending on complexity. MVPs and prototypes can launch in as little as 2 weeks. Enterprise platforms with complex integrations typically take 4 to 6 weeks. You will receive weekly progress demos throughout.',
  },
  {
    id: 'deployment',
    question: 'Do you handle deployment and hosting?',
    answer:
      'Yes. We deploy to Vercel, AWS, or your preferred cloud provider. Every project includes CI/CD pipelines, monitoring, and a production-ready infrastructure setup at no extra charge.',
  },
];

export default function WebDevelopmentPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Services / Web"
        title="Web Development"
        lede="Full-stack web applications built with React, Next.js, and modern cloud infrastructure — built by our agents and shipped fast, with senior engineers reviewing every release."
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
          title="One brief. An agent scaffolds it. Engineers ship it."
          description="Our agents turn your requirements into a working codebase in hours — senior engineers take it from there."
        />
        <div className="mt-14">
          <Card>
            <Pipeline stages={['Brief', 'Scaffold', 'Build', 'Review', 'Ship']} />
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
          description="A sample of the products we build most often — not an exhaustive list."
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
        title="Ready to build your web application?"
        lede="Tell us about your project. We'll come back with a plan, a timeline, and a fixed estimate."
      />
    </PageLayout>
  );
}
