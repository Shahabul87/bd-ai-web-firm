import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeAlternates, localeOpenGraph } from '@/app/lib/seo';
import { toBengaliDigits } from '@/app/lib/numerals';
import PageCTA from '@/app/components/pages/PageCTA';
import InView from '@/app/components/home/InView';
import BrowserStream, { type AnswerSegment, type AnswerSource, type BrowserCopy } from './BrowserStream';
import PhoneAssist, { type PhoneCopy } from './PhoneAssist';
import ProdMonitor, { type MonitorCopy } from './ProdMonitor';
import SdFaq, { type FaqItem } from './SdFaq';
import { STATIC_NOW, frameAt } from './monitor';

export type ServiceSlug = 'web' | 'android' | 'ios' | 'support';

const ROUTES: Record<ServiceSlug, { path: string; meta: string }> = {
  web: { path: '/services/web-development', meta: 'Meta.servicesWeb' },
  android: { path: '/services/android-development', meta: 'Meta.servicesAndroid' },
  ios: { path: '/services/ios-development', meta: 'Meta.servicesIos' },
  support: { path: '/services/support', meta: 'Meta.servicesSupport' },
};

export async function serviceDetailMetadata(slug: ServiceSlug, locale: string): Promise<Metadata> {
  const { path, meta } = ROUTES[slug];
  const t = await getTranslations({ locale, namespace: meta });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      ...localeOpenGraph(path, locale),
    },
    alternates: localeAlternates(path, locale),
  };
}

