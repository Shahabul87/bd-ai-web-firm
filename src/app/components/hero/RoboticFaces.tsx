'use client';

import { useRef, useMemo, type ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface RoboticFaceProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  baseColor: string;
  plateColor: string;
  eyeColor: string;
  eyeShape: 'round' | 'visor' | 'diamond' | 'rectangular';
  mouthStyle: 'smile' | 'line' | 'grid' | 'grill';
  hasAntenna?: boolean;
  floatSpeed?: number;
  label: string;
  labelColor: string;
}

function RoboticFace({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  baseColor,
  plateColor,
  eyeColor,
  eyeShape,
  mouthStyle,
  hasAntenna = false,
  floatSpeed = 1.5,
  label,
  labelColor,
}: RoboticFaceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle idle breathing
    groupRef.current.scale.setScalar(scale * (1 + Math.sin(t * 1.2) * 0.015));

    // Eye glow pulsing
    const pulse = 2.0 + Math.sin(t * 2.5) * 0.8;
    if (eyeLeftRef.current) {
      (eyeLeftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
    if (eyeRightRef.current) {
      (eyeRightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  const EyeGeometry = useMemo(() => {
    switch (eyeShape) {
      case 'round':
        return <sphereGeometry args={[0.12, 16, 16]} />;
      case 'visor':
        return <boxGeometry args={[0.6, 0.1, 0.08]} />;
      case 'diamond':
        return <octahedronGeometry args={[0.11, 0]} />;
      case 'rectangular':
        return <boxGeometry args={[0.16, 0.1, 0.08]} />;
    }
  }, [eyeShape]);

  const MouthComponent = useMemo(() => {
    switch (mouthStyle) {
      case 'smile': {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 12; i++) {
          const angle = (Math.PI * 0.15) + (i / 12) * (Math.PI * 0.7);
          points.push(
            new THREE.Vector3(
              Math.cos(angle) * 0.2,
              -Math.sin(angle) * 0.07 - 0.25,
              0.56
            )
          );
        }
        const curve = new THREE.CatmullRomCurve3(points);
        return (
          <mesh>
            <tubeGeometry args={[curve, 16, 0.015, 6, false]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1.2} />
          </mesh>
        );
      }
      case 'line':
        return (
          <mesh position={[0, -0.25, 0.56]}>
            <boxGeometry args={[0.3, 0.03, 0.025]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1.5} />
          </mesh>
        );
      case 'grid': {
        const dots: ReactElement[] = [];
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 5; col++) {
            dots.push(
              <mesh key={`${row}-${col}`} position={[-0.12 + col * 0.06, -0.22 - row * 0.05, 0.56]}>
                <boxGeometry args={[0.035, 0.03, 0.02]} />
                <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} />
              </mesh>
            );
          }
        }
        return <group>{dots}</group>;
      }
      case 'grill': {
        const bars: ReactElement[] = [];
        for (let i = 0; i < 4; i++) {
          bars.push(
            <mesh key={i} position={[0, -0.2 - i * 0.04, 0.56]}>
              <boxGeometry args={[0.28, 0.015, 0.02]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.6} />
            </mesh>
          );
        }
        return <group>{bars}</group>;
      }
    }
  }, [mouthStyle, eyeColor]);

  return (
    <Float speed={floatSpeed} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        {/* Head - main chrome shell */}
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color={baseColor}
            metalness={0.95}
            roughness={0.08}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Face plate - darker inset */}
        <mesh position={[0, -0.02, 0.12]} scale={[0.82, 0.92, 0.5]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color={plateColor} metalness={0.8} roughness={0.15} />
        </mesh>

        {/* Forehead accent strip */}
        <mesh position={[0, 0.28, 0.46]} scale={[0.55, 0.045, 0.06]}>
          <boxGeometry />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} />
        </mesh>

        {/* Eyes */}
        {eyeShape === 'visor' ? (
          <mesh ref={eyeLeftRef} position={[0, 0.08, 0.54]}>
            {EyeGeometry}
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        ) : (
          <>
            <mesh ref={eyeLeftRef} position={[-0.19, 0.08, 0.54]}>
              {EyeGeometry}
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh ref={eyeRightRef} position={[0.19, 0.08, 0.54]}>
              {EyeGeometry}
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Eye socket rings (non-visor) */}
        {eyeShape !== 'visor' && (
          <>
            <mesh position={[-0.19, 0.08, 0.52]}>
              <ringGeometry args={[0.13, 0.17, 24]} />
              <meshStandardMaterial color={plateColor} metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.19, 0.08, 0.52]}>
              <ringGeometry args={[0.13, 0.17, 24]} />
              <meshStandardMaterial color={plateColor} metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* Center seam line */}
        <mesh position={[0, 0, 0.55]} scale={[0.015, 0.6, 0.01]}>
          <boxGeometry />
          <meshStandardMaterial color={baseColor} metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Mouth */}
        {MouthComponent}

        {/* Side panels (ears) */}
        <mesh position={[-0.57, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 0.18, 8]} />
          <meshStandardMaterial color={baseColor} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.57, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 0.18, 8]} />
          <meshStandardMaterial color={baseColor} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Ear glow dots */}
        <mesh position={[-0.6, 0, 0.06]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh position={[0.6, 0, 0.06]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} toneMapped={false} />
        </mesh>

        {/* Antenna */}
        {hasAntenna && (
          <group position={[0, 0.6, 0]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
              <meshStandardMaterial color={baseColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} toneMapped={false} />
            </mesh>
          </group>
        )}

        {/* Chin plate */}
        <mesh position={[0, -0.42, 0.38]} scale={[0.22, 0.07, 0.1]}>
          <boxGeometry />
          <meshStandardMaterial color={baseColor} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Head glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.64, 0.012, 8, 48]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} transparent opacity={0.5} />
        </mesh>

        {/* Label below face */}
        <Html center position={[0, -0.85, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-md shadow-lg"
            style={{
              color: labelColor,
              background: `${labelColor}18`,
              border: `1.5px solid ${labelColor}50`,
              boxShadow: `0 4px 20px ${labelColor}30`,
            }}
          >
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Bright chrome base with vibrant accent colors - fully spread to fill canvas
const ROBOTS = [
  {
    label: 'AI Code Generator',
    baseColor: '#d0d0f0',
    plateColor: '#4338ca',
    eyeColor: '#818cf8',
    labelColor: '#6366f1',
    eyeShape: 'round' as const,
    mouthStyle: 'smile' as const,
    hasAntenna: true,
    position: [-0.5, 0.8, 1] as [number, number, number],
    rotation: [0, 0.15, 0.03] as [number, number, number],
    scale: 2.0,
    floatSpeed: 1.4,
  },
  {
    label: 'AI Code Reviewer',
    baseColor: '#c0e8f8',
    plateColor: '#0e7490',
    eyeColor: '#22d3ee',
    labelColor: '#06b6d4',
    eyeShape: 'rectangular' as const,
    mouthStyle: 'line' as const,
    hasAntenna: false,
    position: [2.2, 2.2, -1] as [number, number, number],
    rotation: [0, -0.25, 0.05] as [number, number, number],
    scale: 1.2,
    floatSpeed: 1.8,
  },
  {
    label: 'AI Code Tester',
    baseColor: '#c0f0e0',
    plateColor: '#047857',
    eyeColor: '#34d399',
    labelColor: '#10b981',
    eyeShape: 'diamond' as const,
    mouthStyle: 'grid' as const,
    hasAntenna: true,
    position: [-2.2, -1.8, -0.5] as [number, number, number],
    rotation: [0, 0.2, -0.05] as [number, number, number],
    scale: 1.25,
    floatSpeed: 1.6,
  },
  {
    label: 'AI Security Checker',
    baseColor: '#f0e0c0',
    plateColor: '#b45309',
    eyeColor: '#fbbf24',
    labelColor: '#f59e0b',
    eyeShape: 'visor' as const,
    mouthStyle: 'grill' as const,
    hasAntenna: false,
    position: [2.0, -1.8, 0] as [number, number, number],
    rotation: [0, -0.15, -0.03] as [number, number, number],
    scale: 1.15,
    floatSpeed: 2.0,
  },
];

interface RoboticFacesProps {
  scrollProgress: number;
}

export default function RoboticFaces({ scrollProgress }: RoboticFacesProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Scroll-based rotation: maps scroll (0-1) to Y rotation
    const targetRotationY = scrollProgress * Math.PI * 2;
    groupRef.current.rotation.y +=
      (targetRotationY - groupRef.current.rotation.y) * delta * 3;

    // Subtle X tilt on scroll
    const targetRotationX = Math.sin(scrollProgress * Math.PI) * 0.15;
    groupRef.current.rotation.x +=
      (targetRotationX - groupRef.current.rotation.x) * delta * 3;

    // Slow idle rotation
    groupRef.current.rotation.y += delta * 0.08;

    // Subtle breathing scale
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      {ROBOTS.map((robot) => (
        <RoboticFace
          key={robot.label}
          position={robot.position}
          rotation={robot.rotation}
          scale={robot.scale}
          baseColor={robot.baseColor}
          plateColor={robot.plateColor}
          eyeColor={robot.eyeColor}
          eyeShape={robot.eyeShape}
          mouthStyle={robot.mouthStyle}
          hasAntenna={robot.hasAntenna}
          floatSpeed={robot.floatSpeed}
          label={robot.label}
          labelColor={robot.labelColor}
        />
      ))}
    </group>
  );
}
