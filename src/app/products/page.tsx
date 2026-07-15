import { Metadata } from 'next';
import Link from 'next/link';
import { products } from '#content';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import Card from '../design/ui/Card';

export const metadata: Metadata = {
  title: 'Our Products',
  description:
    'Ready-made solutions, battle-tested and production-ready. Explore our product lineup spanning web platforms and Android apps.',
  openGraph: {
    title: 'Our Products',
    description: 'Ready-made solutions, battle-tested and production-ready.',
    url: 'https://www.craftsai.org/products',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: { canonical: 'https://www.craftsai.org/products' },
};

const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  android: 'Android',
  ios: 'iOS',
  desktop: 'Desktop',
};

export default function ProductsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Products"
        title="Ready-made solutions, battle-tested and production-ready."
        lede="Our product lineup spans web platforms and Android apps, built and maintained by the same agent workflow we use for client work."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="block h-full focus-visible:outline-none"
            >
              <Card interactive className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                  {product.platforms.map((p) => (
                    <span key={p} className="border border-line px-2 py-1 text-steel">
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>

                <h2 className="mt-6 font-display text-2xl font-medium text-bone">
                  {product.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {product.tagline}
                </p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {product.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-steel"
                    >
                      {tech}
                    </span>
                  ))}
                  {product.techStack.length > 4 ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
                      +{product.techStack.length - 4} more
                    </span>
                  ) : null}
                </div>

                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                  Learn more
                  <span aria-hidden>→</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <CTABand
        title="Need a custom solution?"
        lede="Our products showcase what we can build. Let us create something tailored to your specific needs."
        primaryLabel="Get a free quote"
        primaryHref="/quote"
      />
    </PageLayout>
  );
}
