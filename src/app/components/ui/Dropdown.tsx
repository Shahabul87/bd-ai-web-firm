'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface FooterLink {
  label: string;
  href: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  footerLink?: FooterLink;
}

export default function Dropdown({ trigger, items, footerLink }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-2 shadow-lg backdrop-blur-xl">
          <div className="space-y-0.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--btn-hover)]"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && (
                  <span className="text-[var(--text-secondary)]">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {footerLink && (
            <div className="mt-2 border-t border-[var(--border-default)] pt-2">
              <Link
                href={footerLink.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-indigo-400 transition-colors duration-150 hover:bg-[var(--btn-hover)]"
                onClick={() => setIsOpen(false)}
              >
                <span>{footerLink.label}</span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
