'use client';

import React, { useEffect, useState } from 'react';
import { useBrowserDetection } from './CrossPlatformWrapper';

interface MobileOptimizedProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  tabletComponent?: React.ReactNode;
  desktopComponent?: React.ReactNode;
  className?: string;
}

const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  mobileComponent,
  tabletComponent,
  desktopComponent,
  className = ''
}) => {
  const browserInfo = useBrowserDetection();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !browserInfo) {
    return <div className={className}>{children}</div>;
  }

  // Return mobile-specific component if available and on mobile
  if (browserInfo.isMobile && mobileComponent) {
    return <div className={`${className} mobile-optimized`}>{mobileComponent}</div>;
  }

  // Return tablet-specific component if available and on tablet
  if (browserInfo.isTablet && tabletComponent) {
    return <div className={`${className} tablet-optimized`}>{tabletComponent}</div>;
  }

  // Return desktop-specific component if available and on desktop
  if (browserInfo.isDesktop && desktopComponent) {
    return <div className={`${className} desktop-optimized`}>{desktopComponent}</div>;
  }

  // Return default children with appropriate device class
  const deviceClass = browserInfo.isMobile ? 'mobile-optimized' : 
                      browserInfo.isTablet ? 'tablet-optimized' : 
                      'desktop-optimized';

  return (
    <div className={`${className} ${deviceClass}`}>
      {children}
    </div>
  );
};

export default MobileOptimized;

// Utility component for touch-friendly buttons
export const TouchFriendlyButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  const browserInfo = useBrowserDetection();
  
  const touchStyles = browserInfo?.isMobile || browserInfo?.isTablet ? 
    'min-h-[44px] min-w-[44px] touch-manipulation' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${touchStyles} smooth-click`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </button>
  );
};

// Utility component for responsive text
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  className?: string;
}> = ({ 
  children, 
  mobileSize = 'text-sm', 
  tabletSize = 'text-base', 
  desktopSize = 'text-lg',
  className = ''
}) => {
  return (
    <span className={`${mobileSize} sm:${tabletSize} lg:${desktopSize} ${className}`}>
      {children}
    </span>
  );
};

// Utility component for responsive spacing
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  mobilePadding?: string;
  tabletPadding?: string;
  desktopPadding?: string;
  className?: string;
}> = ({ 
  children, 
  mobilePadding = 'p-4', 
  tabletPadding = 'p-6', 
  desktopPadding = 'p-8',
  className = ''
}) => {
  return (
    <div className={`${mobilePadding} sm:${tabletPadding} lg:${desktopPadding} ${className}`}>
      {children}
    </div>
  );
};