'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';

/**
 * Error boundary — "Something failed its eval." A calm eval-run line (the
 * step, and a rose "failed" verdict) with retry and home.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // This boundary catches errors thrown by the page it wraps, not by the
  // sibling layout that mounts NextIntlClientProvider — so whenever this
  // renders, the provider is already mounted and useTranslations is safe.
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    // Log to the server console / monitoring. `digest` correlates with the
    // server-side stack trace without exposing it to the visitor.
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <PageLayout>
      <div className="attn pg-system">
        <section className="sy-main sy-error" aria-labelledby="sy-err-h">
          <div className="attn-wrap sy-narrow">
            <p className="pg-kicker sy-kicker sy-kicker-rose pg-enter">{t('label')}</p>
            <h1 id="sy-err-h" className="pg-h1 sy-h1 pg-enter" style={{ '--d': 1 } as React.CSSProperties}>
              {t('title')}
            </h1>
            <p className="pg-lede pg-enter" style={{ '--d': 2 } as React.CSSProperties}>
              {t('body')}
            </p>
            <div className="sy-run pg-panel pg-enter" style={{ '--d': 2 } as React.CSSProperties}>
              <span className="sy-run-l pg-cap">{t('evalLabel')}</span>
              <span className="sy-run-step">{t('evalStep')}</span>
              <span className="sy-run-bar" aria-hidden="true">
                <i />
              </span>
              <span className="sy-run-v">{t('evalResult')}</span>
            </div>
            {error.digest ? (
              <p className="sy-ref pg-cap">
                {t('reference')} <code>{error.digest}</code>
              </p>
            ) : null}
            <div className="pg-actions pg-enter" style={{ '--d': 3 } as React.CSSProperties}>
              <button type="button" className="attn-btn attn-btn-primary" onClick={reset}>
                {t('tryAgain')}
              </button>
              <Link className="attn-btn attn-btn-secondary" href="/">
                {t('backHome')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
