'use client';

import React, { useState, useEffect } from 'react';

export default function AIAutomationDemo({ isActive }: { isActive: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomStats, setRandomStats] = useState({ tasks: 147, time: 23 });

  // Initialize mounted state and random stats
  useEffect(() => {
    setMounted(true);
    setRandomStats({
      tasks: Math.floor(Math.random() * 50) + 100,
      time: Math.floor(Math.random() * 10) + 15
    });
  }, []);

  const workflowSteps = [
    { name: 'Data Ingestion', status: 'completed', duration: 2 },
    { name: 'Processing', status: 'active', duration: 3 },
    { name: 'Analysis', status: 'pending', duration: 2 },
    { name: 'Decision', status: 'pending', duration: 1 },
    { name: 'Action', status: 'pending', duration: 2 }
  ];

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let stepTimeout: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;
    let restartTimeout: NodeJS.Timeout;
    
    const runWorkflow = () => {
      if (!isComponentActive) return;
      
      setIsRunning(true);
      setCurrentStep(0);
      
      let currentStepIndex = 0;
      
      const processNextStep = () => {
        if (!isComponentActive) return;
        
        if (currentStepIndex >= workflowSteps.length - 1) {
          completeTimeout = setTimeout(() => {
            if (!isComponentActive) return;
            setIsRunning(false);
            restartTimeout = setTimeout(runWorkflow, 2000);
          }, 1000);
          return;
        }
        
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
        stepTimeout = setTimeout(processNextStep, 1500);
      };
      
      stepTimeout = setTimeout(processNextStep, 1500);
    };
    
    runWorkflow();
    
    return () => {
      isComponentActive = false;
      if (stepTimeout) clearTimeout(stepTimeout);
      if (completeTimeout) clearTimeout(completeTimeout);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, [isActive, workflowSteps.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">AI Workflow Engine</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isRunning ? 'bg-blue-400/20 text-blue-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isRunning ? 'Processing...' : 'Complete'}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        {workflowSteps.map((step, index) => (
          <div key={step.name} className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              index < currentStep ? 'bg-green-400 text-black' :
              index === currentStep ? 'bg-blue-400 text-black animate-pulse' :
              'bg-slate-600 text-slate-400'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            
            {/* Step Info */}
            <div className="flex-1">
              <div className={`font-medium ${
                index <= currentStep ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {step.name}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    index < currentStep ? 'bg-green-400 w-full' :
                    index === currentStep ? 'bg-blue-400' :
                    'bg-transparent w-0'
                  }`}
                  style={{ 
                    width: index === currentStep ? '100%' : undefined
                  }}
                />
              </div>
            </div>
            
            {/* Duration */}
            <div className="text-xs text-slate-500">
              {step.duration}s
            </div>
          </div>
        ))}
      </div>

      {/* Process Statistics */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Tasks Automated</div>
          <div className="text-lg font-bold text-green-400">
            {isRunning ? 125 : (mounted ? randomStats.tasks : 147)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Time Saved</div>
          <div className="text-lg font-bold text-purple-400">
            {isRunning ? 18 : (mounted ? randomStats.time : 23)}h
          </div>
        </div>
      </div>
    </div>
  );
}