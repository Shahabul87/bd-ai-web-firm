"use client";

import { useEffect, useState } from 'react';

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="relative w-full overflow-x-hidden min-h-screen bg-gradient-to-bl from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern - Hide on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-100"></div>
      )}
      
      {/* Simple gradient background for all devices - no blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-purple-500/3 pointer-events-none"></div>
      
      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}