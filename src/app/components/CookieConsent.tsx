'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'cookie-consent';

type Consent = 'granted' | 'denied';

// Minimal gtag accessor — GA is loaded (consent-default: denied) in layout.tsx.
function updateGtagConsent(value: Consent): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      analytics_storage: value,
    });
  }
}

export default function CookieConsent() {
  const t = useTranslations('Chrome.cookies');
  // Undefined = not yet read (avoids SSR/hydration flash); null = decided.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
      if (stored === 'granted') {
        updateGtagConsent('granted');
      } else if (stored !== 'denied') {
        // No decision recorded yet → show the banner.
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode / blocked) — show the banner.
      setVisible(true);
    }
  }, []);

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore storage failures */
    }
    updateGtagConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('dialogLabel')}
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] border border-line bg-ink-900/95 p-4 shadow-2xl backdrop-blur sm:left-4 sm:right-auto sm:max-w-md"
    >
      <p className="text-sm leading-relaxed text-bone">
        {t.rich('body', {
          policy: (chunks) => (
            <Link href="/cookies" className="text-signal underline-offset-4 hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => decide('granted')}
          className="min-h-[40px] flex-1 bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {t('accept')}
        </button>
        <button
          onClick={() => decide('denied')}
          className="min-h-[40px] flex-1 border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {t('decline')}
        </button>
      </div>
    </div>
  );
}
