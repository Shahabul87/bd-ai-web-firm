interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

interface CardImageProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: CardProps) {
  const baseStyles =
    'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden';
  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-md hover:border-indigo-500/30 cursor-pointer'
    : '';

  return (
    <div
      className={[baseStyles, hoverStyles, className].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardImage({ children, className = '' }: CardImageProps) {
  return (
    <div
      className={['overflow-hidden rounded-t-xl', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={['p-5', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
