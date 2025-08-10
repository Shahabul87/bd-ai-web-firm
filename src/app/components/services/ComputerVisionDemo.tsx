'use client';

import React, { useState, useEffect } from 'react';

export default function ComputerVisionDemo({ isActive }: { isActive: boolean }) {
  const [isScanning, setIsScanning] = useState(false);
  const [detections, setDetections] = useState<Array<{x: number, y: number, label: string, confidence: number}>>([]);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let detectionTimeout: NodeJS.Timeout;
    let nextDetectionTimeout: NodeJS.Timeout;
    
    const runDetection = () => {
      if (!isComponentActive) return;
      
      setIsScanning(true);
      setDetections([]);
      
      detectionTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        
        // Simulate object detection
        const mockDetections = [
          { x: 20, y: 15, label: 'Person', confidence: 0.94 },
          { x: 60, y: 25, label: 'Car', confidence: 0.87 },
          { x: 75, y: 50, label: 'Building', confidence: 0.91 }
        ];
        setDetections(mockDetections);
        setIsScanning(false);
        
        // Schedule next detection
        nextDetectionTimeout = setTimeout(runDetection, 6000);
      }, 2000);
    };
    
    runDetection(); // Start immediately
    
    return () => {
      isComponentActive = false;
      if (detectionTimeout) clearTimeout(detectionTimeout);
      if (nextDetectionTimeout) clearTimeout(nextDetectionTimeout);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">Object Detection</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isScanning ? 'bg-blue-400/20 text-blue-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isScanning ? 'Scanning...' : 'Complete'}
        </div>
      </div>

      {/* Image Canvas */}
      <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg h-48 overflow-hidden">
        {/* Scanning Effect */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-cyan-400 animate-pulse"></div>
            <div className="absolute w-0.5 h-full bg-cyan-400 animate-pulse"></div>
          </div>
        )}
        
        {/* Detection Boxes */}
        {detections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-2 border-green-400 rounded animate-pulse"
            style={{
              left: `${detection.x}%`,
              top: `${detection.y}%`,
              width: '60px',
              height: '40px'
            }}
          >
            <div className="absolute -top-6 left-0 bg-green-400 text-black px-2 py-1 rounded text-xs font-medium">
              {detection.label} {Math.round(detection.confidence * 100)}%
            </div>
          </div>
        ))}
        
        {/* Mock Image Elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="w-8 h-8 bg-slate-500 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection Results */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-300">Detected Objects</div>
        {detections.map((detection, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
            <span className="text-sm text-slate-300">{detection.label}</span>
            <span className="text-xs text-green-400 font-medium">
              {Math.round(detection.confidence * 100)}% confidence
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}