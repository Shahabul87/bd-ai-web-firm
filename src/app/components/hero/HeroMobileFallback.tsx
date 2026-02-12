'use client';

import { useState, useEffect } from 'react';

interface RobotFace2DProps {
  color: string;
  glowColor: string;
  label: string;
  eyeStyle: 'round' | 'visor' | 'diamond' | 'rectangular';
  size: number;
  delay: number;
}

function RobotFace2D({ color, glowColor, label, eyeStyle, size, delay }: RobotFace2DProps) {
  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head glow */}
        <circle cx="50" cy="50" r="45" fill={glowColor} opacity="0.15" />

        {/* Main head */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={color}
          stroke={glowColor}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Face plate */}
        <ellipse
          cx="50"
          cy="48"
          rx="28"
          ry="30"
          fill={color}
          stroke={glowColor}
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Forehead line */}
        <rect x="30" y="30" width="40" height="3" rx="1.5" fill={glowColor} opacity="0.8" />

        {/* Center line */}
        <rect x="49" y="28" width="2" height="40" rx="1" fill={glowColor} opacity="0.3" />

        {/* Eyes */}
        {eyeStyle === 'round' && (
          <>
            <circle cx="38" cy="44" r="7" fill="#111" />
            <circle cx="62" cy="44" r="7" fill="#111" />
            <circle cx="38" cy="44" r="5" fill={glowColor}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="62" cy="44" r="5" fill={glowColor}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        {eyeStyle === 'rectangular' && (
          <>
            <rect x="30" y="40" width="14" height="7" rx="2" fill="#111" />
            <rect x="56" y="40" width="14" height="7" rx="2" fill="#111" />
            <rect x="31" y="41" width="12" height="5" rx="1.5" fill={glowColor}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <rect x="57" y="41" width="12" height="5" rx="1.5" fill={glowColor}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
            </rect>
          </>
        )}
        {eyeStyle === 'diamond' && (
          <>
            <polygon points="38,38 44,44 38,50 32,44" fill="#111" />
            <polygon points="62,38 68,44 62,50 56,44" fill="#111" />
            <polygon points="38,39 43,44 38,49 33,44" fill={glowColor}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
            </polygon>
            <polygon points="62,39 67,44 62,49 57,44" fill={glowColor}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
            </polygon>
          </>
        )}
        {eyeStyle === 'visor' && (
          <>
            <rect x="25" y="40" width="50" height="8" rx="4" fill="#111" />
            <rect x="26" y="41" width="48" height="6" rx="3" fill={glowColor}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* Mouth */}
        <rect x="38" y="60" width="24" height="3" rx="1.5" fill={glowColor} opacity="0.6" />

        {/* Side panels */}
        <circle cx="12" cy="50" r="5" fill={color} stroke={glowColor} strokeWidth="1" />
        <circle cx="88" cy="50" r="5" fill={color} stroke={glowColor} strokeWidth="1" />
        <circle cx="12" cy="50" r="2" fill={glowColor}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="88" cy="50" r="2" fill={glowColor}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Glow ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={glowColor}
          strokeWidth="0.5"
          opacity="0.4"
        />
      </svg>
      <span
        className="mt-1 text-[9px] sm:text-[10px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-full"
        style={{
          color: glowColor,
          background: `${glowColor}15`,
          border: `1px solid ${glowColor}30`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const ROBOTS = [
  { label: 'AI Code Generator', color: '#4338ca', glowColor: '#818cf8', eyeStyle: 'round' as const },
  { label: 'AI Code Reviewer', color: '#155e75', glowColor: '#22d3ee', eyeStyle: 'rectangular' as const },
  { label: 'AI Code Tester', color: '#065f46', glowColor: '#34d399', eyeStyle: 'diamond' as const },
  { label: 'AI Security Checker', color: '#92400e', glowColor: '#fbbf24', eyeStyle: 'visor' as const },
];

export default function HeroMobileFallback() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-[340px] mx-auto py-4">
      {/* Background glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 opacity-10 blur-3xl" />

      {/* Robot faces grid */}
      {mounted && (
        <div className="relative grid grid-cols-2 gap-3 place-items-center">
          {ROBOTS.map((robot, i) => (
            <RobotFace2D
              key={robot.label}
              color={robot.color}
              glowColor={robot.glowColor}
              label={robot.label}
              eyeStyle={robot.eyeStyle}
              size={120}
              delay={i * 0.4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
