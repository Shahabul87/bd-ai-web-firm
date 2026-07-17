'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Button from '../../design/ui/Button';
import LocaleToggle from './LocaleToggle';
import MobileMenu from './MobileMenu';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

export default function Header() {
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  // Close overlays on route change
  useEffect(() => {
    setServicesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close services dropdown on outside click / Escape
  useEffect(() => {
    if (!servicesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServicesOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [servicesOpen]);

  // Close mobile menu on Escape and return focus to the toggle
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink-950/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-medium tracking-tight text-bone">
          CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
        </Link>

        <nav aria-label={t('primaryNavLabel')} className="hidden items-center gap-8 lg:flex">
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-controls="header-services-menu"
              onClick={() => setServicesOpen((o) => !o)}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 hover:text-signal ${
                pathname.startsWith('/services') ? 'text-signal' : 'text-bone'
              }`}
            >
              {tNav('services')} {servicesOpen ? '−' : '+'}
            </button>
            {servicesOpen ? (
              <div id="header-services-menu" className="absolute left-0 top-full mt-4 w-72 border border-line bg-ink-900 p-2">
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.index}
                    href={link.href}
                    className="flex items-baseline gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-ink-800"
                  >
                    <span className="font-mono text-xs text-signal">{link.index}</span>
                    <span className="text-sm text-bone">{tNav(link.labelKey)}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 hover:text-signal ${
                pathname.startsWith(link.href) ? 'text-signal' : 'text-bone'
              }`}
            >
              {tNav(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleToggle />
          <Button variant="ghost" href="/quote">{t('getEstimate')}</Button>
          <Button variant="signal" href="/contact">{t('startProject')}</Button>
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          onClick={() => setMenuOpen((o) => !o)}
          className="font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal lg:hidden"
        >
          {menuOpen ? t('menuToggleClose') : t('menuToggleOpen')}
        </button>
      </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
