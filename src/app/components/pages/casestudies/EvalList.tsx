import type { CSSProperties } from 'react';
import { Link } from '@/i18n/navigation';
import InView from '@/app/components/home/InView';
import { toBengaliDigits } from '@/app/lib/numerals';
import EvalCard from './EvalCard';
import type { EvalCopy, Report } from './reports';

interface EvalListProps {
  reports: Report[];
  copy: EvalCopy;
  bn: boolean;
  /** Heading level of each row title (h3 under a section h2 by default). */
  as?: 'h2' | 'h3';
  /** Tighter rows without the excerpt (portfolio, "other reports"). */
  compact?: boolean;
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * The case-study index: an editorial list, one row per report, each with its
 * eval card. Shared by /resources/case-studies, /portfolio and the "other
 * reports" block of a case study. Server rendered.
 */
export default function EvalList({ reports, copy, bn, as: H = 'h3', compact = false }: EvalListProps) {
  const digits = (v: number) => {
    const s = String(v).padStart(2, '0');
    return bn ? toBengaliDigits(s) : s;
  };
  return (
    <ol className={`cs-rows${compact ? ' cs-rows-compact' : ''}`}>
      {reports.map((r, i) => (
        <li key={r.slug} className="cs-row">
          <InView once className="cs-row-in">
            <span className="cs-n pg-rise" aria-hidden="true">
              {digits(i + 1)}
            </span>
            <div className="cs-row-main pg-rise" style={d(1)}>
              <p className="cs-row-meta pg-cap">
                <span>{r.industry}</span>
                {r.platforms.map((p) => (
                  <span key={p}>{p}</span>
                ))}
                {r.ownProduct ? <span className="cs-own">{copy.ownProduct}</span> : null}
              </p>
              <H className="cs-row-t" lang={bn ? 'en' : undefined}>
                <Link href={`/resources/case-studies/${r.slug}`} className="cs-row-link">
                  {r.title}
                </Link>
              </H>
              {compact ? null : (
                <p className="cs-row-d" lang={bn ? 'en' : undefined}>
                  {r.excerpt}
                </p>
              )}
              <span className="cs-more" aria-hidden="true">
                {copy.readMore}
                <span className="cs-more-arr">→</span>
              </span>
            </div>
            {r.stages ? (
              <div className="cs-row-card pg-rise" style={d(2)}>
                <EvalCard
                  label={copy.cardLabel.replace('{title}', r.title)}
                  stages={[
                    { key: 'problem', label: copy.problem, text: r.stages.problem },
                    { key: 'approach', label: copy.approach, text: r.stages.approach },
                    { key: 'outcome', label: copy.outcome, text: r.stages.outcome },
                  ]}
                />
              </div>
            ) : null}
          </InView>
        </li>
      ))}
    </ol>
  );
}
