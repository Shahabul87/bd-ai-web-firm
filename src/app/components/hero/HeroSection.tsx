'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import HeroContent from './HeroContent';
import HeroMobileFallback from './HeroMobileFallback';

const Hero3DScene = dynamic(() => import('./Hero3DScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 opacity-50 animate-pulse" />
    </div>
  ),
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('webgl2')
    );
  } catch {
    return false;
  }
}

export default function HeroSection() {
  const { isMobile, mounted } = useMobileDetection();
  const [webglSupported, setWebglSupported] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setWebglSupported(hasWebGL());
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    // Progress from 0 (section top at viewport top) to 1 (section fully scrolled past)
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const show3D = mounted && !isMobile && webglSupported && !reducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100vh-80px)] bg-[var(--background)] overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-violet-50/30 dark:from-indigo-950/20 dark:via-transparent dark:to-violet-950/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <HeroContent />

          {/* Right: 3D Robotic Faces or Mobile Fallback */}
          <div className="relative order-first lg:order-last">
            {show3D ? (
              <Hero3DScene scrollProgress={scrollProgress} />
            ) : mounted ? (
              <HeroMobileFallback />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
