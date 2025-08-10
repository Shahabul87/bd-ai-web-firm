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
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | undefined>(undefined);
  const measurementCountRef = useRef(0);
  const MAX_MEASUREMENTS = 100; // Stop after 100 samples to prevent infinite loop

  const measureFrameTime = useCallback(() => {
    // Stop measuring after enough samples
    if (measurementCountRef.current >= MAX_MEASUREMENTS) {
      return;
    }

    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Keep last 60 frame times for analysis
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Analyze performance every 30 frames
    if (frameTimesRef.current.length >= 30) {
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const maxFrameTime = Math.max(...frameTimesRef.current);
      
      // More conservative performance detection
      const isLowPerformance = avgFrameTime > 18 || maxFrameTime > 40; // Be more conservative
      const shouldReduceAnimations = avgFrameTime > 22 || maxFrameTime > 80; // Reduce animations earlier

      // Basic memory pressure detection (if available)
      let memoryPressure = false;
      if ('memory' in performance) {
        const memInfo = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        if (memInfo && memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.8) {
          memoryPressure = true;
        }
      }

      setMetrics({
        shouldReduceAnimations,
        isLowPerformance,
        frameTime: avgFrameTime,
        memoryPressure
      });
    }

    measurementCountRef.current++;
    
    // Only continue if we haven't reached the limit
    if (measurementCountRef.current < MAX_MEASUREMENTS) {
      rafIdRef.current = requestAnimationFrame(measureFrameTime);
    }
  }, [MAX_MEASUREMENTS]);

  useEffect(() => {
    // Reset measurement count on mount
    measurementCountRef.current = 0;
    
    // Start monitoring after a delay to let the page settle
    const startTimer = setTimeout(() => {
      rafIdRef.current = requestAnimationFrame(measureFrameTime);
    }, 2000);

    return () => {
      clearTimeout(startTimer);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [measureFrameTime]);

  return metrics;
}

// Smart animation controller hook
export function useSmartAnimation(baseDelay: number = 1000) {
  const performance = usePerformanceMonitor();
  
  const getOptimizedDelay = useCallback((multiplier: number = 1) => {
    if (performance.shouldReduceAnimations) {
      return baseDelay * multiplier * 2.5; // Much longer delays for low performance
    }
    if (performance.isLowPerformance) {
      return baseDelay * multiplier * 1.8; // 80% longer delays
    }
    return baseDelay * multiplier * 1.2; // Slightly longer base delays for smoothness
  }, [baseDelay, performance]);

  const shouldSkipAnimation = useCallback(() => {
    return performance.memoryPressure || performance.frameTime > 35; // Skip animations earlier
  }, [performance]);

  return {
    getOptimizedDelay,
    shouldSkipAnimation,
    performanceMetrics: performance
  };
}