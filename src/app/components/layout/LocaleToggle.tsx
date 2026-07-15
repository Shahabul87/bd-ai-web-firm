'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LOCALES = [
  { code: 'en', short: 'EN' },
  { code: 'bn', short: 'BN' },
] as const;

interface LocaleToggleProps {
  className?: string;
  /**
   * Fired when the visitor picks the other locale. MobileMenu passes its
   * `onClose` here: Header closes the overlay from a `[pathname]` effect, but
   * that pathname is locale-STRIPPED, so it is identical either side of a
   * switch and the effect never re-fires — the overlay would stay up over the
   * newly translated page. Every other link in MobileMenu closes it explicitly
   * the same way. Header's desktop cluster has no overlay and omits this.
   */
  onSelect?: () => void;
}

/**
 * EN/BN segmented control. Renders real anchors (not a router-push button)
 * so the switch works without JS and is crawlable. `usePathname` from
 * @/i18n/navigation returns the locale-stripped path, so switching from
 * /bn/services lands on /services rather than the homepage.
 */
export default function LocaleToggle({ className = '', onSelect }: LocaleToggleProps) {
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
            onClick={onSelect}
            aria-label={code === 'bn' ? t('switchToBengali') : t('switchToEnglish')}
            className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {short}
          </Link>
        );
      })}
    </div>
  );
}
