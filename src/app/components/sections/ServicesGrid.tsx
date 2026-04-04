import Link from 'next/link';
import Card, { CardBody } from '../ui/Card';
import Tag from '../ui/Tag';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
}

const services: ServiceItem[] = [
  {
    icon: '\uD83C\uDF10',
    title: 'Web Apps',
    description:
      'Full-stack web applications with modern frameworks, optimized for performance and scalability.',
    tags: ['React', 'Next.js', 'Full-Stack'],
    href: '/services/web-development',
  },
  {
    icon: '\uD83E\uDD16',
    title: 'Android Apps',
    description:
      'Native Android applications built with modern tooling and Material Design principles.',
    tags: ['Kotlin', 'Jetpack Compose'],
    href: '/services/android-development',
  },
  {
    icon: '\uD83C\uDF4E',
    title: 'iOS Apps',
    description:
      'Polished iOS applications with native performance and seamless user experience.',
    tags: ['Swift', 'SwiftUI'],
    href: '/services/ios-development',
  },
  {
    icon: '\uD83D\uDEE1\uFE0F',
    title: 'Support',
    description:
      'Ongoing maintenance, performance monitoring, and dedicated support retainers.',
    tags: ['Maintenance', 'Retainers'],
    href: '/services/support',
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            What We Build
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Custom software powered by AI, delivered by experts
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} hover>
              <CardBody className="flex flex-col h-full">
                <span className="text-3xl mb-4" role="img" aria-label={service.title}>
                  {service.icon}
                </span>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.tags.map((tag) => (
                    <Tag key={tag} variant="primary" size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <Link
                  href={service.href}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Learn more &rarr;
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
