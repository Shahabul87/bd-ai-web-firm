import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Card from '@/app/design/ui/Card';
import { getAllGuides } from '@/app/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.resourcesGuides' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Guides & Whitepapers | CraftsAI',
      description:
        'In-depth guides on web development, mobile apps, and business strategy.',
      url: 'https://www.craftsai.org/resources/guides',
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: {
      canonical: 'https://www.craftsai.org/resources/guides',
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function GuidesListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources.guides');
  const guides = getAllGuides();

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        {guides.length === 0 ? (
          <p className="text-base text-steel">{t('empty')}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/resources/guides/${guide.slug}`}
                className="group block h-full focus-visible:outline-none"
              >
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    <span className="text-signal">{t('badge')}</span>
                    <span>{t('readTime', { count: guide.readTime })}</span>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-medium text-bone">{guide.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{guide.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <time
                      dateTime={guide.date}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
                    >
                      {formatDate(guide.date)}
                    </time>
                    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                      {t('readMore')}
                      <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTABand />
    </PageLayout>
  );
}
