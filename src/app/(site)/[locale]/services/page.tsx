import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { toBengaliDigits } from '@/app/lib/numerals';
import PageLayout from '@/app/components/layout/PageLayout';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import { SERVICE_KEYS, ServiceDiagram } from '@/app/components/home/ServicesIndex';
import ServiceRouter from '@/app/components/pages/services/ServiceRouter';
import ServiceRail from '@/app/components/pages/services/ServiceRail';
import type { RouterLabels, RouterPrompt } from '@/app/components/pages/services/ServiceRouter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.services' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph('/services', locale),
    },
    alternates: localeAlternates('/services', locale),
  };
}

const ENGAGEMENTS = ['sprint', 'build', 'run'] as const;
/** The platform pages under "AI inside your product". */
const PRODUCT_LINKS = [
  ['web', '/services/web-development'],
  ['android', '/services/android-development'],
  ['ios', '/services/ios-development'],
] as const;
const ROUTER_LABELS = [
  'label',
  'example',
  'chipsLabel',
  'requestLabel',
  'expertsLabel',
  'routing',
  'routedTo',
  'readSpec',
  'pause',
  'play',
] as const;

/**
 * Services — "The router". The hero is a mixture-of-experts gate that reads a
 * request and routes it to the service that fits; below it, each service has
 * a spec sheet (what you get, how we measure it, a good first step) with a
 * sticky index that follows the reader.
 */
