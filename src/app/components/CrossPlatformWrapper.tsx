'use client';

import React, { useEffect, useState } from 'react';

// Define proper types for polyfills
type IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

// Define window extension types
interface WindowWithPolyfills extends Window {
  IntersectionObserver?: typeof IntersectionObserver;
  ResizeObserver?: typeof ResizeObserver;
}

interface BrowserInfo {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isIE: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsWebGL: boolean;
  supportsIntersectionObserver: boolean;
  supportsResizeObserver: boolean;
}

interface CrossPlatformWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const CrossPlatformWrapper: React.FC<CrossPlatformWrapperProps> = ({ children, fallback }) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isCompatible, setIsCompatible] = useState(true);

  useEffect(() => {
    const detectBrowser = (): BrowserInfo => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      
      const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
      const isFirefox = /Firefox/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
      const isEdge = /Edg/.test(userAgent);
      const isIE = /MSIE|Trident/.test(userAgent);
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\b(?:Tablet|Tab)\b)/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      // Feature detection
      const supportsWebGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch {
          return false;
        }
      })();

      const supportsIntersectionObserver = 'IntersectionObserver' in window;
      const supportsResizeObserver = 'ResizeObserver' in window;

      return {
        isChrome,
        isFirefox,
        isSafari,
        isEdge,
        isIE,
        isMobile,
        isTablet,
        isDesktop,
        supportsWebGL,
        supportsIntersectionObserver,
        supportsResizeObserver
      };
    };

    const info = detectBrowser();
    setBrowserInfo(info);

    // Check compatibility
    const compatible = !info.isIE && (info.supportsIntersectionObserver || info.isIE);
    setIsCompatible(compatible);

    // Add browser classes to body
    if (typeof document !== 'undefined') {
      const body = document.body;
      body.classList.remove('chrome', 'firefox', 'safari', 'edge', 'ie', 'mobile', 'tablet', 'desktop');
      
      if (info.isChrome) body.classList.add('chrome');
      if (info.isFirefox) body.classList.add('firefox');
      if (info.isSafari) body.classList.add('safari');
      if (info.isEdge) body.classList.add('edge');
      if (info.isIE) body.classList.add('ie');
      if (info.isMobile) body.classList.add('mobile');
      if (info.isTablet) body.classList.add('tablet');
      if (info.isDesktop) body.classList.add('desktop');
    }

    // Polyfills for older browsers - gracefully handle missing packages
    if (!info.supportsIntersectionObserver) {
      // Create a simple fallback for IntersectionObserver
      if (typeof window !== 'undefined' && !window.IntersectionObserver) {
        (window as WindowWithPolyfills).IntersectionObserver = class {
          root: Element | null = null;
          rootMargin: string = '0px';
          thresholds: ReadonlyArray<number> = [0];
          
          constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            this.root = (options?.root instanceof Element) ? options.root : null;
            this.rootMargin = options?.rootMargin || '0px';
            this.thresholds = options?.threshold ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : [0];
            
            // Simple fallback - immediately trigger callback
            setTimeout(() => {
              const body = document.body;
              if (body) {
                callback([{ 
                  isIntersecting: true, 
                  target: body,
                  boundingClientRect: body.getBoundingClientRect(),
                  intersectionRatio: 1,
                  intersectionRect: body.getBoundingClientRect(),
                  rootBounds: null,
                  time: Date.now()
                } as IntersectionObserverEntry], this as IntersectionObserver);
              }
            }, 100);
          }
          observe() {}
          unobserve() {}
          disconnect() {}
          takeRecords(): IntersectionObserverEntry[] {
            return [];
          }
        } as typeof IntersectionObserver;
      }
    }

    if (!info.supportsResizeObserver) {
      // Create a simple fallback for ResizeObserver
      if (typeof window !== 'undefined' && !window.ResizeObserver) {
        (window as WindowWithPolyfills).ResizeObserver = class {
          callback: ResizeObserverCallback;
          handleResize: () => void;
          
          constructor(callback: ResizeObserverCallback) {
            this.callback = callback;
            this.handleResize = () => {
              const body = document.body;
              if (body) {
                this.callback([{ 
                  target: body,
                contentRect: { 
                  width: window.innerWidth, 
                  height: window.innerHeight,
                  top: 0,
                  left: 0,
                  bottom: window.innerHeight,
                  right: window.innerWidth,
                  x: 0,
                  y: 0,
                  toJSON: () => ({ 
                    width: window.innerWidth, 
                    height: window.innerHeight,
                    top: 0,
                    left: 0,
                    bottom: window.innerHeight,
                    right: window.innerWidth,
                    x: 0,
                    y: 0
                  })
                },
                borderBoxSize: [{ blockSize: window.innerHeight, inlineSize: window.innerWidth }],
                contentBoxSize: [{ blockSize: window.innerHeight, inlineSize: window.innerWidth }],
                devicePixelContentBoxSize: [{ blockSize: window.innerHeight, inlineSize: window.innerWidth }]
              } as ResizeObserverEntry], this as ResizeObserver);
              }
            };
            window.addEventListener('resize', this.handleResize);
          }
          
          observe() {}
          unobserve() {}
          disconnect() {
            window.removeEventListener('resize', this.handleResize);
          }
        } as typeof ResizeObserver;
      }
    }

  }, []);

  if (!browserInfo) {
    return (
      <div className="loading-spinner flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!isCompatible && fallback) {
    return <>{fallback}</>;
  }

  if (browserInfo.isIE) {
    return (
      <div className="ie-warning bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Browser Not Supported!</strong>
        <span className="block sm:inline"> Please upgrade to a modern browser like Chrome, Firefox, Safari, or Edge for the best experience.</span>
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-400 text-slate-900 rounded-lg hover:bg-cyan-300 transition-colors inline-block"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`cross-platform-wrapper ${browserInfo.isMobile ? 'mobile-optimized' : ''} ${browserInfo.isTablet ? 'tablet-optimized' : ''} ${browserInfo.isDesktop ? 'desktop-optimized' : ''}`}
      data-browser={
        browserInfo.isChrome ? 'chrome' :
        browserInfo.isFirefox ? 'firefox' :
        browserInfo.isSafari ? 'safari' :
        browserInfo.isEdge ? 'edge' : 'unknown'
      }
    >
      {children}
    </div>
  );
};

export default CrossPlatformWrapper;

// Utility hook for browser detection
export const useBrowserDetection = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    const detectBrowser = (): BrowserInfo => {
      if (typeof window === 'undefined') {
        return {
          isChrome: false,
          isFirefox: false,
          isSafari: false,
          isEdge: false,
          isIE: false,
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          supportsWebGL: false,
          supportsIntersectionObserver: false,
          supportsResizeObserver: false
        };
      }

      const userAgent = window.navigator.userAgent;
      
      const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
      const isFirefox = /Firefox/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
      const isEdge = /Edg/.test(userAgent);
      const isIE = /MSIE|Trident/.test(userAgent);
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\b(?:Tablet|Tab)\b)/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      const supportsWebGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch {
          return false;
        }
      })();

      const supportsIntersectionObserver = 'IntersectionObserver' in window;
      const supportsResizeObserver = 'ResizeObserver' in window;

      return {
        isChrome,
        isFirefox,
        isSafari,
        isEdge,
        isIE,
        isMobile,
        isTablet,
        isDesktop,
        supportsWebGL,
        supportsIntersectionObserver,
        supportsResizeObserver
      };
    };

    setBrowserInfo(detectBrowser());
  }, []);

  return browserInfo;
};

// Utility function for feature detection
export const hasFeatureSupport = (feature: string): boolean => {
  if (typeof window === 'undefined') return false;

  switch (feature) {
    case 'webgl':
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
      } catch {
        return false;
      }
    case 'intersectionobserver':
      return 'IntersectionObserver' in window;
    case 'resizeobserver':
      return 'ResizeObserver' in window;
    case 'webp':
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    case 'flexbox':
      const div = document.createElement('div');
      div.style.display = 'flex';
      return div.style.display === 'flex';
    case 'grid':
      const gridDiv = document.createElement('div');
      gridDiv.style.display = 'grid';
      return gridDiv.style.display === 'grid';
    default:
      return false;
  }
};