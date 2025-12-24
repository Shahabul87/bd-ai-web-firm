'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePerformanceOptimizedAnimation } from '../../hooks/useMobileDetection';

export default function NLPDemo({ isActive }: { isActive: boolean }) {
  const { isMobile, mounted: animationMounted } = usePerformanceOptimizedAnimation();
  const [currentText, setCurrentText] = useState('');
  const [sentiment, setSentiment] = useState({ score: 0, label: 'Neutral' });
  const [entities, setEntities] = useState<string[]>([]);
  
  const sampleTexts = useMemo(() => [
    "I absolutely love this new AI technology! It's revolutionary and will change everything.",
    "The customer service was disappointing and slow. Not satisfied with the experience.",
    "Apple announced new iPhone features. Microsoft and Google are also competing in AI space.",
    "The quarterly earnings exceeded expectations. Revenue grew by 25% this quarter."
  ], []);

  useEffect(() => {
    // AUTO-ANIMATIONS DISABLED to prevent layout shifts
    return;
    if (!isActive || !animationMounted || isMobile) return;
    
    let isComponentActive = true;
    let textIndex = 0;
    let typeFrame: number;
    let analysisTimeout: NodeJS.Timeout;
    let nextTextTimeout: NodeJS.Timeout;
    
    const analyzeText = () => {
      if (!isComponentActive) return;
      
      const text = sampleTexts[textIndex];
      setCurrentText('');
      
      // Optimized typing animation using requestAnimationFrame
      let charIndex = 0;
      let lastTime = 0;
      const typingSpeed = 80; // ms between characters - slower on mobile
      
      const typeChar = (currentTime: number) => {
        if (!isComponentActive) return;
        
        if (currentTime - lastTime >= typingSpeed) {
          setCurrentText(text.substring(0, charIndex + 1));
          charIndex++;
          lastTime = currentTime;
          
          if (charIndex > text.length) {
            // Simulate analysis after typing completes
            analysisTimeout = setTimeout(() => {
              if (!isComponentActive) return;
              
              // Mock sentiment analysis
              const sentimentScore = Math.random() * 2 - 1; // -1 to 1
              setSentiment({
                score: sentimentScore,
                label: sentimentScore > 0.1 ? 'Positive' : sentimentScore < -0.1 ? 'Negative' : 'Neutral'
              });
              
              // Mock entity extraction
              const words = text.split(' ');
              const mockEntities = words.filter(word => 
                word.length > 5 || ['Apple', 'Microsoft', 'Google', 'iPhone'].includes(word)
              );
              setEntities(mockEntities.slice(0, 3));
            }, 1000);
            return;
          }
        }
        
        if (charIndex <= text.length) {
          typeFrame = requestAnimationFrame(typeChar);
        }
      };
      
      typeFrame = requestAnimationFrame(typeChar);
      textIndex = (textIndex + 1) % sampleTexts.length;
    };
    
    const scheduleNextText = () => {
      if (isComponentActive) {
        nextTextTimeout = setTimeout(() => {
          analyzeText();
          scheduleNextText();
        }, 5000);
      }
    };
    
    analyzeText(); // Start immediately
    scheduleNextText();
    
    return () => {
      isComponentActive = false;
      if (typeFrame) cancelAnimationFrame(typeFrame);
      if (analysisTimeout) clearTimeout(analysisTimeout);
      if (nextTextTimeout) clearTimeout(nextTextTimeout);
    };
  }, [isActive, animationMounted, isMobile, sampleTexts]);

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <h4 className="text-lg font-semibold text-slate-200">Text Analysis Engine</h4>
      
      {/* Input Text */}
      <div className="bg-slate-800/50 rounded-lg p-4 min-h-[80px]">
        <div className="text-sm text-slate-400 mb-2">Processing Text:</div>
        <div className="text-slate-200 font-mono text-sm leading-relaxed">
          {currentText}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 gap-4">
        {/* Sentiment */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Sentiment Analysis</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              sentiment.label === 'Positive' ? 'bg-green-400/20 text-green-400' :
              sentiment.label === 'Negative' ? 'bg-red-400/20 text-red-400' :
              'bg-slate-400/20 text-slate-400'
            }`}>
              {sentiment.label}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                sentiment.score > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.abs(sentiment.score) * 50 + 50}%` }}
            />
          </div>
        </div>

        {/* Entities */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-300 mb-2">Detected Entities</div>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-400/20 text-orange-400 rounded text-xs font-medium"
              >
                {entity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}