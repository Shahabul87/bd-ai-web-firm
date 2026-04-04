import Link from 'next/link';
import Card, { CardBody } from '../ui/Card';
import Tag from '../ui/Tag';

interface Resource {
  type: string;
  typeVariant: 'primary' | 'success' | 'warning';
  title: string;
  readTime: string;
  href: string;
}

const resources: Resource[] = [
  {
    type: 'Blog',
    typeVariant: 'primary',
    title: 'How AI Agents Are Changing Software Development in 2026',
    readTime: '5 min read',
    href: '/resources/blog/ai-agents-software-development',
  },
  {
    type: 'Case Study',
    typeVariant: 'success',
    title: 'How TaxoMind Achieved 10x Faster Content Generation',
    readTime: '8 min read',
    href: '/resources/case-studies/taxomind',
  },
  {
    type: 'Guide',
    typeVariant: 'warning',
    title: 'The Complete Guide to AI-Powered App Development',
    readTime: '12 min read',
    href: '/resources/guides/ai-powered-development',
  },
];

export default function ResourcesPreview() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Insights &amp; Resources
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {resources.map((resource) => (
            <Card key={resource.title} hover>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <Tag variant={resource.typeVariant} size="sm">
                    {resource.type}
                  </Tag>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {resource.readTime}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-3 leading-snug">
                  {resource.title}
                </h3>
                <Link
                  href={resource.href}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Read more &rarr;
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link
            href="/resources"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            View all resources &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
