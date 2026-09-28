import type { CSSProperties } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import QuoteWizard from '@/app/components/pages/quote/QuoteWizard';

// Metadata (generateMetadata) lives in ./layout.tsx.

const delay = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * /quote — "The estimate, computed". The footer's "Get an estimate" lands
 * here. The hero and the closing band are server-rendered; the wizard (the
 * pipeline rail, the steps, the live spec file and the reply) is one client
 * island that posts to /api/quote.
 */
export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Quote');

  return (
    <PageLayout>
      <div className="attn pg-quote">
        <section className="pg-hero qt-hero" aria-labelledby="qt-h1">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter" style={delay(0)}>
              {t('hero.kicker')}
            </p>
            <h1 id="qt-h1" className="pg-h1 pg-enter" style={delay(1)}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="pg-lede pg-enter" style={delay(2)}>
              {t('hero.lede')}
            </p>
          </div>
        </section>

        <QuoteWizard />

        <section className="qt-band" aria-labelledby="qt-band-h">
          <div className="attn-wrap qt-band-in">
            <div>
              <h2 id="qt-band-h" className="qt-band-h">
                {t('band.title')}
              </h2>
              <p>{t('band.body')}</p>
            </div>
            <div className="qt-band-links">
              <Link className="attn-btn attn-btn-primary attn-btn-sm" href="/contact">
                {t('band.call')}
              </Link>
              <Link className="attn-btn attn-btn-secondary attn-btn-sm" href="/process">
                {t('band.process')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
