/**
 * Throttle function that limits the rate at which a function can be called
 * @param func The function to throttle
 * @param delay The minimum time between function calls in milliseconds
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      // Execute immediately if enough time has passed
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      // Schedule execution after the remaining delay
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
        timeoutId = null;
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function that delays function execution until after a period of inactivity
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Hook for using throttled functions in React components
 */
import { useCallback, useRef, useEffect } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastExecTime = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime.current > delay) {
        callback(...args);
        lastExecTime.current = currentTime;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastExecTime.current = Date.now();
          timeoutRef.current = null;
        }, delay - (currentTime - lastExecTime.current));
      }
    },
    [callback, delay]
  ) as T;
  
  return throttledCallback;
}

/**
 * Hook for using debounced functions in React components
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay]
  ) as T;
  
  return debouncedCallback;
}