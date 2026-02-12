'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import RoboticFaces from './RoboticFaces';
import NeuralParticles from './NeuralParticles';

interface Hero3DSceneProps {
  scrollProgress: number;
}

export default function Hero3DScene({ scrollProgress }: Hero3DSceneProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      {/* Radial gradient backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-100 via-violet-50 to-cyan-50 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-cyan-950/20 blur-3xl opacity-70" />
      </div>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 55 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting optimized for chrome/metallic faces */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} color="#e0e7ff" />
          <directionalLight position={[-4, 3, 4]} intensity={1.0} color="#06b6d4" />
          <directionalLight position={[0, -3, 5]} intensity={0.6} color="#a78bfa" />
          <directionalLight position={[3, 0, -2]} intensity={0.4} color="#f59e0b" />
          <pointLight position={[0, 2, 4]} intensity={1.0} color="#818cf8" />
          <pointLight position={[-2, -1, 3]} intensity={0.5} color="#34d399" />

          {/* 3D Robotic Faces */}
          <RoboticFaces scrollProgress={scrollProgress} />
          <NeuralParticles />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
