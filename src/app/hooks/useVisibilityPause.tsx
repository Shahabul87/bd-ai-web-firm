'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface VisibilityOptions {
  threshold?: number;
  rootMargin?: string;
  pauseOnHidden?: boolean;
}

export function useVisibilityPause(options: VisibilityOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    pauseOnHidden = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [shouldPause, setShouldPause] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const visible = entry.isIntersecting;
    
    setIsVisible(visible);
    
    if (pauseOnHidden) {
      setShouldPause(!visible);
    }
  }, [pauseOnHidden]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer with performance-optimized options
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Additional API for manual animation control
  const pauseAnimations = useCallback(() => {
    setShouldPause(true);
  }, []);

  const resumeAnimations = useCallback(() => {
    setShouldPause(false);
  }, []);

  return {
    ref: elementRef,
    isVisible,
    shouldPause,
    pauseAnimations,
    resumeAnimations
  };
}

// Hook for managing animation cleanup on page visibility change
export function usePageVisibility() {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isPageVisible;
}

// Combined hook for comprehensive animation management
export function useAnimationManager(options: VisibilityOptions = {}) {
  const visibility = useVisibilityPause(options);
  const isPageVisible = usePageVisibility();
  
  const shouldPauseAnimations = visibility.shouldPause || !isPageVisible;
  const isFullyVisible = visibility.isVisible && isPageVisible;

  return {
    ...visibility,
    isPageVisible,
    shouldPauseAnimations,
    isFullyVisible
  };
}