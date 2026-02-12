'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface CodeBlockProps {
  label: string;
  color: string;
  orbitOffset: number;
  orbitRadius: number;
}

function CodeBlock({ label, color, orbitOffset, orbitRadius }: CodeBlockProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * 0.3 + orbitOffset;
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div
          className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-sm shadow-lg"
          style={{
            color,
            background: `${color}15`,
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 15px ${color}20`,
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

const CODE_BLOCKS = [
  { label: 'AI Code Generator', color: '#6366f1', orbitOffset: 0 },
  { label: 'AI Code Reviewer', color: '#06b6d4', orbitOffset: Math.PI / 2 },
  { label: 'AI Code Tester', color: '#10b981', orbitOffset: Math.PI },
  { label: 'AI Security Checker', color: '#f59e0b', orbitOffset: (3 * Math.PI) / 2 },
];

export default function FloatingCodeBlocks() {
  return (
    <group>
      {CODE_BLOCKS.map((block) => (
        <CodeBlock
          key={block.label}
          label={block.label}
          color={block.color}
          orbitOffset={block.orbitOffset}
          orbitRadius={2.2}
        />
      ))}
    </group>
  );
}
