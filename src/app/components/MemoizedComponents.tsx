'use client';

import React, { Suspense } from 'react';
import { useSimplifiedAnimation } from '../hooks/useSimplifiedAnimation';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components to improve initial page load
const CodeShowcase = React.lazy(() => import('./CodeShowcase'));
const ServicesSection = React.lazy(() => import('./ServicesSection'));
const ProcessSection = React.lazy(() => import('./ProcessSection'));
const TestimonialSection = React.lazy(() => import('./TestimonialSection'));

// Strict layout wrapper to prevent any layout shifts
function PerformanceWrapper({ 
  children, 
  fallback, 
  height = 'auto',
  className = '' 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  height?: string;
  className?: string;
}) {
  const { shouldAnimate } = useSimplifiedAnimation();
  
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <div 
        className={`strict-layout-container ${shouldAnimate ? '' : 'reduce-motion'} ${className}`}
        style={{ height, maxHeight: height }}
      >
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
    </Suspense>
  );
}

// Memoized versions with PROPER heights for quality animations
export const MemoizedCodeShowcase = React.memo(() => (
  <PerformanceWrapper height="800px">
    <CodeShowcase />
  </PerformanceWrapper>
));

export const MemoizedServicesSection = React.memo(() => (
  <PerformanceWrapper height="1200px">
    <ServicesSection />
  </PerformanceWrapper>
));

export const MemoizedProcessSection = React.memo(() => (
  <PerformanceWrapper height="1400px">
    <ProcessSection />
  </PerformanceWrapper>
));

export const MemoizedTestimonialSection = React.memo(() => (
  <PerformanceWrapper height="600px">
    <TestimonialSection />
  </PerformanceWrapper>
));

// Set display names for better debugging
MemoizedCodeShowcase.displayName = 'MemoizedCodeShowcase';
MemoizedServicesSection.displayName = 'MemoizedServicesSection';
MemoizedProcessSection.displayName = 'MemoizedProcessSection';
MemoizedTestimonialSection.displayName = 'MemoizedTestimonialSection';