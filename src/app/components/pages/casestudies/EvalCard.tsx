import type { CSSProperties } from 'react';

export interface EvalStage {
  key: 'problem' | 'approach' | 'outcome';
  label: string;
  text?: string;
}

interface EvalCardProps {
  stages: EvalStage[];
  /** Accessible name for the card (a figure). */
  label: string;
  /** Larger variant used as the legend in the hero. */
  size?: 'row' | 'legend';
}

const d = (n: number) => ({ '--i': n }) as CSSProperties;

/**
 * A tiny "eval card": problem → approach → outcome as a vertical pipeline.
 * The rail draws, each node lights in turn and the outcome gets a mint check
 * once the card scrolls into view (the parent InView adds `.vis`); hovering
 * or focusing the row sends a gold token down the rail. All CSS — the text is
 * in the server HTML and fully visible without scripting or motion.
 */
export default function EvalCard({ stages, label, size = 'row' }: EvalCardProps) {
  return (
    <figure className={`cs-eval cs-eval-${size}`} aria-label={label}>
      <span className="cs-rail" aria-hidden="true">
        <i className="cs-rail-fill" />
        <i className="cs-rail-tok" />
      </span>
      <ol className="cs-stages">
        {stages.map((s, i) => (
          <li key={s.key} className={`cs-stage cs-stage-${s.key}`} style={d(i)}>
            <span className="cs-node" aria-hidden="true">
              {s.key === 'outcome' ? (
                <svg viewBox="0 0 12 12" className="cs-check">
                  <path d="M2.6 6.3 5 8.6 9.4 3.6" pathLength={1} />
                </svg>
              ) : null}
            </span>
            <span className="cs-stage-l pg-cap">{s.label}</span>
            {s.text ? <span className="cs-stage-t">{s.text}</span> : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
