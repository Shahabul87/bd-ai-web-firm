/* Service diagrams. Decorative (aria-hidden): each one restates its service's
 * text as a picture, so the text itself is the accessible content. The labels
 * are translated and passed in. Animated parts (.pulse, .scan) only run while
 * an ancestor carries `.vis` (see InView). */

type Labels<K extends string> = Record<K, string>;

const FAINT = 'rgba(236,233,224,.26)';

export function AgentsDiagram({ labels }: { labels: Labels<'agent' | 'tickets' | 'crm' | 'replies' | 'person' | 'handoff'> }) {
  return (
    <svg className="dg" viewBox="0 0 520 250" aria-hidden="true">
      <path className="ln" d="M260 125 C200 125 170 52 104 52" />
      <path className="ln" d="M260 125 C320 125 350 52 416 52" />
      <path className="ln" d="M260 125 C200 125 170 198 104 198" />
      <path className="ln am" strokeDasharray="4 5" d="M260 125 C320 125 350 198 416 198" />
      <path className="pulse am" d="M260 125 C200 125 170 52 104 52" />
      <path className="pulse am" style={{ animationDelay: '.9s' }} d="M260 125 C320 125 350 52 416 52" />
      <path className="pulse am" style={{ animationDelay: '1.8s' }} d="M260 125 C200 125 170 198 104 198" />
      <path className="pulse mi" style={{ animationDelay: '2.7s' }} d="M260 125 C320 125 350 198 416 198" />
      <circle cx="260" cy="125" r="40" className="box am" style={{ strokeWidth: 1.6 }} />
      <circle cx="260" cy="125" r="52" fill="none" stroke="rgba(242,179,61,.18)" />
      <text x="260" y="129" textAnchor="middle" className="t-b" style={{ fontSize: 14 }}>{labels.agent}</text>
      <rect x="24" y="34" width="80" height="36" rx="4" className="box" />
      <text x="64" y="57" textAnchor="middle">{labels.tickets}</text>
      <rect x="416" y="34" width="80" height="36" rx="4" className="box" />
      <text x="456" y="57" textAnchor="middle">{labels.crm}</text>
      <rect x="24" y="180" width="80" height="36" rx="4" className="box" />
      <text x="64" y="203" textAnchor="middle">{labels.replies}</text>
      <rect x="416" y="180" width="80" height="36" rx="4" className="box mi" />
      <text x="456" y="203" textAnchor="middle" className="t-b">{labels.person}</text>
      <text x="330" y="236" textAnchor="middle">{labels.handoff}</text>
    </svg>
  );
}

export function AssistantsDiagram({ labels }: { labels: Labels<'question' | 'sourceA' | 'sourceB' | 'sourceC'> }) {
  return (
    <svg className="dg" viewBox="0 0 250 160" aria-hidden="true">
      <rect x="30" y="6" width="214" height="34" rx="14" className="box" />
      <text x="137" y="27" textAnchor="middle" className="t-b">{labels.question}</text>
      <rect x="10" y="56" width="170" height="6" rx="3" fill={FAINT} />
      <rect x="10" y="70" width="140" height="6" rx="3" fill={FAINT} />
      <rect x="10" y="84" width="104" height="6" rx="3" fill={FAINT} />
      <text x="120" y="92" className="fa" style={{ fontSize: 11 }}>[1]</text>
      <text x="140" y="92" className="fa" style={{ fontSize: 11 }}>[2]</text>
      <path className="ln" d="M124 96 C124 112 48 110 48 124" />
      <path className="ln" d="M144 96 C144 112 138 112 138 124" />
      <rect x="10" y="124" width="78" height="26" rx="4" className="box mi" />
      <text x="49" y="141" textAnchor="middle">{labels.sourceA}</text>
      <rect x="98" y="124" width="80" height="26" rx="4" className="box mi" />
      <text x="138" y="141" textAnchor="middle">{labels.sourceB}</text>
      <rect x="188" y="124" width="56" height="26" rx="4" className="box" />
      <text x="216" y="141" textAnchor="middle">{labels.sourceC}</text>
    </svg>
  );
}

export function ModelsDiagram({ labels }: { labels: Labels<'loss' | 'steps' | 'baseline' | 'tuned'> }) {
  return (
    <svg className="dg" viewBox="0 0 250 160" aria-hidden="true">
      <path className="ln" d="M28 10 V136 H244" />
      <text x="6" y="16">{labels.loss}</text>
      <text x="244" y="154" textAnchor="end">{labels.steps}</text>
      <path d="M30 26 C70 60 100 70 140 74 S220 80 242 80" fill="none" stroke="rgba(236,233,224,.4)" strokeDasharray="3 4" strokeWidth="1.4" />
      <path d="M30 26 C60 80 90 104 130 112 S210 120 242 121" fill="none" className="mi" strokeWidth="2" />
      <circle cx="242" cy="121" r="3.5" className="fm" />
      <text x="236" y="70" textAnchor="end">{labels.baseline}</text>
      <text x="236" y="109" textAnchor="end" className="t-b">{labels.tuned}</text>
    </svg>
  );
}

