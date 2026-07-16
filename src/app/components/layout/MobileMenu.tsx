'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '../../design/ui/Button';
import MonoLabel from '../../design/ui/MonoLabel';
import LocaleToggle from './LocaleToggle';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen blueprint overlay menu (below lg breakpoint). */
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
    <div className="blueprint-grid fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ink-950 lg:hidden">
      <nav
        ref={navRef}
        aria-label={t('mobileNavLabel')}
        tabIndex={-1}
        className="flex min-h-full flex-col gap-10 px-6 py-10 focus:outline-none"
      >
        <div>
          <MonoLabel>{tNav('services')}</MonoLabel>
          <ul className="mt-4 space-y-4">
            {SERVICE_LINKS.map((link) => (
              <li key={link.index}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-mono text-sm text-signal">{link.index}</span>
                  <span className="font-display text-2xl text-bone">{tNav(link.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>{tNav('studio')}</MonoLabel>
          <ul className="mt-4 space-y-4">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-display text-2xl text-bone"
                >
                  {tNav(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <LocaleToggle className="mt-6 w-fit" onSelect={onClose} />
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-8">
          <Button variant="signal" size="lg" href="/contact" className="w-full">
            {t('startProject')}
          </Button>
          <Button variant="ghost" size="lg" href="/quote" className="w-full">
            {t('getEstimate')}
          </Button>
          <MonoLabel className="mt-4">{t('mobileBadge')}</MonoLabel>
        </div>
      </nav>
    </div>
  );
}
