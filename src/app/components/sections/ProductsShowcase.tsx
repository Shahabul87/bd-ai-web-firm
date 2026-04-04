import Link from 'next/link';
import Card, { CardBody } from '../ui/Card';
import Tag from '../ui/Tag';

interface Product {
  icon: string;
  name: string;
  description: string;
  platform: string;
  href: string;
}

const products: Product[] = [
  {
    icon: '\uD83E\uDDE0',
    name: 'TaxoMind',
    description:
      "AI-powered learning platform built on Bloom's Taxonomy for personalized education.",
    platform: 'Web',
    href: '/products/taxomind',
  },
  {
    icon: '\uD83C\uDFEB',
    name: 'TaxoMind Schools',
    description:
      'Institutional version of TaxoMind designed for schools and universities.',
    platform: 'Web',
    href: '/products/taxomind-schools',
  },
  {
    icon: '\uD83D\uDCB0',
    name: 'FinCoach AI',
    description:
      'AI-driven financial coaching app that helps users build better money habits.',
    platform: 'Android',
    href: '/products/fincoach-ai',
  },
  {
    icon: '\uD83D\uDCCA',
    name: 'MathPhysics',
    description:
      'Interactive math and physics learning app for grades 9-12 students.',
    platform: 'Android',
    href: '/products/mathphysics',
  },
];

export default function ProductsShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Products We&apos;ve Built &amp; Sell
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Ready-made solutions, battle-tested and production-ready
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {products.map((product) => (
            <Card key={product.name} hover>
              <CardBody>
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-label={product.name}>
                    {product.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {product.name}
                      </h3>
                      <Tag variant="primary" size="sm">
                        {product.platform}
                      </Tag>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      {product.description}
                    </p>
                    <Link
                      href={product.href}
                      className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      Learn more &rarr;
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            View all products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
