'use client';

import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';
import HeroSectionOptimized from './HeroSectionOptimized';
import ContactSection from './ContactSection';
import Footer from './Footer';
import { PageBackground } from './PageBackground';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components with Next.js dynamic for better optimization
const CodeShowcaseOptimized = dynamic(() => import('./CodeShowcaseOptimized'), {
  loading: () => <SectionLoader />,
  ssr: false // Load only on client for animation-heavy component
});

const ServicesSection = dynamic(() => import('./ServicesSection'), {
  loading: () => <SectionLoader />,
  ssr: true // Keep SSR for SEO
});

const ProcessSection = dynamic(() => import('./ProcessSection'), {
  loading: () => <SectionLoader />,
  ssr: true
});

// Performance monitor only in dev
const PerformanceMonitor = dynamic(() => import('./PerformanceMonitor'), {
  ssr: false
});

// Simple loading fallback
function SectionLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function HomePage() {
  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          <HeroSectionOptimized />
          
          <CodeShowcaseOptimized />
          <ServicesSection />
          <ProcessSection />
          
          <ContactSection />
        </main>
        
        <Footer />
      </div>
      
      {/* Performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </PageBackground>
  );
}