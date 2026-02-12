'use client';

import dynamic from 'next/dynamic';
import Header from './Header';
import { HeroSection } from './hero';
import ContactSection from './ContactSection';
import Footer from './Footer';
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <main className="pt-16 sm:pt-18 md:pt-20">
        {/* Hero section - fully theme-aware */}
        <HeroSection />

        {/* All sections now support light/dark theme via CSS variables */}
        <CodeShowcaseOptimized />
        <ServicesSection />
        <ProcessSection />
        <ContactSection />
        <Footer />
      </main>

      {/* Performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </div>
  );
}
