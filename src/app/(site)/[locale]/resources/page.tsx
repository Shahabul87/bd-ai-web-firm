import type { Metadata } from 'next';
import { formatContentDate } from '@/app/lib/formatDate';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';
import { getLatestContent } from '@/app/lib/content';
import type { LatestContentItem } from '@/app/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resources' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Resources | CraftsAI',
      description:
        'Blog posts, case studies, and guides on AI-powered development.',
      ...localeOpenGraph('/resources', locale),
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: localeAlternates('/resources', locale),
  };
}

interface CategoryCopy {
  title: string;
  description: string;
}

/* Route + ornamental index live in code, keyed by a stable slug — never paired
   to translator-editable copy by array position, which a reorder could scramble. */
const CATEGORY_META: { slug: string; index: string; href: string }[] = [
  { slug: 'blog', index: '01', href: '/resources/blog' },
  { slug: 'case-studies', index: '02', href: '/resources/case-studies' },
  { slug: 'guides', index: '03', href: '/resources/guides' },
];

function typeHref(item: LatestContentItem): string {
  if (item.type === 'blog') return `/resources/blog/${item.slug}`;
  if (item.type === 'case-study') return `/resources/case-studies/${item.slug}`;
  return `/resources/guides/${item.slug}`;
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources');
  const latestContent = getLatestContent(12);

  const categoryCopy = t.raw('categories') as Record<string, CategoryCopy>;

  const typeLabel = (type: LatestContentItem['type']): string => {
    if (type === 'blog') return t('typeLabels.blog');
    if (type === 'case-study') return t('typeLabels.caseStudy');
    return t('typeLabels.guide');
  };

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      >
        <Button variant="amber" size="lg" href="/contact">
          {t('hero.primaryCta')}
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow={t('browse.eyebrow')} title={t('browse.title')} />
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {CATEGORY_META.map((cat) => {
            const copy = categoryCopy[cat.slug];
            if (!copy) {
              throw new Error(`Resources.categories: missing copy for slug "${cat.slug}"`);
            }
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group block bg-ink-950 p-8 transition-colors duration-150 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
              >
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                  {cat.index}
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium text-bone">{copy.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">{copy.description}</p>
                <span className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                  {t('browse.cta')}
                  <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader index="fig. 02" eyebrow={t('latest.eyebrow')} title={t('latest.title')} />
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
                  {formatContentDate(item.date, locale, 'short')}
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
