import { Metadata } from 'next';
import Link from 'next/link';
import { products } from '#content';
import PageLayout from '../components/layout/PageLayout';
import { Tag } from '../components/ui';

export const metadata: Metadata = {
  title: 'Our Products | CraftsAI',
  description:
    'Ready-made solutions, battle-tested and production-ready. Explore our product lineup spanning web platforms and Android apps.',
  openGraph: {
    title: 'Our Products | CraftsAI',
    description:
      'Ready-made solutions, battle-tested and production-ready.',
    url: 'https://www.craftsai.org/products',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: { canonical: 'https://www.craftsai.org/products' },
};

const platformColors: Record<string, string> = {
  web: 'primary',
  android: 'success',
  ios: 'warning',
};

const platformLabels: Record<string, string> = {
  web: 'Web',
  android: 'Android',
  ios: 'iOS',
};

export default function ProductsPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section
        className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20"
            style={{ background: 'var(--brand-primary)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] opacity-15"
            style={{ background: 'var(--brand-secondary)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
            style={{
              background: 'var(--surface-elevated)',
              borderColor: 'var(--border-default)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Product Lineup
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span style={{ color: 'var(--foreground)' }}>Our </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Products
            </span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ready-made solutions, battle-tested and production-ready.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div
                  className="relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30 h-full"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  {/* Gradient header */}
                  <div className="relative h-36 sm:h-40 bg-gradient-to-br from-indigo-500 to-cyan-500 p-5 sm:p-6">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {product.platforms.map((p) => (
                        <Tag
                          key={p}
                          variant={
                            (platformColors[p] ?? 'default') as
                              | 'primary'
                              | 'success'
                              | 'warning'
                              | 'default'
                          }
                          size="sm"
                        >
                          {platformLabels[p] ?? p}
                        </Tag>
                      ))}
                    </div>
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                          backgroundSize: '16px 16px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <h2
                      className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {product.title}
                    </h2>
                    <p
                      className="text-sm sm:text-base mb-4 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {product.tagline}
                    </p>

                    {/* Tech stack preview */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {product.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md border text-xs"
                          style={{
                            background: 'var(--surface-elevated)',
                            borderColor: 'var(--card-border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {product.techStack.length > 4 && (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          +{product.techStack.length - 4} more
                        </span>
                      )}
                    </div>

                    <span
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500 dark:text-indigo-400 group-hover:gap-2 transition-all"
                    >
                      Learn more
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="rounded-2xl p-8 sm:p-12 border"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Need a Custom Solution?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Our products showcase what we can build. Let us create something
              tailored to your specific needs.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Get a Free Quote</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