export function ProductDiagram({ labels }: { labels: Labels<'ai' | 'web' | 'mobile'> }) {
  return (
    <svg className="dg" viewBox="0 0 250 160" aria-hidden="true">
      <rect x="4" y="8" width="176" height="130" rx="6" className="box" />
      <path className="ln" d="M4 26 H180" />
      <circle cx="16" cy="17" r="3" fill="rgba(236,233,224,.3)" />
      <circle cx="27" cy="17" r="3" fill="rgba(236,233,224,.3)" />
      <rect x="16" y="38" width="72" height="6" rx="3" fill="rgba(236,233,224,.22)" />
      <rect x="16" y="52" width="92" height="6" rx="3" fill="rgba(236,233,224,.16)" />
      <rect x="16" y="66" width="60" height="6" rx="3" fill="rgba(236,233,224,.16)" />
      <rect x="112" y="34" width="60" height="96" rx="4" fill="none" className="am" strokeWidth="1.4" />
      <text x="120" y="50" className="fa" style={{ fontSize: 11 }}>{labels.ai}</text>
      <rect x="120" y="60" width="44" height="5" rx="2.5" fill="rgba(242,179,61,.35)" />
      <rect x="120" y="71" width="36" height="5" rx="2.5" fill="rgba(242,179,61,.25)" />
      <rect x="120" y="112" width="44" height="12" rx="3" fill="none" stroke="rgba(242,179,61,.5)" />
      <rect x="194" y="30" width="52" height="108" rx="9" className="box" />
      <rect x="200" y="96" width="40" height="34" rx="4" fill="none" className="am" strokeWidth="1.4" />
      <rect x="206" y="104" width="26" height="4" rx="2" fill="rgba(242,179,61,.35)" />
      <rect x="202" y="44" width="30" height="5" rx="2.5" fill="rgba(236,233,224,.2)" />
      <text x="92" y="156" textAnchor="middle">{labels.web}</text>
      <text x="220" y="156" textAnchor="middle">{labels.mobile}</text>
    </svg>
  );
}

/** Cells that fail in the illustrative test run; the rest pass. */
const FAILING = new Set([7, 18, 33, 41]);
const CELLS = Array.from({ length: 50 }, (_, i) => ({ i, row: Math.floor(i / 10), col: i % 10 }));

export function EvalsDiagram({ labels }: { labels: Labels<'pass' | 'fail' | 'suite'> }) {
  return (
    <svg className="dg" viewBox="0 0 250 150" aria-hidden="true">
      {CELLS.map(({ i, row, col }) => (
        <rect
          key={i}
          x={6 + col * 24}
          y={8 + row * 20}
          width="20"
          height="15"
          rx="2"
          fill={FAILING.has(i) ? 'rgba(232,122,140,.75)' : 'rgba(127,214,181,.22)'}
          stroke={FAILING.has(i) ? 'none' : 'rgba(127,214,181,.45)'}
        />
      ))}
      <rect x="3" y="4" width="26" height="103" rx="3" fill="none" stroke="var(--gold)" strokeWidth="1.4" className="scan" />
      <circle cx="10" cy="134" r="4" fill="var(--mint)" />
      <text x="20" y="138">{labels.pass}</text>
      <circle cx="90" cy="134" r="4" fill="var(--rose)" />
      <text x="100" y="138">{labels.fail}</text>
      <text x="244" y="138" textAnchor="end" className="t-b">{labels.suite}</text>
    </svg>
  );
}

const SPRINT_DAYS = [8, 31, 54, 77, 100, 112, 134, 156, 178, 200];

export function SprintDiagram({ labels }: { labels: Labels<'weekOne' | 'weekTwo' | 'prototype'> }) {
  return (
    <svg className="dg" viewBox="0 0 250 150" aria-hidden="true">
      <path className="ln" d="M8 86 H200" />
      {SPRINT_DAYS.map((x, i) => (
        <circle key={x} cx={x} cy="86" r="3.2" fill={i === SPRINT_DAYS.length - 1 ? 'var(--gold)' : 'rgba(236,233,224,.4)'} />
      ))}
      <path className="ln" d="M8 56 V48 H100 V56" />
      <text x="54" y="40" textAnchor="middle">{labels.weekOne}</text>
      <path className="ln" d="M112 56 V48 H200 V56" />
      <text x="156" y="40" textAnchor="middle">{labels.weekTwo}</text>
      <path className="ln am" d="M200 86 H214" />
      <rect x="214" y="66" width="32" height="40" rx="4" fill="none" className="am" strokeWidth="1.6" />
      <path d="M214 76 H246" className="am" strokeWidth="1.2" />
      <rect x="220" y="84" width="20" height="4" rx="2" className="fa" opacity=".6" />
      <rect x="220" y="93" width="14" height="4" rx="2" className="fa" opacity=".4" />
      <text x="230" y="126" textAnchor="middle" className="t-b">{labels.prototype}</text>
    </svg>
  );
}
