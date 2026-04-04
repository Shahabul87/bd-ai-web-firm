interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

function getVariantStyles(variant: string, active: boolean): string {
  if (variant === 'default') {
    return active
      ? 'bg-indigo-600 text-white border-indigo-600'
      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]';
  }

  const variants: Record<string, string> = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return variants[variant] ?? '';
}

export default function Tag({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  onClick,
  active = false,
}: TagProps) {
  const baseStyles =
    'inline-flex items-center rounded-full border font-medium transition-all duration-200';

  const combinedStyles = [
    baseStyles,
    sizeStyles[size],
    getVariantStyles(variant, active),
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" className={combinedStyles} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <span className={combinedStyles}>{children}</span>;
}
