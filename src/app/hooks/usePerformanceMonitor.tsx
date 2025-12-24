'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  shouldReduceAnimations: boolean;
  isLowPerformance: boolean;
  frameTime: number;
  memoryPressure: boolean;
}

export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    shouldReduceAnimations: false,
    isLowPerformance: false,
    frameTime: 16,
    memoryPressure: false
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Check if device is mobile first
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    
    if (isMobile) {
      // On mobile, always reduce animations
      setMetrics({
        shouldReduceAnimations: true,
        isLowPerformance: true,
        frameTime: 32,
        memoryPressure: false
      });
      return;
    }

    // Simple performance check for desktop only
    let frameCount = 0;
    const maxFrames = 20; // Only check 20 frames
    
    const measureFrameTime = () => {
      if (frameCount >= maxFrames) {
        // Stop measuring
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
        
        // Analyze collected data
        if (frameTimesRef.current.length > 0) {
          const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
          
          setMetrics({
            shouldReduceAnimations: avgFrameTime > 25,
            isLowPerformance: avgFrameTime > 20,
            frameTime: avgFrameTime,
            memoryPressure: false
          });
        }
        return;
      }

      const now = performance.now();
      if (lastFrameTimeRef.current > 0) {
        const frameTime = now - lastFrameTimeRef.current;
        if (frameTime < 100) { // Ignore huge gaps
          frameTimesRef.current.push(frameTime);
        }
      }
      lastFrameTimeRef.current = now;
      frameCount++;
      
      rafIdRef.current = requestAnimationFrame(measureFrameTime);
    };

    // Start measuring after a delay
    const timeout = setTimeout(() => {
      rafIdRef.current = requestAnimationFrame(measureFrameTime);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return metrics;
}

// Smart animation controller hook
export function useSmartAnimation(baseDelay: number = 1000) {
  const performance = usePerformanceMonitor();
  
  const getOptimizedDelay = useCallback((multiplier: number = 1) => {
    if (performance.shouldReduceAnimations) {
      return baseDelay * multiplier * 2;
    }
    if (performance.isLowPerformance) {
      return baseDelay * multiplier * 1.5;
    }
    return baseDelay * multiplier;
  }, [baseDelay, performance]);

  const shouldSkipAnimation = useCallback(() => {
    return performance.memoryPressure || performance.frameTime > 40;
  }, [performance]);

  return {
    getOptimizedDelay,
    shouldSkipAnimation,
    performanceMetrics: performance
  };
}