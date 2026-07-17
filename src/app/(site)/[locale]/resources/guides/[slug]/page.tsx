import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { notFound } from 'next/navigation';
import { guides } from '#content';
import { getGuideBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MdxContent from '@/app/components/mdx/MdxContent';
import ArticleJsonLd from '@/app/components/ArticleJsonLd';

interface GuideDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuideDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.excerpt,
    openGraph: {
      title: `${guide.title} | CraftsAI`,
      description: guide.excerpt,
      ...localeOpenGraph(`/resources/guides/${guide.slug}`, locale),
      siteName: 'CraftsAI',
      type: 'article',
    },
    alternates: localeAlternates(`/resources/guides/${guide.slug}`, locale),
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function GuideDetailPage({
  params,
}: GuideDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Resources.guides');
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <PageLayout>
      <ArticleJsonLd
        headline={guide.title}
        description={guide.excerpt}
        urlPath={`/resources/guides/${guide.slug}`}
        locale={locale}
        datePublished={guide.date}
      />
      <PageHero eyebrow={t('hero.eyebrow')} title={guide.title} lede={guide.excerpt} />

      <section className="border-b border-line bg-ink-950">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            <time dateTime={guide.date} className="text-signal">
              {formatDate(guide.date)}
            </time>
            <span aria-hidden>·</span>
            <span>{t('readTime', { count: guide.readTime })}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <MdxContent code={guide.content} />
        </div>
      </section>

      <CTABand
        title={t('detail.cta.title')}
        lede={t('detail.cta.lede')}
        primaryLabel={t('detail.cta.primaryLabel')}
        primaryHref="/quote"
        secondaryLabel={t('detail.cta.secondaryLabel')}
        secondaryHref="/resources/guides"
      />
    </PageLayout>
  );
}
