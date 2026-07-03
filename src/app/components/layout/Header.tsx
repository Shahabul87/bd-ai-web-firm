'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../../design/ui/Button';
import MobileMenu from './MobileMenu';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

export default function Header() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink-950/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-medium tracking-tight text-bone">
          CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
              onClick={() => setServicesOpen((o) => !o)}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 hover:text-signal ${
                pathname.startsWith('/services') ? 'text-signal' : 'text-bone'
              }`}
            >
              Services {servicesOpen ? '−' : '+'}
            </button>
            {servicesOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-full mt-4 w-72 border border-line bg-ink-900 p-2"
              >
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.index}
                    role="menuitem"
                    href={link.href}
                    className="flex items-baseline gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-ink-800"
                  >
                    <span className="font-mono text-xs text-signal">{link.index}</span>
                    <span className="text-sm text-bone">{link.label}</span>
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
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" href="/quote">Get estimate</Button>
          <Button variant="signal" href="/contact">Start a project</Button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
          className="font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal lg:hidden"
        >
          {menuOpen ? 'Close ×' : 'Menu ≡'}
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
