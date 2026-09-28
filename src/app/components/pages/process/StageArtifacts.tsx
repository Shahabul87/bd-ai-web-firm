/* What each stage hands you, drawn as a small live artifact. All motion is
 * CSS keyed off `.is-on` on the `.pr-art` root; `--i` orders the reveal
 * inside one. Without `.is-on` (or with reduced motion / no scripting) the
 * CSS shows each artifact finished. No hooks: renders on either side. */

import type { CSSProperties } from 'react';
import { EVAL_CASES, EVAL_SCORE, BAR, caseFails, formatScore, pct, type StageKey } from './run';
import { Sparkline } from './RunPlot';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

export interface DiscoverArt { title: string; steps: string[]; data: string; bar: string }
export interface PrototypeArt { title: string; question: string; answer: string; source: string; tag: string }
export interface EvaluateArt { title: string; cases: string; pass: string; fail: string; score: string; bar: string; verdict: string }
export interface BuildArt { title: string; items: string[]; status: string }
export interface RunArt { title: string; label: string; holding: string; shipped: string; pips: string[] }

export interface ArtifactCopy {
  discover: DiscoverArt;
  prototype: PrototypeArt;
  evaluate: EvaluateArt;
  build: BuildArt;
  run: RunArt;
}

interface ArtifactProps {
  stage: StageKey;
  copy: ArtifactCopy;
  /** "Example" tag in the corner. */
  example: string;
  /** Distinguishes the two copies (the chart dock and the inline one) for ids. */
  suffix: string;
  on: boolean;
  bn: boolean;
}

function Discover({ copy }: { copy: DiscoverArt }) {
  return (
    <>
      <ol className="pr-map">
        {copy.steps.map((step, i) => (
          <li key={step} className="pr-seq" style={order(i)}>
            {step}
          </li>
        ))}
      </ol>
      <p className="pr-art-line pr-seq" style={order(copy.steps.length)}>
        {copy.data}
      </p>
      <p className="pr-art-bar pr-seq" style={order(copy.steps.length + 1)}>
        <i aria-hidden="true" />
        {copy.bar}
      </p>
    </>
  );
}

function Prototype({ copy }: { copy: PrototypeArt }) {
  const words = copy.answer.split(/\s+/);
  return (
    <div className="pr-demo">
      <p className="pr-demo-q pr-seq" style={order(0)}>
        {copy.question}
      </p>
      <p className="pr-demo-a">
        {words.map((word, i) => (
          <span key={i} className="pr-w" style={{ '--w': i } as CSSProperties}>
            {word}{' '}
          </span>
        ))}
      </p>
      <p className="pr-demo-src pr-seq" style={order(4)}>
        <span className="attn-chip m">{copy.source}</span>
        <span className="attn-chip">{copy.tag}</span>
      </p>
    </div>
  );
}

function Evaluate({ copy, bn }: { copy: EvaluateArt; bn: boolean }) {
  return (
    <>
      <div className="pr-cases" aria-hidden="true">
        {Array.from({ length: EVAL_CASES }, (_, i) => (
          <i key={i} className={caseFails(i) ? 'f' : undefined} style={order(i)} />
        ))}
      </div>
      <p className="pr-cases-key">
        <span className="pr-k-pass">{copy.pass}</span>
        <span className="pr-k-fail">{copy.fail}</span>
        <span>{copy.cases}</span>
      </p>
      <div className="pr-score">
        <span>{copy.score}</span>
        <span className="pr-score-track" aria-hidden="true">
          <i style={{ '--to': pct(EVAL_SCORE * 100) } as CSSProperties} />
          <b style={{ left: pct(BAR * 100) }} />
        </span>
        <span className="pr-score-v">{formatScore(EVAL_SCORE, bn)}</span>
      </div>
      <p className="pr-score-meta">
        <span className="pr-bar-chip">
          {copy.bar} {formatScore(BAR, bn)}
        </span>
        <span className="pr-verdict pr-seq" style={order(8)}>
          {copy.verdict}
        </span>
      </p>
    </>
  );
}

function Build({ copy }: { copy: BuildArt }) {
  return (
    <>
      <ul className="pr-check">
        {copy.items.map((item, i) => (
          <li key={item} className="pr-seq" style={order(i)}>
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2.5 7.4l2.9 2.9L11.5 4" pathLength={1} />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <p className="pr-art-status pr-seq" style={order(copy.items.length)}>
        {copy.status}
      </p>
    </>
  );
}

function Run({ copy }: { copy: RunArt }) {
  return (
    <>
      <div className="pr-mon">
        <p className="pr-mon-top">
          <span>{copy.label}</span>
          <span className="pr-mon-live">
            <i aria-hidden="true" />
            {copy.holding}
          </span>
        </p>
        <Sparkline />
      </div>
      <ul className="pr-pips">
        {copy.pips.map((pip, i) => (
          <li key={pip} className="pr-seq" style={order(i + 2)}>
            <b>{copy.shipped}</b>
            <span>{pip}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function StageArtifact({ stage, copy, example, suffix, on, bn }: ArtifactProps) {
  const headId = `pr-art-${stage}-${suffix}`;
  return (
    <div className={`pr-art pr-art-${stage}${on ? ' is-on' : ''}`} role="group" aria-labelledby={headId}>
      <p className="pr-art-head">
        <b id={headId}>{copy[stage].title}</b>
        <span>{example}</span>
      </p>
      {stage === 'discover' && <Discover copy={copy.discover} />}
      {stage === 'prototype' && <Prototype copy={copy.prototype} />}
      {stage === 'evaluate' && <Evaluate copy={copy.evaluate} bn={bn} />}
      {stage === 'build' && <Build copy={copy.build} />}
      {stage === 'run' && <Run copy={copy.run} />}
    </div>
  );
}
