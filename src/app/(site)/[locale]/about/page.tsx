import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import SectionHeader from '@/app/design/ui/SectionHeader';
import Card from '@/app/design/ui/Card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.about' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'About CraftsAI',
      description: 'AI-first software studio delivering web, Android, and iOS products.',
      url: 'https://www.craftsai.org/about',
    },
    alternates: { canonical: 'https://www.craftsai.org/about' },
  };
}

interface Stat {
  value: string;
  label: string;
}

interface Product {
  name: string;
  description: string;
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');

  const stats = t.raw('stats.items') as Stat[];
  const products = t.raw('products.items') as Product[];

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow={t('story.eyebrow')} title={t('story.title')} />
        <div className="mt-8 space-y-5 text-base leading-relaxed text-steel">
          <p>{t('story.p1')}</p>
          <p>{t('story.p2')}</p>
          <p>{t('story.p3')}</p>
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow={t('approach.eyebrow')}
            title={t('approach.title')}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card>
              <h3 className="font-display text-xl font-medium text-bone">
                {t('approach.agentsTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{t('approach.agentsBody')}</p>
            </Card>
            <Card>
              <h3 className="font-display text-xl font-medium text-bone">
                {t('approach.humanTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{t('approach.humanBody')}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 03" eyebrow={t('stats.eyebrow')} title={t('stats.title')} />
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-ink-950 p-8 text-center">
              <p className="font-display text-4xl font-medium text-signal">{stat.value}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-steel">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader index="fig. 04" eyebrow={t('products.eyebrow')} title={t('products.title')} />
            <Link
              href="/products"
              className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
            >
              {t('products.viewAll')}
            </Link>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product.name} className="bg-ink-950 p-6">
                <h3 className="font-display text-lg font-medium text-bone">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        primaryHref="/quote"
      />
    </PageLayout>
  );
}
