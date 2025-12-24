'use client';

import { useEffect, useState } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      // Check for mobile device: screen width < 768px or touch device
      const mobile = window.innerWidth < 768 || 
                    'ontouchstart' in window ||
                    navigator.maxTouchPoints > 0 ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    
    // Add resize listener with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return { isMobile, mounted };
}

// Hook for performance-aware animations
export function usePerformanceOptimizedAnimation() {
  const { isMobile, mounted } = useMobileDetection();
  
  const getAnimationProps = (
    desktopProps: any, 
    mobileProps: any = {}
  ) => {
    if (!mounted) return {}; // Return empty during SSR
    return isMobile ? mobileProps : desktopProps;
  };
  
  const shouldAnimate = () => {
    return mounted && !isMobile;
  };
  
  return {
    isMobile,
    mounted,
    shouldAnimate,
    getAnimationProps
  };
}