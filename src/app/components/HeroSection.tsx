"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useSmartAnimation } from '../hooks/usePerformanceMonitor';

// Static particles array to prevent recreation on every render
const floatingParticles = [
  { id: 0, initialX: 10, initialY: 20, size: 1, duration: 30, delay: 0 },
  { id: 1, initialX: 30, initialY: 60, size: 2, duration: 35, delay: 3 },
  { id: 2, initialX: 70, initialY: 40, size: 1, duration: 32, delay: 6 },
  { id: 3, initialX: 90, initialY: 80, size: 2, duration: 28, delay: 9 },
];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { shouldSkipAnimation } = useSmartAnimation();
  
  return (
    <motion.section 
      ref={ref} 
      className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Smart Floating Particles - Skip when performance is poor */}
      {!shouldSkipAnimation() && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
          <AnimatePresence>
            {isInView && floatingParticles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full will-change-transform"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `${particle.initialX}%`,
                  top: `${particle.initialY}%`,
                }}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 0.2, 0.3, 0.2, 0], // Further reduced opacity
                  scale: [0, 1, 1.02, 0.98, 0], // Minimal scale changes
                  y: [-20, -35, -50, -65, -80], // Smoother vertical movement
                  x: [0, 2, -2, 1, 0], // Minimal horizontal movement
                }}
                transition={{
                  duration: particle.duration, // Use base duration for smoother animation
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "linear", // Linear for smoother performance
                  repeatType: "loop"
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Neural Grid Background - Smooth Framer Motion */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-slate-900 via-purple-500/3 to-orange-500/3"></div>
        {/* Static background grid - no animation to reduce CPU usage */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px),
              linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <AICommandInterface isInView={isInView} />
          <LiveDataVisualization isInView={isInView} />
        </div>
      </div>
    </motion.section>
  );
}