interface UseCase {
  title: string;
  body: string;
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * The shared template of the four service detail pages. They read as one
 * family — breadcrumb, hero, what it is, the spec trio, the stack, examples,
 * questions, the closing CTA — and each gets its own hero signature:
 * a browser whose answer streams in (web), a phone with an on-device
 * assistant in Android or iOS chrome, and a live production monitor
 * (run & improve).
 */
export default async function ServiceDetail({ slug, locale }: { slug: ServiceSlug; locale: string }) {
  const t = await getTranslations({ locale, namespace: `Services.${slug}` });
  const bn = locale === 'bn';
  const num = (i: number) => {
    const n = String(i + 1).padStart(2, '0');
    return bn ? toBengaliDigits(n) : n;
  };

  const phone = slug === 'android' || slug === 'ios';
  let figure: ReactNode;
  if (slug === 'web') {
    figure = (
      <BrowserStream
        copy={t.raw('figure') as BrowserCopy}
        answer={t.raw('figure.answer') as AnswerSegment[]}
        sources={t.raw('figure.sources') as AnswerSource[]}
        bn={bn}
      />
    );
  } else if (phone) {
    figure = <PhoneAssist platform={slug} copy={t.raw('figure') as PhoneCopy} />;
  } else {
    figure = <ProdMonitor copy={t.raw('figure') as MonitorCopy} initial={frameAt(STATIC_NOW)} bn={bn} />;
  }

  const getItems = t.raw('spec.getItems') as string[];
  const stack = t.raw('stack.items') as string[];
  const cases = t.raw('cases.items') as UseCase[];
  const faq = t.raw('faq.items') as FaqItem[];

  const noteLinks = {
    product: (chunks: ReactNode) => <Link href="/services#product">{chunks}</Link>,
    evals: (chunks: ReactNode) => <Link href="/services#evals">{chunks}</Link>,
    process: (chunks: ReactNode) => <Link href="/process">{chunks}</Link>,
  };

  return (
    <div className={`attn pg-svcdetail sd-${slug}`}>
      <section className="pg-hero sd-hero" aria-labelledby="sd-hero-h">
        <div className="attn-wrap">
          <nav className="sd-crumb pg-enter" aria-label={t('crumbLabel')}>
            <Link href="/services">
              <span aria-hidden="true" className="sd-crumb-arrow">
                ←
              </span>
              {t('back')}
            </Link>
          </nav>
          <div className={`sd-hero-grid${phone ? ' sd-hero-grid-phone' : ''}`}>
            <div className="sd-hero-copy">
              <p className="pg-kicker pg-enter" style={d(1)}>
                {t('hero.kicker')}
              </p>
              <h1 className="pg-h1 pg-enter" id="sd-hero-h" style={d(2)}>
                {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
              </h1>
              <p className="pg-lede pg-enter" style={d(3)}>
                {t('hero.lede')}
              </p>
              <div className="pg-actions pg-enter" style={d(4)}>
                <Link className="attn-btn attn-btn-primary" href="/contact">
                  {t('hero.primaryCta')}
                </Link>
                <Link className="attn-btn attn-btn-secondary" href="/quote">
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </div>
            <div className="sd-hero-fig pg-enter" style={d(3)}>
              {figure}
            </div>
          </div>
        </div>
      </section>

      <section className="attn-sec sd-what" aria-labelledby="sd-what-h">
        <div className="attn-wrap">
          <InView once className="sd-what-grid">
            <h2 className="sd-label pg-rise" id="sd-what-h">
              {t('what.title')}
            </h2>
            <div>
              <p className="sd-what-body pg-rise" style={d(1)}>
                {t('what.body')}
              </p>
              <p className="sd-what-note pg-rise" style={d(2)}>
                <i aria-hidden="true" />
                <span>{t.rich('what.note', noteLinks)}</span>
              </p>
            </div>
          </InView>
        </div>
      </section>

      <section className="attn-sec sd-spec" aria-labelledby="sd-spec-h">
        <div className="attn-wrap">
          <InView once>
            <h2 className="attn-sec-h pg-rise" id="sd-spec-h">
              {t('spec.title')}
            </h2>
            <dl className="sd-spec-grid">
              <div className="sd-spec-col sd-col-get pg-rise" style={d(1)}>
                <dt>{t('spec.get')}</dt>
                <dd>
                  <ul>
                    {getItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="sd-spec-col sd-col-measure pg-rise" style={d(2)}>
                <dt>{t('spec.measure')}</dt>
                <dd>{t('spec.measureBody')}</dd>
              </div>
              <div className="sd-spec-col sd-col-first pg-rise" style={d(3)}>
                <dt>{t('spec.first')}</dt>
                <dd>{t('spec.firstBody')}</dd>
              </div>
            </dl>
          </InView>
        </div>
      </section>

      <section className="attn-sec sd-stack" aria-labelledby="sd-stack-h">
        <div className="attn-wrap">
          <InView once className="sd-stack-grid">
            <div>
              <h2 className="sd-label pg-rise" id="sd-stack-h">
                {t('stack.title')}
              </h2>
              <p className="sd-note pg-rise" style={d(1)}>
                {t('stack.note')}
              </p>
            </div>
            <ul className="sd-chips">
              {stack.map((item, i) => (
                <li key={item} style={{ '--i': i } as CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </InView>
        </div>
      </section>

      <section className="attn-sec sd-cases" aria-labelledby="sd-cases-h">
        <div className="attn-wrap">
          <InView once>
            <h2 className="attn-sec-h pg-rise" id="sd-cases-h">
              {t('cases.title')}
            </h2>
            <p className="sd-note sd-cases-note pg-rise" style={d(1)}>
              {t('cases.note')}
            </p>
            <ol className="sd-case-list">
              {cases.map((c, i) => (
                <li key={c.title} className="sd-case pg-rise" style={d(i + 2)}>
                  <span className="sd-case-top pg-cap">
                    <span className="sd-case-n" aria-hidden="true">
                      {num(i)}
                    </span>
                    {t('cases.example')}
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </li>
              ))}
            </ol>
          </InView>
        </div>
      </section>

      <section className="attn-sec sd-faq" aria-labelledby="sd-faq-h">
        <div className="attn-wrap sd-faq-grid">
          <h2 className="attn-sec-h" id="sd-faq-h">
            {t('faq.title')}
          </h2>
          <SdFaq items={faq} idBase={`sd-faq-${slug}`} />
        </div>
      </section>

      <PageCTA
        id="sd-cta-h"
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        secondaryLabel={t('cta.secondaryLabel')}
      />
    </div>
  );
}
