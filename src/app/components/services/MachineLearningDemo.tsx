'use client';

import React, { useState, useEffect } from 'react';

export default function MachineLearningDemo({ isActive }: { isActive: boolean }) {
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let trainingFrame: number;
    let restartTimeout: NodeJS.Timeout;
    
    const startTraining = () => {
      if (!isComponentActive) return;
      
      setIsTraining(true);
      setEpoch(0);
      setAccuracy(0);
      setLoss(1.0);
      
      let lastTime = 0;
      const trainingSpeed = 80; // ms between epochs
      
      const trainEpoch = (currentTime: number) => {
        if (!isComponentActive) return;
        
        if (currentTime - lastTime >= trainingSpeed) {
          setEpoch(prev => {
            const newEpoch = prev + 1;
            if (newEpoch >= 100) {
              setIsTraining(false);
              restartTimeout = setTimeout(startTraining, 3000);
              return 100;
            }
            
            // Simulate learning curve
            const progress = newEpoch / 100;
            setAccuracy(Math.min(99.5, 60 + progress * 35 + Math.random() * 5));
            setLoss(Math.max(0.01, 1.0 - progress * 0.95 + Math.random() * 0.1));
            
            return newEpoch;
          });
          lastTime = currentTime;
        }
        
        trainingFrame = requestAnimationFrame(trainEpoch);
      };
      
      trainingFrame = requestAnimationFrame(trainEpoch);
    };
    
    startTraining();
    
    return () => {
      isComponentActive = false;
      if (trainingFrame) cancelAnimationFrame(trainingFrame);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">Model Training Progress</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isTraining ? 'bg-orange-400/20 text-orange-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isTraining ? 'Training...' : 'Complete'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Epoch {epoch}/100</span>
          <span className="text-slate-400">{Math.round((epoch / 100) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${(epoch / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Accuracy</div>
          <div className="text-xl font-bold text-green-400">{accuracy.toFixed(2)}%</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Loss</div>
          <div className="text-xl font-bold text-red-400">{loss.toFixed(3)}</div>
        </div>
      </div>

      {/* Neural Network Visualization */}
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isTraining && (i + epoch) % 4 === 0
                  ? 'bg-purple-400 animate-pulse'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}