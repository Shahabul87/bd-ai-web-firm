'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
  bundleSize: string;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    renderTime: 0,
    bundleSize: '154KB'
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;
    
    setIsVisible(true);
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // Calculate FPS every second
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage if available
        const memory = (performance as any).memory?.usedJSHeapSize 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0;

        // Get navigation timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navTiming ? Math.round(navTiming.loadEventEnd - navTiming.fetchStart) : 0;
        const renderTime = navTiming ? Math.round(navTiming.domComplete - navTiming.domContentLoadedEventStart) : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
          loadTime,
          renderTime
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isVisible) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono hover:bg-slate-800/90 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${metrics.fps >= 55 ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps} FPS</span>
          </div>
        </button>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Performance</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">FPS:</span>
              <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
            </div>
            
            {metrics.memory > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Memory:</span>
                <span className={getMemoryColor(metrics.memory)}>{metrics.memory} MB</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-slate-400">Load Time:</span>
              <span className="text-cyan-400">{metrics.loadTime}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Render:</span>
              <span className="text-purple-400">{metrics.renderTime}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Bundle:</span>
              <span className="text-orange-400">{metrics.bundleSize}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-500">
              Hybrid Animation Mode
            </div>
            <div className="text-xs text-green-400 mt-1">
              CSS: 90% | Framer: 10%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}