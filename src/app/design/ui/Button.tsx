import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';

type ButtonVariant = 'signal' | 'ghost' | 'link' | 'amber' | 'chalk';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  signal: 'bg-signal text-ink-950 hover:bg-signal-dim',
  ghost: 'border border-line text-bone hover:border-signal hover:text-signal',
  link: 'text-signal underline-offset-4 hover:underline',
  // For use on the drafting-blue surface (PageHero, hero, blueprint bands).
  amber: 'bg-amber text-ink-950 hover:opacity-90',
  chalk: 'border border-[#EDEDE3]/45 text-[#EDEDE3] hover:border-amber hover:text-amber',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'px-5 py-2.5 text-xs',
  lg: 'px-7 py-3.5 text-sm',
};

/** Terminal-styled CTA. `href` renders a Link; otherwise a native button. */
export default function Button({
  variant = 'signal',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  children,
}: ButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${variant === 'link' ? '' : SIZES[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
