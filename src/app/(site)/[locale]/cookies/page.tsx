import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MonoLabel from '@/app/design/ui/MonoLabel';
import Card from '@/app/design/ui/Card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.cookies' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: 'Cookie Policy',
      description: 'How CraftsAI uses cookies and tracking technologies.',
      ...localeOpenGraph('/cookies', locale),
    },
    alternates: localeAlternates('/cookies', locale),
  };
}

type CookieType = { title: string; description: string };

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Legal.cookies');
  const cookieTypes = t.raw('cookieTypes') as CookieType[];

  return (
    <PageLayout>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>{t('sections.whatAreCookies.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.whatAreCookies.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.whatAreCookies.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.typesOfCookies.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.typesOfCookies.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.typesOfCookies.intro')}
            </p>
            <div className="mt-6 space-y-4">
              {cookieTypes.map((cookieType) => (
                <Card key={cookieType.title}>
                  <h3 className="font-display text-base font-medium text-bone">
                    {cookieType.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">
                    {cookieType.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <MonoLabel>{t('sections.managingCookies.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.managingCookies.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.managingCookies.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.updates.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              {t('sections.updates.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.updates.body')}
            </p>
          </div>

          <div>
            <MonoLabel>{t('sections.contact.label')}</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">{t('sections.contact.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              {t('sections.contact.bodyBefore')}{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>{' '}
              {t('sections.contact.bodyMiddle')}{' '}
              <Link
                href="/privacy"
                className="text-signal underline-offset-4 hover:underline"
              >
                {t('sections.contact.linkLabel')}
              </Link>{' '}
              {t('sections.contact.bodyAfter')}
            </p>
          </div>
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
