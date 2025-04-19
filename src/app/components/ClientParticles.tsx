'use client';

import dynamic from 'next/dynamic';

// Import ParticleBackground with client-side only rendering
const ParticleBackground = dynamic(
  () => import('./ParticleBackground'),
  { ssr: false }
);

export default function ClientParticles() {
  return <ParticleBackground />;
} 