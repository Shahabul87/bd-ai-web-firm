import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import Accordion from '../../components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Web Development Services | CraftsAI',
  description:
    'Full-stack web applications built with React, Next.js, TypeScript, and modern cloud infrastructure. 10x faster delivery powered by our WebForge AI agent.',
  openGraph: {
    title: 'Web Development Services | CraftsAI',
    description:
      'Full-stack web applications built with React, Next.js, and modern cloud infrastructure.',
    url: 'https://www.craftsai.org/services/web-development',
  },
  alternates: { canonical: 'https://www.craftsai.org/services/web-development' },
};

const projectTypes = [
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
  {
    title: 'API Development',
    description:
      'RESTful and GraphQL APIs designed for performance, security, and developer experience.',
  },
  {
    title: 'Progressive Web Apps',
    description:
      'Offline-capable, installable web apps that feel native on any device.',
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

const stats = [
  { label: 'Faster Delivery', value: '10x' },
  { label: 'Cost Savings', value: '80%' },
  { label: 'Typical Timeline', value: '2-6 weeks' },
];

const faqItems = [
  {
    question: 'How does AI speed up web development?',
    answer:
      'Our WebForge AI agent generates boilerplate code, database schemas, and component scaffolding in minutes. Human engineers then review, refine, and customize everything to your exact requirements. This eliminates repetitive work and lets us focus on what makes your product unique.',
  },
  {
    question: 'Can you work with my existing codebase?',
    answer:
      'Absolutely. We regularly join projects mid-stream. Our onboarding process includes a thorough code audit, and our AI agent adapts to your existing patterns, conventions, and tech stack.',
  },
  {
    question: 'What does the delivery timeline look like?',
    answer:
      'Most web projects ship in 2 to 6 weeks depending on complexity. MVPs and prototypes can launch in as little as 2 weeks. Enterprise platforms with complex integrations typically take 4 to 6 weeks. You will receive weekly progress demos throughout.',
  },
  {
    question: 'Do you handle deployment and hosting?',
    answer:
      'Yes. We deploy to Vercel, AWS, or your preferred cloud provider. Every project includes CI/CD pipelines, monitoring, and a production-ready infrastructure setup at no extra charge.',
  },
];

export default function WebDevelopmentPage() {
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
            / Web Development
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            Web Development
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Full-stack web applications built with React, Next.js, and modern
            cloud infrastructure &mdash; delivered 10x faster with our WebForge
            AI agent.
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
                  WebForge AI
                </h3>
                <p className="text-sm text-indigo-500">Web Development Agent</p>
              </div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
              WebForge AI is our autonomous agent specialised in building modern
              web applications. It generates Next.js page structures, API routes,
              database schemas, and Tailwind component libraries from a plain-English
              brief. Human engineers review every pull request, write integration
              tests, and handle the nuanced product decisions that only people can
              make. The result: enterprise-grade software delivered at startup speed.
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
            Ready to build your web application?
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
