'use client';

import { useEffect } from 'react';

export default function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent zoom on input focus for iOS
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add touch-action CSS for better mobile scrolling
    document.body.style.touchAction = 'pan-y';
    
    // Detect iOS and add class for specific fixes
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.documentElement.classList.add('ios-device');
    }
    
    // Add passive event listeners for better scroll performance
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Viewport height fix for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
  
  return <>{children}</>;
}