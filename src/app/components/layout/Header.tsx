'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleToggle from './LocaleToggle';
import MobileMenu from './MobileMenu';
import { PRIMARY_LINKS } from './nav';

export default function Header() {
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close the mobile menu on Escape and return focus to the toggle
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="chrome-header">
        <div className="attn-wrap chrome-header-in">
          <Link href="/" className="chrome-brand">
            CraftsAI
          </Link>

          <nav aria-label={t('primaryNavLabel')} className="chrome-desktop">
            <ul className="chrome-links">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                  >
                    {tNav(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <LocaleToggle className="chrome-desktop" />
          <Link href="/contact" className="attn-btn attn-btn-primary attn-btn-sm chrome-desktop">
            {t('bookCall')}
          </Link>

          <button
            ref={menuToggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen((o) => !o)}
            className="chrome-menu-toggle"
          >
            {menuOpen ? t('menuToggleClose') : t('menuToggleOpen')}
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
