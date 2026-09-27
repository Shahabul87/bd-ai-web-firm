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
import LocaleToggle from './LocaleToggle';
import { FOOTER_LINKS, PRIMARY_LINKS } from './nav';
import { toBengaliDigits } from '@/app/lib/numerals';

/** labelKey resolves within the `Footer` namespace. */
const LEGAL_LINKS = [
  { labelKey: 'privacy', href: '/privacy' },
  { labelKey: 'terms', href: '/terms' },
  { labelKey: 'cookies', href: '/cookies' },
];

const CONTACT_EMAIL = 'hello@craftsai.org';

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

  return (
    <footer className="chrome-footer">
      <div className="attn-wrap chrome-footer-in">
        <div>
          <Link href="/" className="chrome-brand">
            CraftsAI
          </Link>
          <p>{t('tagline')}</p>
        </div>
        <div className="chrome-footer-contact">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <Link href="/quote">{t('getEstimate')}</Link>
          <LocaleToggle />
        </div>
        <div className="chrome-footer-bot">
          <nav aria-label={t('footerNavLabel')}>
            <ul>
              {[...PRIMARY_LINKS, { labelKey: 'careers', href: '/careers' }, ...FOOTER_LINKS].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.labelKey === 'careers' ? t('careers') : tNav(link.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="chrome-footer-legal">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{t(link.labelKey)}</Link>
              </li>
            ))}
            <li>{t('copyright', { year })}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
