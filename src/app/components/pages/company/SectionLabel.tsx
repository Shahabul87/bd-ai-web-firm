import { useLocale } from 'next-intl';
import { toBengaliDigits } from '@/app/lib/numerals';

/**
 * A section label styled like a model-card field: "§ 2  Out of scope ······".
 * The number is shown in Bengali digits on /bn.
 */
export default function SectionLabel({ n, text, className = '' }: { n: number; text: string; className?: string }) {
  const locale = useLocale();
  return (
    <p className={`co-label ${className}`.trim()}>
      <span className="co-label-n">§ {locale === 'bn' ? toBengaliDigits(n) : n}</span>
      <span className="co-label-k">{text}</span>
      <span className="co-label-rule" aria-hidden="true" />
    </p>
  );
}
