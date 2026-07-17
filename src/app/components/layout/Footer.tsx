'use client';

/* Client, not server, and deliberately so. PageLayout renders this Footer, and
 * PageLayout is imported by the two 'use client' pages (contact, quote) — which
 * makes everything they import a client component too. `getTranslations` is
 * server-only and throws there ("getTranslations is not supported in Client
 * Components"), so this must use the hook. That failure was invisible until the
 * spinner gate was removed from CrossPlatformWrapper (PR #7): before that, those
 * pages never rendered their tree during prerender, so the build reported 110/110
 * while /en/contact was broken. */
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import MonoLabel from '../../design/ui/MonoLabel';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';
import { toBengaliDigits } from '@/app/lib/numerals';

/** labelKey resolves within the `Footer` namespace. */
const LEGAL_LINKS = [
  { labelKey: 'privacy', href: '/privacy' },
  { labelKey: 'terms', href: '/terms' },
  { labelKey: 'cookies', href: '/cookies' },
];

export default function Footer() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Nav');
  const locale = useLocale();
  // The year is a date, so it follows the numeral convention: Bengali numerals
  // (২০২৬) on /bn, Latin on /en. Passed as a pre-formatted string so the ICU
  // message never number-formats it (which would group as "2,026").
  const year = locale === 'bn'
    ? toBengaliDigits(new Date().getFullYear())
    : String(new Date().getFullYear());
  const ticker = t('ticker');

  return (
    <footer className="border-t border-line bg-ink-950">
      {/* Marquee status ticker (CSS loop; killed globally by prefers-reduced-motion) */}
      <div className="overflow-hidden border-b border-line py-3" aria-hidden>
        <div className="marquee-track">
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {ticker.repeat(3)}
          </span>
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {ticker.repeat(3)}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-medium text-bone">
            CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel">
            {t('tagline')}
          </p>
        </div>

        <div>
          <MonoLabel>{tNav('services')}</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.index}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {tNav(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>{tNav('studio')}</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {tNav(link.labelKey)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/careers"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                {t('careers')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <MonoLabel>{tNav('contact')}</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href="mailto:hello@craftsai.org"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                hello@craftsai.org
              </a>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                {t('contactForm')}
              </Link>
            </li>
            <li>
              <Link
                href="/quote"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                {t('getEstimate')}
              </Link>
            </li>
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {t('location')}
            <br />
            {t('timezone')}
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {t('copyright', { year })}
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors duration-150 hover:text-signal"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
