'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LOCALES = [
  { code: 'en', short: 'EN' },
  { code: 'bn', short: 'BN' },
] as const;

interface LocaleToggleProps {
  className?: string;
}

/**
 * EN/BN segmented control. Renders real anchors (not a router-push button)
 * so the switch works without JS and is crawlable. `usePathname` from
 * @/i18n/navigation returns the locale-stripped path, so switching from
 * /bn/services lands on /services rather than the homepage.
 */
export default function LocaleToggle({ className = '' }: LocaleToggleProps) {
  const active = useLocale();
  const pathname = usePathname();
  const t = useTranslations('LocaleToggle');

  return (
    <div
      className={`flex items-center border border-line ${className}`}
      role="group"
      aria-label={t('label')}
    >
      {LOCALES.map(({ code, short }) => {
        const isActive = code === active;

        if (isActive) {
          return (
            <span
              key={code}
              aria-current="true"
              className="bg-signal px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-950"
            >
              {short}
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            hrefLang={code}
            aria-label={code === 'bn' ? t('switchToBengali') : t('switchToEnglish')}
            className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            {short}
          </Link>
        );
      })}
    </div>
  );
}
