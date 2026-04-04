import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';

export const metadata: Metadata = {
  title: 'About CraftsAI | AI-First Software Studio',
  description:
    'Founded in 2025, CraftsAI is a Bangladesh-based software studio that combines AI agents with human engineers to deliver web, Android, and iOS products 10x faster.',
  openGraph: {
    title: 'About CraftsAI',
    description:
      'AI-first software studio delivering web, Android, and iOS products.',
    url: 'https://www.craftsai.org/about',
  },
  alternates: { canonical: 'https://www.craftsai.org/about' },
};

const stats = [
  { value: '4', label: 'Products Built' },
  { value: '3', label: 'Platforms' },
  { value: '10x', label: 'Faster Delivery' },
  { value: '80%', label: 'Cost Savings' },
];

const products = [
  {
    name: 'Banglu',
    description: 'Bengali phonetic keyboard for web and Android.',
  },
  {
    name: 'Taxomind',
    description: 'AI-powered tax preparation platform.',
  },
  {
    name: 'CraftsAI Studio',
    description: 'Internal tooling for AI-assisted development.',
  },
  {
    name: 'Client Projects',
    description: 'Custom web and mobile apps for businesses worldwide.',
  },
];

export default function AboutPage() {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            About CraftsAI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
            An AI-first software studio building web, Android, and iOS products
            at startup speed with enterprise quality.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Our Story
          </h2>
          <div className="mt-6 space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              CraftsAI was founded in 2025 with a simple thesis: most software
              development time is spent on repetitive, predictable tasks that AI
              can handle better and faster than humans.
            </p>
            <p>
              Based in Bangladesh, we built a studio around that idea. Our AI
              agents generate boilerplate code, database schemas, and component
              libraries while human engineers focus on architecture, product
              decisions, and the nuanced craft that machines cannot replicate.
            </p>
            <p>
              The result is enterprise-grade software delivered at a fraction of
              the traditional cost and timeline &mdash; without compromising on
              quality, security, or maintainability.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Our Approach
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                AI Agents
              </h3>
              <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                Our specialised AI agents &mdash; WebForge, DroidMaster, and
                iOSForge &mdash; handle the repetitive coding tasks that
                traditionally consume 60&ndash;80% of development time. They
                generate clean, typed, well-structured code from plain-English
                requirements, following best practices for each platform.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                Human Oversight
              </h3>
              <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                Every line of AI-generated code is reviewed by experienced
                engineers. They make architectural decisions, write integration
                tests, handle edge cases, and ensure the final product meets
                production standards. AI amplifies their output; it does not
                replace their judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            By The Numbers
          </h2>
          <div className="mt-10 grid gap-8 grid-cols-2 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-indigo-500">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              Our Products
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.name}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {product.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Ready to work with us?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Tell us about your project and get a free, no-obligation quote
            within 24 hours.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">
              Get a Free Quote
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
