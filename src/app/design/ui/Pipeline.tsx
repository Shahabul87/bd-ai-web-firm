'use client';

import { useReducedMotion } from 'framer-motion';

interface PipelineProps {
  stages: string[];
  className?: string;
  animated?: boolean;
}

const STEP_W = 160;
const NODE_Y = 28;
const NODE_R = 5;

/**
 * Agent pipeline diagram: nodes joined by dashed connectors with a flowing
 * pulse (CSS stroke-dashoffset loop). The visual language for all 4 services.
 */
export default function Pipeline({ stages, className = '', animated = true }: PipelineProps) {
  const reduced = useReducedMotion();
  const animate = animated && !reduced;
  const width = stages.length * STEP_W;

  return (
    <svg
      viewBox={`0 0 ${width} 72`}
      className={`w-full ${className}`}
      role="img"
      aria-label={`Pipeline: ${stages.join(' to ')}`}
    >
      {stages.map((stage, i) => {
        const cx = STEP_W / 2 + i * STEP_W;
        return (
          <g key={stage}>
            {i < stages.length - 1 ? (
              <line
                x1={cx + NODE_R + 8}
                y1={NODE_Y}
                x2={cx + STEP_W - NODE_R - 8}
                y2={NODE_Y}
                stroke="var(--signal-dim)"
                strokeWidth="1.5"
                opacity="0.7"
                className={animate ? 'pipeline-dash' : undefined}
                strokeDasharray={animate ? undefined : '6 6'}
              />
            ) : null}
            <circle
              cx={cx}
              cy={NODE_Y}
              r={NODE_R}
              fill="var(--ink-950)"
              stroke="var(--signal)"
              strokeWidth="1.5"
            />
            <text
              x={cx}
              y={NODE_Y + 28}
              textAnchor="middle"
              fill="var(--steel)"
              fontSize="11"
              letterSpacing="0.14em"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {stage.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
