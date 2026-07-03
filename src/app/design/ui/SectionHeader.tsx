import MonoLabel from './MonoLabel';

interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

/** Standard section opener: `01 / AGENTS` eyebrow, display headline, optional lede. */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  const alignCls = align === 'center' ? 'text-center' : 'text-left';
  const ledeCls = align === 'center' ? 'mx-auto' : '';
  return (
    <div className={alignCls}>
      <MonoLabel>
        {index} / {eyebrow}
      </MonoLabel>
      <h2 className="mt-4 font-display text-3xl font-medium text-bone sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed text-steel ${ledeCls}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
