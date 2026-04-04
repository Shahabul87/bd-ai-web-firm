'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';
import Dropdown from '../ui/Dropdown';
import MobileMenu from './MobileMenu';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const services: NavItem[] = [
  { label: 'Web Development', href: '/services/web-development', icon: '🌐' },
  {
    label: 'Android Development',
    href: '/services/android-development',
    icon: '🤖',
  },
  {
    label: 'iOS Development',
    href: '/services/ios-development',
    icon: '🍎',
  },
  { label: 'Support & Maintenance', href: '/services/support', icon: '🛡️' },
];

const products: NavItem[] = [
  { label: 'TaxoMind', href: '/products/taxomind', icon: '📚' },
  {
    label: 'TaxoMind Schools',
    href: '/products/taxomind-schools',
    icon: '🏫',
  },
  { label: 'FinCoach AI', href: '/products/fincoach-ai', icon: '💰' },
  { label: 'MathPhysics', href: '/products/mathphysics', icon: '🧮' },
];

const resources: NavItem[] = [
  { label: 'Blog', href: '/resources/blog', icon: '📝' },
  { label: 'Case Studies', href: '/resources/case-studies', icon: '📊' },
  { label: 'Guides & Whitepapers', href: '/resources/guides', icon: '📚' },
];

function toDropdownItems(items: NavItem[]) {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon ? <span>{item.icon}</span> : undefined,
  }));
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinkClasses = (href: string) =>
    `px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-[var(--btn-hover)] ${
      isActive(href)
        ? 'text-indigo-500'
        : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
    }`;

  const dropdownTriggerClasses = (prefix: string) =>
    `flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-[var(--btn-hover)] ${
      isActive(prefix)
        ? 'text-indigo-500'
        : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
    }`;

  const chevronDown = (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-default)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'py-3' : 'py-4 lg:py-5'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              CraftsAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={navLinkClasses('/')}>
              Home
            </Link>

            <Dropdown
              trigger={
                <span className={dropdownTriggerClasses('/services')}>
                  Services {chevronDown}
                </span>
              }
              items={toDropdownItems(services)}
              footerLink={{ label: 'View All Services', href: '/services' }}
            />

            <Dropdown
              trigger={
                <span className={dropdownTriggerClasses('/products')}>
                  Products {chevronDown}
                </span>
              }
              items={toDropdownItems(products)}
              footerLink={{ label: 'View All Products', href: '/products' }}
            />

            <Link href="/portfolio" className={navLinkClasses('/portfolio')}>
              Portfolio
            </Link>

            <Dropdown
              trigger={
                <span className={dropdownTriggerClasses('/resources')}>
                  Resources {chevronDown}
                </span>
              }
              items={toDropdownItems(resources)}
              footerLink={{ label: 'View All Resources', href: '/resources' }}
            />

            <Link href="/about" className={navLinkClasses('/about')}>
              About
            </Link>
          </nav>

          {/* Right side: Theme toggle + CTA + Mobile button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Get a Quote
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--btn-hover)] transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span
                  className={`block h-0.5 w-5 rounded-full bg-[var(--foreground)] transition-all duration-300 ${
                    mobileMenuOpen
                      ? 'translate-y-2 rotate-45'
                      : 'translate-y-0 rotate-0'
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-[var(--foreground)] transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-[var(--foreground)] transition-all duration-300 ${
                    mobileMenuOpen
                      ? '-translate-y-2 -rotate-45'
                      : 'translate-y-0 rotate-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        services={services}
        products={products}
        resources={resources}
        pathname={pathname}
      />
    </header>
  );
}
