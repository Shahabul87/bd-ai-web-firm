'use client';

import type { CSSProperties } from 'react';
import type { NodeState } from './model';

export interface RailNode {
  key: string;
  name: string;
  /** Localised ordinal, e.g. "1" or "১". */
  n: string;
  state: NodeState;
  /** False for nodes the visitor has not reached yet. */
  reachable: boolean;
}

interface PipelineRailProps {
  label: string;
  nodes: RailNode[];
  /** 0..1: how far the mint line has been drawn. */
  progress: number;
  /** Accessible name of a node button, e.g. "Step 2: Data". */
  nameOf: (node: RailNode) => string;
  statusLabels: Record<NodeState, string>;
  onGo: (index: number) => void;
}

/**
 * The steps as a pipeline: a drawn rail with one node per step. The active
 * node glows gold, completed nodes turn mint (and stay clickable, so any
 * completed step can be revisited), unreached nodes are inert.
 */
export default function PipelineRail({ label, nodes, progress, nameOf, statusLabels, onGo }: PipelineRailProps) {
  return (
    <nav className="qt-rail" aria-label={label} style={{ '--steps': nodes.length } as CSSProperties}>
      <div className="qt-rail-line" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
      <ol>
        {nodes.map((node, i) => {
          const current = node.state === 'current';
          return (
            <li key={node.key} className="qt-node" data-s={node.state}>
              <button
                type="button"
                aria-current={current ? 'step' : undefined}
                disabled={!current && !node.reachable}
                onClick={() => {
                  if (!current) onGo(i);
                }}
              >
                <span className="qt-node-dot" aria-hidden="true">
                  <svg viewBox="0 0 16 16" focusable="false">
                    <path d="M4 8.4 6.8 11 12 5.4" />
                  </svg>
                  <b>{node.n}</b>
                </span>
                <span className="qt-node-name" aria-hidden="true">
                  {node.name}
                </span>
                <span className="qt-sr">
                  {nameOf(node)}, {statusLabels[node.state]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
