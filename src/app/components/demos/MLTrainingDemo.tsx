'use client';

import React, { useState, useEffect } from 'react';

interface TrainingMetrics {
  epoch: number;
  accuracy: number;
  loss: number;
  valAccuracy: number;
  valLoss: number;
}

export default function MLTrainingDemo() {
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    epoch: 0,
    accuracy: 0,
    loss: 1.0,
    valAccuracy: 0,
    valLoss: 1.0
  });
  const [progress, setProgress] = useState(0);

  const startTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setMetrics({
      epoch: 0,
      accuracy: 0,
      loss: 1.0,
      valAccuracy: 0,
      valLoss: 1.0
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraining && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 100);
          const epoch = Math.floor(newProgress / 10);
          
          setMetrics({
            epoch: epoch,
            accuracy: Math.min(0.65 + (newProgress * 0.003), 0.95),
            loss: Math.max(1.0 - (newProgress * 0.008), 0.05),
            valAccuracy: Math.min(0.60 + (newProgress * 0.0025), 0.88),
            valLoss: Math.max(1.2 - (newProgress * 0.009), 0.12)
          });

          if (newProgress >= 100) {
            setIsTraining(false);
          }

          return newProgress;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isTraining, progress]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Neural Network Training</h3>
        <button
          onClick={startTraining}
          disabled={isTraining}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isTraining 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:shadow-lg'
          }`}
        >
          {isTraining ? 'Training...' : 'Start Training'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Training Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Epoch</div>
          <div className="text-2xl font-bold text-cyan-400">{metrics.epoch}/10</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-green-400">{(metrics.accuracy * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Loss</div>
          <div className="text-2xl font-bold text-orange-400">{metrics.loss.toFixed(3)}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Val Accuracy</div>
          <div className="text-2xl font-bold text-purple-400">{(metrics.valAccuracy * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Neural Network Visualization */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-8">
          {/* Input Layer */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-400 mb-2">Input</div>
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full ${
                  isTraining ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                }`} 
              />
            ))}
          </div>

          {/* Hidden Layer */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-400 mb-2">Hidden</div>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full ${
                  isTraining ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>

          {/* Output Layer */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-400 mb-2">Output</div>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full ${
                  isTraining ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}