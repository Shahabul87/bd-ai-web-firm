'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function AIBrainMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.4}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#4338ca"
          emissiveIntensity={0.6}
          metalness={0.1}
          roughness={0.25}
          distort={0.3}
          speed={2}
        />
      </mesh>
      {/* Outer glow shell */}
      <mesh scale={1.6}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#818cf8"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
}
