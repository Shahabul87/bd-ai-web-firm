'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import PageLayout from '@/app/components/layout/PageLayout';
import Button from '@/app/design/ui/Button';
import MonoLabel from '@/app/design/ui/MonoLabel';

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
      <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-6 py-24">
        <div className="text-center">
          <MonoLabel className="text-signal">{t('label')}</MonoLabel>
          <h1 className="mt-6 font-display text-5xl font-medium text-bone sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-steel">
            {t('body')}
          </p>
          {error.digest && (
            <p className="mt-4 font-mono text-xs text-steel/70">
              {t('reference')} {error.digest}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button variant="signal" size="lg" onClick={reset}>
              {t('tryAgain')}
            </Button>
            <Button variant="ghost" size="lg" href="/">
              {t('backHome')}
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
