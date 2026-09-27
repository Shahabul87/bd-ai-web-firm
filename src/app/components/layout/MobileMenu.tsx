'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleToggle from './LocaleToggle';
import { PRIMARY_LINKS } from './nav';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen menu below the 900px breakpoint. */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const navRef = useRef<HTMLElement>(null);

  // Lock body scroll and move focus into the overlay while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    navRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={t('mobileNavLabel')} className="chrome-menu">
      <nav ref={navRef} aria-label={t('mobileNavLabel')} tabIndex={-1}>
        <ul>
          {PRIMARY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose}>
                {tNav(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <LocaleToggle onSelect={onClose} />
        <div className="chrome-menu-foot">
          <Link href="/contact" onClick={onClose} className="attn-btn attn-btn-primary">
            {t('bookCall')}
          </Link>
          <Link href="/quote" onClick={onClose} className="attn-btn attn-btn-secondary">
            {t('getEstimate')}
          </Link>
          <p className="chrome-menu-badge">{t('mobileBadge')}</p>
        </div>
      </nav>
    </div>
  );
}
