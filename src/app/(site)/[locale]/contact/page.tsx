import type { CSSProperties } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import ContactComposer from '@/app/components/pages/contact/ContactComposer';
import DirectChannels from '@/app/components/pages/contact/DirectChannels';

// Metadata (generateMetadata) lives in ./layout.tsx.

const delay = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * /contact — "The prompt". Every "Book a call" on the site lands here. The
 * hero and the closing band are server-rendered; the composer (the form, its
 * context meter, the generated reply and the side trace) is one client island.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Contact');

  return (
    <PageLayout>
      <div className="attn pg-contact">
        <section className="pg-hero ct-hero" aria-labelledby="ct-h1">
          <div className="attn-wrap">
            <p className="pg-kicker pg-enter" style={delay(0)}>
              {t('hero.kicker')}
            </p>
            <h1 id="ct-h1" className="pg-h1 pg-enter" style={delay(1)}>
              {t.rich('hero.title', { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="pg-lede pg-enter" style={delay(2)}>
              {t('hero.lede')}
            </p>
          </div>
        </section>

        <ContactComposer aside={<DirectChannels />} />

        <section className="ct-band" aria-labelledby="ct-band-h">
          <div className="attn-wrap ct-band-in">
            <div>
              <h2 id="ct-band-h" className="ct-band-h">
                {t('band.title')}
              </h2>
              <p>{t('band.body')}</p>
            </div>
            <div className="ct-band-links">
              <Link className="attn-btn attn-btn-secondary attn-btn-sm" href="/faq">
                {t('band.faq')}
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
