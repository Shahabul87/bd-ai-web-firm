import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '#content';
import { getProductBySlug } from '@/app/lib/content';
import PageLayout from '../../components/layout/PageLayout';
import MdxContent from '../../components/mdx/MdxContent';
import { Tag } from '../../components/ui';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.title} | CraftsAI Products`,
    description: product.tagline,
    openGraph: {
      title: `${product.title} | CraftsAI`,
      description: product.tagline,
      url: `https://www.craftsai.org/products/${product.slug}`,
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.craftsai.org/products/${product.slug}`,
    },
  };
}

const platformLabels: Record<string, string> = {
  web: 'Web Platform',
  android: 'Android App',
  ios: 'iOS App',
};

const platformColors: Record<string, string> = {
  web: 'primary',
  android: 'success',
  ios: 'warning',
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20"
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
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav
            className="flex items-center space-x-2 text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Link
              href="/products"
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Products
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--foreground)' }}>
              {product.title}
            </span>
          </nav>

          {/* Title + Platforms */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
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
                size="md"
              >
                {platformLabels[p] ?? p}
              </Tag>
            ))}
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {product.title}
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {product.tagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
              >
                View Live Demo
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            {product.storeUrl && (
              <a
                href={product.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all duration-300 hover:shadow-md"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--foreground)',
                }}
              >
                Get on Play Store
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all duration-300 hover:shadow-md"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--foreground)',
              }}
            >
              Request Customization
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Features
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Everything you need, built in from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {product.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-indigo-500/30"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section
        className="py-12 sm:py-16"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 50%, var(--background) 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ color: 'var(--foreground)' }}
          >
            Tech Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {product.techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Who Is It For?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {product.useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-xl border p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-md hover:border-indigo-500/30"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: 'var(--foreground)' }}
                >
                  {useCase.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MDX Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <MdxContent code={product.content} />
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
              Interested in {product.title}?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Get in touch to learn more, request a demo, or discuss customization
              options for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
              >
                Get in Touch
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border font-medium transition-all duration-300 hover:shadow-md"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