function AICommandInterface({ isInView }: { isInView: boolean }) {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, response: string, timestamp: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getOptimizedDelay, shouldSkipAnimation } = useSmartAnimation(800);
  
  const commands = useMemo(() => ({
    'train model': 'Initializing AI model training... Dataset loaded. Training in progress...',
    'build website': 'Autonomous web development started... Generating responsive components...',
    'analyze data': 'Processing fintech/healthcare data... Generating visualization pipeline...',
    'deploy pipeline': 'Setting up data preprocessing pipeline... MLOps workflow configured',
    'validate model': 'Running model testing & validation... Performance metrics generated',
    'status': 'AI Development Studio: ✅ Ready for autonomous coding. Low-cost solutions active.'
  }), []);
  
  const commandSuggestions = Object.keys(commands);
  
  const executeCommand = useCallback((cmd: string) => {
    const response = commands[cmd as keyof typeof commands] || 'Command not recognized. Try: ' + commandSuggestions.slice(0, 3).join(', ');
    setCommandHistory(prev => [...prev, { command: cmd, response, timestamp: prev.length }]);
    setCurrentCommand('');
  }, [commands, commandSuggestions]);
  
  useEffect(() => {
    if (!isInView) return;
    
    // Skip animation entirely if performance is poor
    if (shouldSkipAnimation()) {
      return;
    }
    
    // Performance optimized demo sequence with smart delays
    const demoSequence = ['status', 'train model'];
    let index = 0;
    let isActive = true;
    let animationFrameId: number | null = null;
    const timeouts: NodeJS.Timeout[] = [];
    
    const runOptimizedDemo = () => {
      if (!isActive || index >= demoSequence.length) return;
      
      const cmd = demoSequence[index];
      
      // Smart typing - show complete command instantly
      setCurrentCommand(cmd);
      setIsTyping(true);
      
      // Use requestAnimationFrame with performance-aware delays
      const animateTyping = () => {
        if (!isActive) return;
        
        // Dynamic timing based on system performance
        const typingDelay = getOptimizedDelay(1); // Base delay adjusted for performance
        const commandDelay = getOptimizedDelay(5); // Longer delay between commands
        
        const timeout1 = setTimeout(() => {
          if (!isActive) return;
          executeCommand(cmd);
          setIsTyping(false);
          setCurrentCommand('');
          index++;
          
          // Performance-aware delays between commands
          const timeout2 = setTimeout(() => {
            if (!isActive) return;
            runOptimizedDemo();
          }, commandDelay);
          
          timeouts.push(timeout2);
        }, typingDelay);
        
        timeouts.push(timeout1);
      };
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(animateTyping);
    };
    
    // Performance-aware initial delay
    const initialTimeout = setTimeout(runOptimizedDemo, getOptimizedDelay(3));
    timeouts.push(initialTimeout);
    
    // Enhanced cleanup
    return () => {
      isActive = false;
      timeouts.forEach(timeout => clearTimeout(timeout));
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setIsTyping(false);
      setCurrentCommand('');
    };
  }, [isInView, executeCommand, getOptimizedDelay, shouldSkipAnimation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentCommand(value);
    
    // Show suggestions
    if (value.length > 0) {
      const matches = commandSuggestions.filter(cmd => cmd.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(matches.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      executeCommand(currentCommand.trim());
      setSuggestions([]);
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
    >
      {/* Status Badge */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-cyan-400/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.div 
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-sm font-medium text-slate-200">AI Command Interface</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          <motion.span 
            className="block text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            AI-Autonomous
          </motion.span>
          <motion.span 
            className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 mt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Development Studio
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-slate-400 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          Experience our autonomous AI development platform. Low-cost, high-quality solutions for modern businesses.
        </motion.p>
      </motion.div>
      
      {/* Interactive Terminal */}
      <motion.div 
        className="bg-slate-900/90 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm neural-glow"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          boxShadow: commandHistory.length > 0 
            ? "0 25px 50px -12px rgba(34, 211, 238, 0.15)" 
            : "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ 
          duration: 0.8, 
          delay: 1.4,
          boxShadow: { duration: 0.5, ease: "easeOut" }
        }}
        whileHover={{ borderColor: "rgba(34, 211, 238, 0.3)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">cognivat-ai-terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">ONLINE</span>
          </div>
        </div>
        
        <motion.div 
          className="p-4 font-mono text-sm overflow-hidden"
          initial={{ height: "60px" }}
          animate={{ 
            height: commandHistory.length === 0 ? "60px" : `${Math.min(60 + (commandHistory.length * 80), 400)}px`
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut" 
          }}
        >
          {/* Command History with Growing Animation */}
          <AnimatePresence mode="popLayout">
            {commandHistory.map((entry, index) => (
              <motion.div 
                key={index} 
                className="mb-4"
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  height: "auto" 
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  height: 0 
                }}
                transition={{ 
                  duration: 0.4,
                  height: { duration: 0.3, ease: "easeOut" },
                  opacity: { duration: 0.2, delay: 0.1 }
                }}
                layout
              >
                <motion.div 
                  className="flex items-center gap-2 text-cyan-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <span className="text-slate-500">$</span>
                  <span>{entry.command}</span>
                </motion.div>
                <motion.div 
                  className="mt-1 text-slate-300 pl-4"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                >
                  {entry.response}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Current Command */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="bg-transparent border-none outline-none flex-1 text-cyan-400 placeholder-slate-500"
              placeholder="Try: train model, build website, analyze data..."
              disabled={isTyping}
            />
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                |
              </motion.span>
            )}
          </div>
          
          {/* Command Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentCommand(suggestion);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  className="block w-full text-left px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-colors text-xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {commandSuggestions.slice(0, 4).map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setCurrentCommand(cmd);
              executeCommand(cmd);
            }}
            className="px-3 py-1.5 text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-full text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function LiveDataVisualization({ isInView }: { isInView: boolean }) {
  const [metrics, setMetrics] = useState({
    modelsActive: 12,
    dataProcessed: '2.4TB',
    accuracy: 94.7,
    requestsPerSec: 2847
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [neuralPattern, setNeuralPattern] = useState<boolean[]>([]);
  const { getOptimizedDelay, shouldSkipAnimation } = useSmartAnimation(1500);
  
  // Initialize with deterministic pattern to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
    // Use deterministic pattern based on indices to prevent hydration issues
    const pattern = Array.from({ length: 12 }, (_, i) => i % 3 === 0);
    setNeuralPattern(pattern);
  }, []);

  // Ultra-optimized metrics updates with performance awareness
  useEffect(() => {
    if (!isInView || !mounted) return;
    
    // Skip entirely if performance is critical
    if (shouldSkipAnimation()) {
      return;
    }
    
    let isActive = true;
    let animationFrameId: number | null = null;
    
    // Single update cycle with performance-aware timing
    const runSingleUpdateCycle = () => {
      if (!isActive) return;
      
      // Show initial activity
      setIsProcessing(true);
      
      // Update neural pattern once
      setNeuralPattern(prev => prev.map((_, i) => i % 3 === 0));
      
      // Performance-aware metrics update delay
      const metricsDelay = getOptimizedDelay(1);
      const patternDelay = getOptimizedDelay(1.3);
      
      const timeout = setTimeout(() => {
        if (!isActive) return;
        
        setMetrics({
          modelsActive: 14,
          dataProcessed: '2.6TB',
          accuracy: 95.1,
          requestsPerSec: 2934
        });
        setIsProcessing(false);
        
        // Final pattern update with smart delay
        setTimeout(() => {
          if (!isActive) return;
          setNeuralPattern(prev => prev.map((_, i) => i % 4 === 0));
        }, patternDelay);
      }, metricsDelay);
      
      return timeout;
    };
    
    // Performance-aware initial delay
    const initialTimeout = setTimeout(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(runSingleUpdateCycle);
    }, getOptimizedDelay(3));
    
    return () => {
      isActive = false;
      clearTimeout(initialTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setIsProcessing(false);
    };
  }, [isInView, mounted, getOptimizedDelay, shouldSkipAnimation]);
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
    >
      {/* Live System Monitor */}
      <motion.div 
        className="bg-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm neural-glow"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      >
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">AI System Monitor</span>
            <div className="flex items-center gap-2">
              <motion.div 
                className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-orange-400' : 'bg-green-400'}`}
                animate={{ 
                  opacity: isProcessing ? [1, 0.3, 1] : 1,
                  scale: isProcessing ? [1, 1.2, 1] : 1 
                }}
                transition={{ 
                  duration: 1, 
                  repeat: isProcessing ? Infinity : 0, 
                  ease: "easeInOut" 
                }}
              />
              <span className="text-xs text-slate-400">{isProcessing ? 'PROCESSING' : 'LIVE'}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Real-time Metrics - Smooth Transitions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 transition-all duration-500 ease-in-out">
                {metrics.modelsActive}
              </div>
              <div className="text-xs text-slate-400 mt-1">AI Models Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 transition-all duration-500 ease-in-out">
                {metrics.dataProcessed}
              </div>
              <div className="text-xs text-slate-400 mt-1">Data Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 transition-all duration-500 ease-in-out">
                {metrics.accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Avg Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 transition-all duration-500 ease-in-out">
                {metrics.requestsPerSec.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Requests/sec</div>
            </div>
          </div>
          
          {/* Processing Visualization - Fixed Hydration */}
          <div className="relative h-32 bg-slate-800/50 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2">
                {mounted ? neuralPattern.map((isActive, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      isProcessing
                        ? 'bg-cyan-400'
                        : isActive
                        ? 'bg-cyan-400/50'
                        : 'bg-slate-600/70'
                    }`}
                    animate={{
                      scale: isProcessing ? [1, 1.2, 1] : 1,
                      opacity: isProcessing ? [0.5, 1, 0.5] : isActive ? 0.7 : 0.3
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: isProcessing ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                )) : (
                  // Fallback during SSR - consistent pattern
                  Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full transition-all duration-500 ease-in-out bg-slate-600/70"
                      style={{
                        animationDelay: `${i * 30}ms`,
                        transform: 'scale(1)',
                        willChange: 'transform, background-color'
                      }}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-slate-500 font-mono">
              Neural Network Activity
            </div>
          </div>
          
          {/* AI Capabilities */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-200 mb-3">Active AI Capabilities</div>
            {[
              { name: 'Natural Language Processing', status: 'online', load: 87 },
              { name: 'Computer Vision', status: 'online', load: 92 },
              { name: 'Predictive Analytics', status: 'processing', load: 76 },
              { name: 'Anomaly Detection', status: 'online', load: 84 }
            ].map((capability, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    capability.status === 'online' ? 'bg-green-400' : 
                    capability.status === 'processing' ? 'bg-orange-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span className="text-xs text-slate-300">{capability.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                      style={{ width: `${capability.load}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 w-8">{capability.load}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* CTA Section */}
      <div className="text-center space-y-4">
        <button 
          className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Deploy Your AI System - Get started with our AI solutions">
          <span className="flex items-center gap-2">
            Start Your AI Project
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </button>
        
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            99.9% Uptime
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            SOC 2 Compliant
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            24/7 Support
          </span>
        </div>
      </div>
    </motion.div>
  );
}