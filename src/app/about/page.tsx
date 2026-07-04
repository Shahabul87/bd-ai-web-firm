import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import SectionHeader from '../design/ui/SectionHeader';
import Card from '../design/ui/Card';

export const metadata: Metadata = {
  title: 'About - AI-First Software Studio',
  description:
    'Founded in 2025, CraftsAI is a Bangladesh-based software studio that combines AI agents with human engineers to deliver web, Android, and iOS products 10x faster.',
  openGraph: {
    title: 'About CraftsAI',
    description: 'AI-first software studio delivering web, Android, and iOS products.',
    url: 'https://www.craftsai.org/about',
  },
  alternates: { canonical: 'https://www.craftsai.org/about' },
};

const STATS = [
  { value: '4', label: 'Products Built' },
  { value: '3', label: 'Platforms' },
  { value: '10x', label: 'Faster Delivery' },
  { value: '80%', label: 'Cost Savings' },
];

const PRODUCTS = [
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
      <PageHero
        eyebrow="About"
        title="An AI-first studio, built in Dhaka, shipping worldwide."
        lede="We build web, Android, and iOS products at startup speed with enterprise quality — agents write, senior engineers own every line that ships."
      />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow="Our story" title="Why we started CraftsAI." />
        <div className="mt-8 space-y-5 text-base leading-relaxed text-steel">
          <p>
            CraftsAI was founded in 2025 with a simple thesis: most software development time is
            spent on repetitive, predictable tasks that AI can handle better and faster than
            humans.
          </p>
          <p>
            Based in Bangladesh, we built a studio around that idea. Our AI agents generate
            boilerplate code, database schemas, and component libraries while human engineers
            focus on architecture, product decisions, and the nuanced craft that machines cannot
            replicate.
          </p>
          <p>
            The result is enterprise-grade software delivered at a fraction of the traditional
            cost and timeline — without compromising on quality, security, or maintainability.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="Our approach"
            title="Agents plus engineers, not agents instead of engineers."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card>
              <h3 className="font-display text-xl font-medium text-bone">AI Agents</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Our AI agents handle the repetitive coding tasks that traditionally consume most
                of development time. They generate clean, typed, well-structured code from
                plain-English requirements, following best practices for each platform.
              </p>
            </Card>
            <Card>
              <h3 className="font-display text-xl font-medium text-bone">Human Oversight</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Every line of AI-generated code is reviewed by experienced engineers. They make
                architectural decisions, write integration tests, handle edge cases, and ensure
                the final product meets production standards. AI amplifies their output; it does
                not replace their judgment.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 03" eyebrow="By the numbers" title="What that looks like in practice." />
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-ink-950 p-8 text-center">
              <p className="font-display text-4xl font-medium text-signal">{stat.value}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-steel">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader index="fig. 04" eyebrow="Our products" title="What we've built for ourselves." />
            <Link
              href="/products"
              className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <div key={product.name} className="bg-ink-950 p-6">
                <h3 className="font-display text-lg font-medium text-bone">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to work with us?"
        lede="Tell us about your project and get a free, no-obligation quote within 24 hours."
        primaryLabel="Get a free quote"
        primaryHref="/quote"
      />
    </PageLayout>
  );
}
