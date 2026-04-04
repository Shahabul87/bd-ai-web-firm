'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  services: NavItem[];
  products: NavItem[];
  resources: NavItem[];
  pathname: string;
}

function MobileDropdown({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-[var(--foreground)] font-medium transition-colors hover:bg-[var(--btn-hover)]"
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
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
      </button>

      {open && (
        <div className="ml-4 space-y-0.5 border-l border-[var(--border-default)] pl-4">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'text-indigo-500 bg-[var(--btn-hover)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--btn-hover)]'
                }`}
                onClick={onClose}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MobileMenu({
  isOpen,
  onClose,
  services,
  products,
  resources,
  pathname,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const linkClasses = (href: string) => {
    const active =
      href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `block rounded-lg px-4 py-3 font-medium transition-colors ${
      active
        ? 'text-indigo-500 bg-[var(--btn-hover)]'
        : 'text-[var(--foreground)] hover:bg-[var(--btn-hover)]'
    }`;
  };

  return (
    <div className="lg:hidden absolute top-full left-0 w-full bg-[var(--nav-bg)] border-b border-[var(--border-default)] backdrop-blur-xl shadow-xl">
      <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
        <Link href="/" className={linkClasses('/')} onClick={onClose}>
          Home
        </Link>

        <MobileDropdown
          title="Services"
          items={services}
          pathname={pathname}
          onClose={onClose}
        />

        <MobileDropdown
          title="Products"
          items={products}
          pathname={pathname}
          onClose={onClose}
        />

        <MobileDropdown
          title="Resources"
          items={resources}
          pathname={pathname}
          onClose={onClose}
        />

        <Link
          href="/portfolio"
          className={linkClasses('/portfolio')}
          onClick={onClose}
        >
          Portfolio
        </Link>

        <Link
          href="/about"
          className={linkClasses('/about')}
          onClick={onClose}
        >
          About
        </Link>

        <div className="mt-3 border-t border-[var(--border-default)] pt-3">
          <Link
            href="/quote"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            onClick={onClose}
          >
            <span>Get a Quote</span>
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
        </div>
      </nav>
    </div>
  );
}
