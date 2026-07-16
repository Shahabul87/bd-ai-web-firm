import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';
import { getLatestContent } from '@/app/lib/content';
import type { LatestContentItem } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Resources - Blog, Case Studies & Guides',
  description:
    'Explore our blog posts, case studies, and in-depth guides on AI-powered software development, web apps, mobile apps, and business strategy.',
  openGraph: {
    title: 'Resources | CraftsAI',
    description:
      'Blog posts, case studies, and guides on AI-powered development.',
    url: 'https://www.craftsai.org/resources',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources',
  },
};

interface Category {
  index: string;
  title: string;
  description: string;
  href: string;
}

const CATEGORIES: Category[] = [
  {
    index: '01',
    title: 'Blog',
    description: 'Insights on AI development, strategy, and technology trends.',
    href: '/resources/blog',
  },
  {
    index: '02',
    title: 'Case studies',
    description: 'Real results from our AI-powered development projects.',
    href: '/resources/case-studies',
  },
  {
    index: '03',
    title: 'Guides',
    description:
      'In-depth guides on web development, mobile apps, and choosing the right approach.',
    href: '/resources/guides',
  },
];

function typeLabel(type: LatestContentItem['type']): string {
  if (type === 'blog') return 'Blog';
  if (type === 'case-study') return 'Case study';
  return 'Guide';
}

function typeHref(item: LatestContentItem): string {
  if (item.type === 'blog') return `/resources/blog/${item.slug}`;
  if (item.type === 'case-study') return `/resources/case-studies/${item.slug}`;
  return `/resources/guides/${item.slug}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ResourcesPage() {
  const latestContent = getLatestContent(12);

  return (
    <PageLayout>
      <PageHero
        eyebrow="Resources"
        title="Field notes from the studio."
        lede="Blog posts, case studies, and guides on AI-powered development — written by the team that ships it."
      >
        <Button variant="amber" size="lg" href="/contact">
          Start a project
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="Browse by type"
          title="Three ways into the archive."
        />
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group block bg-ink-950 p-8 transition-colors duration-150 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                {cat.index}
              </span>
              <h3 className="mt-5 font-display text-2xl font-medium text-bone">{cat.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{cat.description}</p>
              <span className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                Browse
                <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="Latest"
            title="Everything we've published."
          />
          <div className="mt-14 divide-y divide-line border-y border-line">
            {latestContent.map((item) => (
              <Link
                key={`${item.type}-${item.slug}`}
                href={typeHref(item)}
                className="group grid gap-2 py-6 transition-colors duration-150 hover:bg-ink-800 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6 sm:px-2"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                  {typeLabel(item.type)}
                </span>
                <span className="text-base text-bone transition-colors duration-150 group-hover:text-signal">
                  {item.title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                  {formatDate(item.date)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
