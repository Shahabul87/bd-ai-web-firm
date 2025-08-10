'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnimationCleanup {
  timeouts: Set<NodeJS.Timeout>;
  intervals: Set<number>;
  animationFrames: Set<number>;
  observers: Set<ResizeObserver | IntersectionObserver>;
}

// Centralized animation cleanup manager
export class AnimationCleanupManager {
  private static instance: AnimationCleanupManager;
  private cleanupTasks = new Map<string, AnimationCleanup>();
  
  static getInstance(): AnimationCleanupManager {
    if (!AnimationCleanupManager.instance) {
      AnimationCleanupManager.instance = new AnimationCleanupManager();
    }
    return AnimationCleanupManager.instance;
  }

  registerComponent(componentId: string): AnimationCleanup {
    if (!this.cleanupTasks.has(componentId)) {
      this.cleanupTasks.set(componentId, {
        timeouts: new Set(),
        intervals: new Set(),
        animationFrames: new Set(),
        observers: new Set()
      });
    }
    return this.cleanupTasks.get(componentId)!;
  }

  unregisterComponent(componentId: string): void {
    const cleanup = this.cleanupTasks.get(componentId);
    if (cleanup) {
      this.cleanupComponent(cleanup);
      this.cleanupTasks.delete(componentId);
    }
  }

  private cleanupComponent(cleanup: AnimationCleanup): void {
    // Clear all timeouts
    cleanup.timeouts.forEach(timeout => clearTimeout(timeout));
    cleanup.timeouts.clear();

    // Clear all intervals
    cleanup.intervals.forEach(interval => clearInterval(interval));
    cleanup.intervals.clear();

    // Cancel all animation frames
    cleanup.animationFrames.forEach(frame => cancelAnimationFrame(frame));
    cleanup.animationFrames.clear();

    // Disconnect all observers
    cleanup.observers.forEach(observer => observer.disconnect());
    cleanup.observers.clear();
  }

  emergencyCleanup(): void {
    console.warn('Emergency animation cleanup initiated');
    this.cleanupTasks.forEach((cleanup) => {
      this.cleanupComponent(cleanup);
    });
    this.cleanupTasks.clear();
  }
}

// Enhanced timeout with automatic cleanup
export function useSmartTimeout() {
  const cleanupManager = AnimationCleanupManager.getInstance();
  const componentIdRef = useRef<string>('');
  const cleanupRef = useRef<AnimationCleanup | undefined>(undefined);

  useEffect(() => {
    // Generate ID after mount to avoid hydration mismatch
    if (!componentIdRef.current) {
      componentIdRef.current = `component-${Date.now()}-${Math.random()}`;
    }
    const componentId = componentIdRef.current;
    cleanupRef.current = cleanupManager.registerComponent(componentId);
    
    return () => {
      cleanupManager.unregisterComponent(componentId);
    };
  }, [cleanupManager]);

  const setTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = globalThis.setTimeout(callback, delay);
    cleanupRef.current?.timeouts.add(timeout);
    
    // Auto-remove from set when timeout completes
    globalThis.setTimeout(() => {
      cleanupRef.current?.timeouts.delete(timeout);
    }, delay);
    
    return timeout;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number): number => {
    const interval = globalThis.setInterval(callback, delay) as unknown as number;
    cleanupRef.current?.intervals.add(interval);
    return interval;
  }, []);

  const requestAnimationFrame = useCallback((callback: FrameRequestCallback): number => {
    // Create wrapped callback to auto-cleanup
    let frame: number;
    const wrappedCallback: FrameRequestCallback = (time) => {
      cleanupRef.current?.animationFrames.delete(frame);
      callback(time);
    };
    
    // Only call requestAnimationFrame once with the wrapped callback
    frame = globalThis.requestAnimationFrame(wrappedCallback);
    cleanupRef.current?.animationFrames.add(frame);
    
    return frame;
  }, []);

  const clearTimeout = useCallback((timeout: NodeJS.Timeout): void => {
    globalThis.clearTimeout(timeout);
    cleanupRef.current?.timeouts.delete(timeout);
  }, []);

  const clearInterval = useCallback((interval: number): void => {
    globalThis.clearInterval(interval);
    cleanupRef.current?.intervals.delete(interval);
  }, []);

  const cancelAnimationFrame = useCallback((frame: number): void => {
    globalThis.cancelAnimationFrame(frame);
    cleanupRef.current?.animationFrames.delete(frame);
  }, []);

  return {
    setTimeout,
    setInterval,
    requestAnimationFrame,
    clearTimeout,
    clearInterval,
    cancelAnimationFrame
  };
}

// Performance-aware animation scheduler
export class AnimationScheduler {
  private static instance: AnimationScheduler;
  private frameQueue: Array<() => void> = [];
  private isRunning = false;
  private frameTime = 16; // Target 60fps
  private maxFrameTime = 32; // Max 30fps fallback

  static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }

  scheduleAnimation(callback: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    // Insert based on priority
    const insertIndex = priority === 'high' ? 0 : 
                       priority === 'medium' ? Math.floor(this.frameQueue.length / 2) : 
                       this.frameQueue.length;
    
    this.frameQueue.splice(insertIndex, 0, callback);
    
    if (!this.isRunning) {
      this.startProcessing();
    }
  }

  private startProcessing(): void {
    this.isRunning = true;
    
    const processFrame = (startTime: number) => {
      while (this.frameQueue.length > 0 && (performance.now() - startTime) < this.frameTime) {
        const callback = this.frameQueue.shift();
        if (callback) {
          try {
            callback();
          } catch (error) {
            console.error('Animation callback error:', error);
          }
        }
      }

      if (this.frameQueue.length > 0) {
        requestAnimationFrame(() => processFrame(performance.now()));
      } else {
        this.isRunning = false;
      }
    };

    requestAnimationFrame(() => processFrame(performance.now()));
  }

  clear(): void {
    this.frameQueue.length = 0;
    this.isRunning = false;
  }
}

// Hook for performance-aware animations
export function usePerformanceAwareAnimation() {
  const scheduler = AnimationScheduler.getInstance();
  const cleanupManager = AnimationCleanupManager.getInstance();

  const scheduleAnimation = useCallback((
    callback: () => void, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    scheduler.scheduleAnimation(callback, priority);
  }, [scheduler]);

  // Emergency cleanup function
  const emergencyStop = useCallback(() => {
    scheduler.clear();
    cleanupManager.emergencyCleanup();
  }, [scheduler, cleanupManager]);

  return {
    scheduleAnimation,
    emergencyStop
  };
}

// Utility for batching DOM updates
export function batchDOMUpdates(updates: Array<() => void>): void {
  const scheduler = AnimationScheduler.getInstance();
  
  updates.forEach((update, index) => {
    const priority = index < 3 ? 'high' : index < 6 ? 'medium' : 'low';
    scheduler.scheduleAnimation(update, priority);
  });
}