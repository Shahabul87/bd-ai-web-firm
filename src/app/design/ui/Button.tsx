import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'signal' | 'ghost' | 'link';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';

const VARIANTS: Record<ButtonVariant, string> = {
  signal: 'bg-signal text-ink-950 hover:bg-signal-dim',
  ghost: 'border border-line text-bone hover:border-signal hover:text-signal',
  link: 'text-signal underline-offset-4 hover:underline',
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
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