export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Services.index');
  const tHome = await getTranslations('Home.services');
  const bn = locale === 'bn';
  const ordinal = (i: number) => {
    const n = String(i + 1).padStart(2, '0');
    return bn ? toBengaliDigits(n) : n;
  };

  const services = SERVICE_KEYS.map((key, i) => ({
    key,
    id: key,
    n: ordinal(i),
    title: tHome(`${key}.title`),
    lede: t(`catalogue.items.${key}.lede`),
    get: t.raw(`catalogue.items.${key}.get`) as string[],
    measure: t(`catalogue.items.${key}.measure`),
    first: t(`catalogue.items.${key}.first`),
  }));

  const prompts = t.raw('router.prompts') as RouterPrompt[];
  const routerLabels = Object.fromEntries(
    ROUTER_LABELS.map((k) => [k, t(`router.${k}`)]),
  ) as unknown as RouterLabels;

  return (
    <PageLayout>
      <div className="attn pg-services">
        <section className="pg-hero sv-hero" aria-labelledby="sv-hero-h">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter">{t('hero.kicker')}</p>
            <h1 className="pg-h1 pg-enter" id="sv-hero-h" style={{ '--d': 1 } as React.CSSProperties}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <div className="sv-hero-grid">
              <div className="sv-hero-copy pg-enter" style={{ '--d': 2 } as React.CSSProperties}>
                <p className="pg-lede">{t('hero.lede')}</p>
                <div className="pg-actions">
                  <Link className="attn-btn attn-btn-primary" href="/contact">
                    {t('hero.primaryCta')}
                  </Link>
                  <a className="attn-btn attn-btn-secondary" href="#specs">
                    {t('hero.secondaryCta')}
                  </a>
                </div>
              </div>
              <div className="pg-enter" style={{ '--d': 3 } as React.CSSProperties}>
                <ServiceRouter
                  prompts={prompts}
                  experts={services.map((s) => ({ id: s.id, title: s.title }))}
                  labels={routerLabels}
                  bengaliDigits={bn}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="attn-sec sv-catalogue" id="specs" aria-labelledby="sv-specs-h">
          <div className="attn-wrap">
            <InView once className="sv-cat-head">
              <h2 className="attn-sec-h pg-rise" id="sv-specs-h">
                {t('catalogue.title')}
              </h2>
              <p className="sv-cat-note pg-rise" style={{ '--d': 1 } as React.CSSProperties}>
                {t('catalogue.note')}
              </p>
            </InView>

            <div className="sv-cat-grid">
              <ServiceRail
                label={t('catalogue.railLabel')}
                items={services.map((s) => ({ id: s.id, n: s.n, title: s.title }))}
              />

              <div className="sv-specs">
                {services.map((s) => (
                  <section key={s.key} id={s.id} className="sv-spec" aria-labelledby={`sv-${s.key}-h`}>
                    <InView once className="sv-spec-in">
                      <div className="sv-spec-top">
                        <div className="sv-spec-text">
                          <span className="sv-spec-n pg-rise" aria-hidden="true">
                            {s.n}
                          </span>
                          <h3 className="pg-rise" id={`sv-${s.key}-h`} style={{ '--d': 1 } as React.CSSProperties}>
                            {s.title}
                          </h3>
                          <p className="sv-spec-lede pg-rise" style={{ '--d': 2 } as React.CSSProperties}>
                            {s.lede}
                          </p>
                          {s.key === 'product' ? (
                            <nav
                              className="pg-actions pg-rise"
                              aria-label={t('catalogue.productLinks.label')}
                              style={{ '--d': 3 } as React.CSSProperties}
                            >
                              {PRODUCT_LINKS.map(([key, href]) => (
                                <Link key={key} className="attn-btn attn-btn-secondary attn-btn-sm" href={href}>
                                  {t(`catalogue.productLinks.${key}`)}
                                </Link>
                              ))}
                            </nav>
                          ) : null}
                        </div>
                        <InView className={`sv-spec-fig sv-fig-${s.key} pg-rise`}>
                          <ServiceDiagram serviceKey={s.key} />
                        </InView>
                      </div>

                      <dl className="sv-spec-grid">
                        <div className="sv-spec-col sv-col-get pg-rise" style={{ '--d': 3 } as React.CSSProperties}>
                          <dt>{t('catalogue.get')}</dt>
                          <dd>
                            <ul>
                              {s.get.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                        <div className="sv-spec-col sv-col-measure pg-rise" style={{ '--d': 4 } as React.CSSProperties}>
                          <dt>{t('catalogue.measure')}</dt>
                          <dd>{s.measure}</dd>
                        </div>
                        <div className="sv-spec-col sv-col-first pg-rise" style={{ '--d': 5 } as React.CSSProperties}>
                          <dt>{t('catalogue.first')}</dt>
                          <dd>{s.first}</dd>
                        </div>
                      </dl>
                    </InView>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="attn-sec sv-engage" aria-labelledby="sv-engage-h">
          <div className="attn-wrap">
            <InView once>
              <h2 className="attn-sec-h pg-rise" id="sv-engage-h">
                {t('engage.title')}
              </h2>
              <p className="sv-cat-note pg-rise" style={{ '--d': 1 } as React.CSSProperties}>
                {t('engage.note')}
              </p>
              <ol className="sv-track" aria-label={t('engage.trackLabel')}>
                {ENGAGEMENTS.map((key, i) => (
                  <li key={key} className={`sv-seg sv-seg-${key}`} style={{ '--d': i } as React.CSSProperties}>
                    <span className="sv-seg-bar" aria-hidden="true">
                      <i />
                    </span>
                    <span className="sv-seg-span pg-cap">{t(`engage.items.${key}.span`)}</span>
                    <b className="sv-seg-name">{t(`engage.items.${key}.name`)}</b>
                    <p>{t(`engage.items.${key}.body`)}</p>
                    {key === 'run' ? (
                      <div className="pg-actions">
                        <Link className="attn-btn attn-btn-secondary attn-btn-sm" href="/services/support">
                          {t('engage.runLink')}
                        </Link>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </InView>
          </div>
        </section>

        <PageCTA
          id="sv-cta-h"
          title={t('cta.title')}
          lede={t('cta.lede')}
          primaryLabel={t('cta.primaryLabel')}
          secondaryLabel={t('cta.secondaryLabel')}
        />
      </div>
    </PageLayout>
  );
}
