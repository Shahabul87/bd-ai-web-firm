'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceOptimizedAnimation } from '../../hooks/useMobileDetection';

export default function DataVisualizationDemo({ isActive }: { isActive: boolean }) {
  const { isMobile, mounted: animationMounted } = usePerformanceOptimizedAnimation();
  const [data, setData] = useState([65, 75, 85, 70, 90, 95, 88]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // AUTO-ANIMATIONS DISABLED to prevent layout shifts
    return;
    if (!isActive || !animationMounted || isMobile) return;
    
    let isComponentActive = true;
    let updateTimeout: NodeJS.Timeout;
    let animationFrame: number;
    
    const updateData = () => {
      if (!isComponentActive) return;
      
      setIsProcessing(true);
      updateTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        setData(prev => prev.map(() => Math.floor(Math.random() * 40) + 60));
        updateTimeout = setTimeout(() => {
          if (!isComponentActive) return;
          setIsProcessing(false);
          // Schedule next update using requestAnimationFrame
          animationFrame = requestAnimationFrame(() => {
            updateTimeout = setTimeout(updateData, 7000); // Longer cycle on mobile
          });
        }, 800);
      }, 1200);
    };
    
    // Initial update - longer delay on mobile
    updateTimeout = setTimeout(updateData, 7000);
    
    return () => {
      isComponentActive = false;
      if (updateTimeout) clearTimeout(updateTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive, animationMounted, isMobile]);

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">Live Data Dashboard</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isProcessing ? 'bg-orange-400/20 text-orange-400' : 'bg-green-400/20 text-green-400'
        }`}>
          {isProcessing ? 'Processing...' : 'Live'}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-32 justify-center">
          {data.map((value, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t transition-all duration-1000 ease-out"
              style={{ 
                height: `${(value / 100) * 100}%`,
                width: '20px',
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
        </div>
        
        {/* Chart Labels */}
        <div className="flex justify-center gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day} className="text-xs text-slate-500 w-[20px] text-center">{day}</span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-cyan-400">
            {mounted ? Math.round(data.reduce((a, b) => a + b) / data.length) : 82}%
          </div>
          <div className="text-xs text-slate-400">Avg Performance</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">
            {mounted ? Math.max(...data) : 95}%
          </div>
          <div className="text-xs text-slate-400">Peak Value</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">
            +12%
          </div>
          <div className="text-xs text-slate-400">Growth</div>
        </div>
      </div>
    </div>
  );
}