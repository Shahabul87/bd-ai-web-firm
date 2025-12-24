'use client';

import { useEffect, useState } from 'react';

// Simplified animation hook that completely disables animations on mobile
// and limits them on desktop to prevent performance issues
export function useSimplifiedAnimation() {
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for safety
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // More aggressive mobile detection
      setIsMobile(mobile);
    };
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Always skip animations on mobile or during SSR
  const shouldAnimate = mounted && !isMobile;
  
  return {
    isMobile,
    mounted,
    shouldAnimate,
    // Helper to conditionally apply animation classes
    getAnimationClass: (desktopClass: string, mobileClass: string = '') => {
      return shouldAnimate ? desktopClass : mobileClass;
    }
  };
}