'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface AnimationContextType {
  isAnimationEnabled: boolean;
  isReducedMotion: boolean;
  performanceMode: 'high' | 'medium' | 'low' | 'emergency';
  toggleAnimations: () => void;
  enableEmergencyMode: () => void;
  resetPerformanceMode: () => void;
  registerAnimation: (id: string) => void;
  unregisterAnimation: (id: string) => void;
  getAnimationDelay: (baseDelay: number) => number;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low' | 'emergency'>('high');
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  
  const performanceMetrics = usePerformanceMonitor();

  // Check for user's reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) {
        setIsAnimationEnabled(false);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const enableEmergencyMode = useCallback(() => {
    setPerformanceMode('emergency');
    setIsAnimationEnabled(false);
    console.warn('Emergency animation mode enabled - all animations disabled');
  }, []);

  // Automatically adjust performance mode based on metrics
  useEffect(() => {
    if (performanceMetrics.memoryPressure) {
      setPerformanceMode('emergency');
      setIsAnimationEnabled(false);
    } else if (performanceMetrics.shouldReduceAnimations) {
      setPerformanceMode('low');
    } else if (performanceMetrics.isLowPerformance) {
      setPerformanceMode('medium');
    } else {
      setPerformanceMode('high');
    }
  }, [performanceMetrics]);

  // Emergency shutoff if too many animations are running
  useEffect(() => {
    if (activeAnimations.size > 10) {
      console.warn('Too many animations running, enabling emergency mode');
      enableEmergencyMode();
    }
  }, [activeAnimations.size, enableEmergencyMode]);

  const toggleAnimations = useCallback(() => {
    setIsAnimationEnabled(prev => !prev);
  }, []);

  const resetPerformanceMode = useCallback(() => {
    setPerformanceMode('high');
    setIsAnimationEnabled(!isReducedMotion);
  }, [isReducedMotion]);

  const registerAnimation = useCallback((id: string) => {
    setActiveAnimations(prev => new Set(prev).add(id));
  }, []);

  const unregisterAnimation = useCallback((id: string) => {
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getAnimationDelay = useCallback((baseDelay: number): number => {
    if (!isAnimationEnabled || isReducedMotion) return 0;
    
    switch (performanceMode) {
      case 'emergency':
        return 0;
      case 'low':
        return baseDelay * 3;
      case 'medium':
        return baseDelay * 2;
      case 'high':
      default:
        return baseDelay;
    }
  }, [isAnimationEnabled, isReducedMotion, performanceMode]);

  const value: AnimationContextType = {
    isAnimationEnabled: isAnimationEnabled && !isReducedMotion,
    isReducedMotion,
    performanceMode,
    toggleAnimations,
    enableEmergencyMode,
    resetPerformanceMode,
    registerAnimation,
    unregisterAnimation,
    getAnimationDelay
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext(): AnimationContextType {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
}

// Hook for safe animation registration with automatic cleanup
export function useAnimationRegistration(animationId: string) {
  const { registerAnimation, unregisterAnimation, isAnimationEnabled, getAnimationDelay } = useAnimationContext();

  useEffect(() => {
    if (isAnimationEnabled) {
      registerAnimation(animationId);
    }
    
    return () => {
      unregisterAnimation(animationId);
    };
  }, [animationId, registerAnimation, unregisterAnimation, isAnimationEnabled]);

  return {
    isAnimationEnabled,
    getAnimationDelay
  };
}