'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceOptimizedAnimation } from '../../hooks/useMobileDetection';

export default function PredictiveAnalyticsDemo({ isActive }: { isActive: boolean }) {
  const { isMobile, mounted: animationMounted } = usePerformanceOptimizedAnimation();
  const [forecastData, setForecastData] = useState([45, 52, 48, 61, 55, 67, 59, 74]);
  const [isForecasting, setIsForecasting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomMetrics, setRandomMetrics] = useState({ growth: 15, accuracy: 87, peak: 2 });

  // Initialize mounted state and random metrics
  useEffect(() => {
    setMounted(true);
    setRandomMetrics({
      growth: Math.round(Math.random() * 20 + 10),
      accuracy: Math.round(Math.random() * 10 + 85),
      peak: Math.ceil(Math.random() * 4)
    });
  }, []);

  useEffect(() => {
    // AUTO-ANIMATIONS DISABLED to prevent layout shifts
    return;
    if (!isActive || !animationMounted || isMobile) return;
    
    let isComponentActive = true;
    let forecastTimeout: NodeJS.Timeout;
    let nextForecastTimeout: NodeJS.Timeout;
    
    const runForecast = () => {
      if (!isComponentActive) return;
      
      setIsForecasting(true);
      
      forecastTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        
        // Generate new forecast data
        const baseValue = 50;
        const trend = Math.random() * 10 - 5; // -5 to +5 trend
        const newData = Array.from({ length: 8 }, (_, i) => {
          const trendValue = baseValue + (trend * i / 4);
          const noise = (Math.random() - 0.5) * 10;
          return Math.max(20, Math.min(100, trendValue + noise));
        });
        
        setForecastData(newData);
        setIsForecasting(false);
        
        // Schedule next forecast - longer delay for mobile
        nextForecastTimeout = setTimeout(runForecast, 7000);
      }, 3000); // Longer processing time for mobile
    };
    
    runForecast();
    
    return () => {
      isComponentActive = false;
      if (forecastTimeout) clearTimeout(forecastTimeout);
      if (nextForecastTimeout) clearTimeout(nextForecastTimeout);
    };
  }, [isActive, animationMounted, isMobile]);

  const futureData = [78, 82, 85, 89]; // Mock future predictions

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">Sales Forecasting</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isForecasting ? `bg-purple-400/20 text-purple-400 ${animationMounted && !isMobile ? 'animate-pulse' : ''}` : 'bg-green-400/20 text-green-400'
        }`}>
          {isForecasting ? 'Analyzing...' : 'Predicted'}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="space-y-4">
        <div className="flex items-end gap-1 h-32">
          {/* Historical Data */}
          {forecastData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t transition-all duration-1000"
                style={{ height: `${(value / 100) * 100}%` }}
              />
            </div>
          ))}
          
          {/* Predicted Data */}
          {futureData.map((value, index) => (
            <div key={`future-${index}`} className="flex flex-col items-center flex-1">
              <div
                className="bg-gradient-to-t from-orange-400 to-red-500 rounded-t transition-all duration-1000 opacity-70 border-2 border-dashed border-orange-400"
                style={{ height: `${(value / 100) * 100}%` }}
              />
            </div>
          ))}
        </div>
        
        {/* Timeline */}
        <div className="flex gap-1">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
            <div key={month} className="flex-1 text-center">
              <span className={`text-xs ${index >= 8 ? 'text-orange-400' : 'text-slate-500'}`}>
                {month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-green-400 font-bold">+{mounted ? randomMetrics.growth : 15}%</div>
          <div className="text-xs text-slate-400">Growth</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-cyan-400 font-bold">{mounted ? randomMetrics.accuracy : 87}%</div>
          <div className="text-xs text-slate-400">Accuracy</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-purple-400 font-bold">Q{mounted ? randomMetrics.peak : 2}</div>
          <div className="text-xs text-slate-400">Peak</div>
        </div>
      </div>
    </div>
  );
}