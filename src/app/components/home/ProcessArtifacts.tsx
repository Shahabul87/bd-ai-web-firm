/* What each process step produces, drawn as a small live artifact. Server
 * components: all motion is CSS, keyed off `.is-active` on the `.attn-art`
 * wrapper, which ProcessSteps toggles. `--i` orders the reveal inside one. */

import type { CSSProperties } from 'react';

export const STEP_KEYS = ['research', 'plan', 'design', 'build', 'test'] as const;
export type StepKey = (typeof STEP_KEYS)[number];

const order = (i: number) => ({ '--i': i }) as CSSProperties;

export interface ResearchCopy { heading: string; notes: string[]; finding: string }
export interface PlanCopy { heading: string; columns: string[]; tasks: string[] }
export interface DesignCopy { heading: string; queue: string; draft: string; approve: string; escalate: string }
export interface BuildCopy { heading: string; lines: string[] }
export interface TestCopy { heading: string; cases: string; bar: string; passed: string }

export interface ArtifactCopy {
  research: ResearchCopy;
  plan: PlanCopy;
  design: DesignCopy;
  build: BuildCopy;
  test: TestCopy;
}

function Head({ title, label }: { title: string; label: string }) {
  return (
    <p className="attn-art-head">
      <b>{title}</b>
      <span>{label}</span>
    </p>
  );
}

export function ResearchArtifact({ copy, label }: { copy: ResearchCopy; label: string }) {
  return (
    <>
      <Head title={copy.heading} label={label} />
      <ul className="attn-notes">
        {copy.notes.map((note, i) => (
          <li key={note} className="seq" style={order(i)}>
            {note}
          </li>
        ))}
      </ul>
      <span className="attn-finding seq" style={order(copy.notes.length + 1)}>
        {copy.finding}
      </span>
    </>
  );
}

/** Which week column each task lands in. */
const PLAN_SLOTS = [0, 0, 1, 1, 2];

export function PlanArtifact({ copy, label }: { copy: PlanCopy; label: string }) {
  return (
    <>
      <Head title={copy.heading} label={label} />
      <div className="attn-plan">
        {copy.columns.map((column, c) => (
          <div key={column} className="attn-plan-col">
            <span>{column}</span>
            <ul>
              {copy.tasks.map((task, i) =>
                PLAN_SLOTS[i] === c ? (
                  <li key={task} className="seq" style={order(i)}>
                    <span className={`attn-chip${i === copy.tasks.length - 1 ? ' g' : ''}`}>{task}</span>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export function DesignArtifact({ copy, label }: { copy: DesignCopy; label: string }) {
  return (
    <>
      <Head title={copy.heading} label={label} />
      <svg className="attn-wire" viewBox="0 0 640 190" aria-hidden="true">
        <rect pathLength={100} className="stroke" style={order(0)} x="1" y="1" width="638" height="188" rx="8" />
        <rect pathLength={100} className="stroke" style={order(1)} x="16" y="16" width="190" height="158" rx="6" />
        <text className="fill" style={order(1)} x="30" y="40">{copy.queue}</text>
        <rect pathLength={100} className="stroke mi" style={order(2)} x="28" y="54" width="166" height="30" rx="4" />
        <rect pathLength={100} className="stroke" style={order(2)} x="28" y="92" width="166" height="30" rx="4" />
        <rect pathLength={100} className="stroke" style={order(3)} x="28" y="130" width="166" height="30" rx="4" />
        <rect pathLength={100} className="stroke am" style={order(3)} x="222" y="16" width="402" height="112" rx="6" />
        <text className="fill t-b" style={order(3)} x="238" y="40">{copy.draft}</text>
        <rect className="fill" style={order(4)} x="238" y="56" width="300" height="6" rx="3" fill="rgba(236,233,224,.22)" />
        <rect className="fill" style={order(4)} x="238" y="72" width="340" height="6" rx="3" fill="rgba(236,233,224,.16)" />
        <rect className="fill" style={order(4)} x="238" y="88" width="220" height="6" rx="3" fill="rgba(236,233,224,.16)" />
        <rect className="fill" style={order(5)} x="222" y="142" width="130" height="32" rx="6" fill="var(--gold)" />
        <text className="fill" style={{ ...order(5), fill: '#1a1206', fontWeight: 600 }} x="287" y="163" textAnchor="middle">
          {copy.approve}
        </text>
        <rect pathLength={100} className="stroke" style={order(5)} x="364" y="142" width="170" height="32" rx="6" />
        <text className="fill t-b" style={order(5)} x="449" y="163" textAnchor="middle">
          {copy.escalate}
        </text>
      </svg>
    </>
  );
}

export function BuildArtifact({ copy, label }: { copy: BuildCopy; label: string }) {
  return (
    <>
      <Head title={copy.heading} label={label} />
      <ol className="attn-log">
        {copy.lines.map((line, i) => (
          <li key={line} className="seq" style={order(i)}>
            {line}
          </li>
        ))}
      </ol>
      <div className="attn-meter">
        <i />
      </div>
    </>
  );
}

const EVAL_CELLS = Array.from({ length: 30 }, (_, i) => i);

export function TestArtifact({ copy, label }: { copy: TestCopy; label: string }) {
  return (
    <>
      <Head title={copy.heading} label={label} />
      <div className="attn-evals" aria-hidden="true">
        {EVAL_CELLS.map((i) => (
          <i key={i} style={order(i)} />
        ))}
      </div>
      <div className="attn-evals-foot">
        <span>{copy.cases}</span>
        <span className="attn-bar-track" aria-hidden="true">
          <i />
          <b />
        </span>
        <span>{copy.bar}</span>
      </div>
      <p className="seq" style={{ ...order(8), margin: '16px 0 0' }}>
        <span className="attn-chip m">{copy.passed}</span>
      </p>
    </>
  );
}

export function StepArtifact({ step, copy, label }: { step: StepKey; copy: ArtifactCopy; label: string }) {
  switch (step) {
    case 'research':
      return <ResearchArtifact copy={copy.research} label={label} />;
    case 'plan':
      return <PlanArtifact copy={copy.plan} label={label} />;
    case 'design':
      return <DesignArtifact copy={copy.design} label={label} />;
    case 'build':
      return <BuildArtifact copy={copy.build} label={label} />;
    case 'test':
      return <TestArtifact copy={copy.test} label={label} />;
  }
}
