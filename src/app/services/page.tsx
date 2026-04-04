import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';

const services = [
  {
    icon: '🌐',
    title: 'Web Development',
    href: '/services/web-development',
    description:
      'Full-stack web applications built with React, Next.js, and modern cloud infrastructure.',
    tags: ['React/Next.js', 'TypeScript', 'PostgreSQL', 'AWS/Vercel'],
  },
  {
    icon: '🤖',
    title: 'Android Development',
    href: '/services/android-development',
    description:
      'Native Android apps with Kotlin and Jetpack Compose. Material Design 3, Firebase.',
    tags: ['Kotlin', 'Jetpack Compose', 'Firebase', 'ML Kit'],
  },
  {
    icon: '🍎',
    title: 'iOS Development',
    href: '/services/ios-development',
    description:
      'Native iOS apps with Swift and SwiftUI. Beautiful, performant, App Store ready.',
    tags: ['Swift', 'SwiftUI', 'Core Data', 'CloudKit'],
  },
  {
    icon: '🛡️',
    title: 'Support &amp; Maintenance',
    href: '/services/support',
    description:
      'Ongoing support retainers. Bug fixes, updates, performance monitoring.',
    tags: ['Bug Fixes', 'Updates', 'Monitoring', 'SLA'],
  },
];

export default function ServicesPage() {
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
            Our Services
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
            AI-powered development for web, Android, and iOS &mdash; plus
            ongoing support
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8 transition-all duration-200 hover:shadow-md hover:border-indigo-500/30"
              >
                <span className="text-4xl" role="img" aria-label={service.title}>
                  {service.icon}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                  {service.title}
                </h2>
                <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Tag key={tag} variant="primary" size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>

                <span className="mt-6 inline-flex items-center text-sm font-medium text-indigo-500 group-hover:text-indigo-400 transition-colors">
                  Learn more &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Ready to start your project?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Tell us what you need and get a free, no-obligation quote within 24
            hours.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">
              Get a Free Quote for Your Project
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
