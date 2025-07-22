"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number, opacity: number}>>([]);
  
  // Optimized particle system with better performance
  useEffect(() => {
    if (!isInView) return;
    
    const createParticle = () => {
      return {
        id: Date.now() + Math.random(),
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: typeof window !== 'undefined' ? window.innerHeight : 600,
        vx: (Math.random() - 0.5) * 0.5, // Slower, smoother movement
        vy: -Math.random() * 1.5 - 0.5, // Always moving up
        life: 100,
        opacity: Math.random() * 0.5 + 0.3
      };
    };

    // Use requestAnimationFrame for smoother animations
    let animationFrame: number;
    
    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.5, // Slower life decay
          opacity: p.opacity * 0.998 // Smooth fade
        })).filter(p => p.life > 0 && p.y > -50);
        
        // Add particles less frequently for smoother performance
        if (updated.length < 20 && Math.random() > 0.7) {
          updated.push(createParticle());
        }
        return updated;
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView]);
  
  return (
    <section ref={ref} className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Interactive Data Particles - Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full transition-opacity duration-300"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
              transform: `scale(${Math.max(0.3, particle.life / 100)})`,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>
      
      {/* Neural Grid Background - Smoother */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-slate-900 via-purple-500/3 to-orange-500/3"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px),
              linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'neural-grid 30s ease-in-out infinite',
            willChange: 'transform'
          }}
        ></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <AICommandInterface isInView={isInView} />
          <LiveDataVisualization isInView={isInView} />
        </div>
      </div>
    </section>
  );
}

function AICommandInterface({ isInView }: { isInView: boolean }) {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, response: string, timestamp: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const commands = useMemo(() => ({
    'analyze market': 'Processing 847M data points... Market trend: ↗️ 23.4% growth opportunity detected',
    'deploy model': 'Initializing ML pipeline... Model deployed successfully. Accuracy: 94.7%',
    'predict sales': 'Forecasting Q4 performance... Predicted revenue: $2.4M (+31% vs Q3)',
    'optimize workflow': 'Scanning 1,247 processes... 12 bottlenecks identified. Efficiency gain: +45%',
    'generate insights': 'Analyzing customer data... 5 actionable insights discovered',
    'status': 'System Status: ✅ All 12 AI models running. Processing 2.4k req/sec'
  }), []);
  
  const commandSuggestions = Object.keys(commands);
  
  const executeCommand = useCallback((cmd: string) => {
    const response = commands[cmd as keyof typeof commands] || 'Command not recognized. Try: ' + commandSuggestions.slice(0, 3).join(', ');
    setCommandHistory(prev => [...prev, { command: cmd, response, timestamp: prev.length }]);
    setCurrentCommand('');
  }, [commands, commandSuggestions]);
  
  useEffect(() => {
    if (isInView) {
      // Auto-demo sequence
      const demoSequence = ['status', 'analyze market', 'predict sales'];
      let index = 0;
      
      const runDemo = () => {
        if (index < demoSequence.length) {
          const cmd = demoSequence[index];
          setCurrentCommand('');
          setIsTyping(true);
          
          // Simulate typing with variable speed
          let charIndex = 0;
          const typeInterval = setInterval(() => {
            setCurrentCommand(cmd.substring(0, charIndex + 1));
            charIndex++;
            if (charIndex >= cmd.length) {
              clearInterval(typeInterval);
              setTimeout(() => {
                executeCommand(cmd);
                setIsTyping(false);
                index++;
                setTimeout(runDemo, 2500);
              }, 300);
            }
          }, 60 + Math.random() * 40); // Variable typing speed
        } else {
          // Reset and loop
          setTimeout(() => {
            setCommandHistory([]);
            index = 0;
            runDemo();
          }, 5000);
        }
      };
      
      setTimeout(runDemo, 1000);
    }
  }, [isInView, executeCommand]);
  
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
    <div className="space-y-6">
      {/* Glitch Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-cyan-400/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-200">AI Command Interface</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="block text-white glitch-text" data-text="Command Your">
            Command Your
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 mt-2 animate-gradient">
            AI Intelligence
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-lg">
          Interact directly with our AI systems. Type commands below to see real-time AI processing.
        </p>
      </div>
      
      {/* Interactive Terminal */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm neural-glow">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">inshyra-ai-terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">ONLINE</span>
          </div>
        </div>
        
        <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {/* Command History */}
          {commandHistory.map((entry, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-slate-500">$</span>
                <span>{entry.command}</span>
              </div>
              <div className="mt-1 text-slate-300 pl-4">
                {entry.response}
              </div>
            </div>
          ))}
          
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
              placeholder="Try: analyze market, deploy model, predict sales..."
              disabled={isTyping}
            />
            {isTyping && <span className="animate-pulse">|</span>}
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
        </div>
      </div>
      
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
    </div>
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
  
  // Initialize neural pattern and mounted state
  useEffect(() => {
    setMounted(true);
    // Generate consistent neural pattern on client side only
    const pattern = Array.from({ length: 24 }, () => Math.random() > 0.6);
    setNeuralPattern(pattern);
  }, []);

  // Smoother live updating metrics
  useEffect(() => {
    if (!isInView || !mounted) return;
    
    const interval = setInterval(() => {
      setIsProcessing(true);
      // Update neural pattern
      setNeuralPattern(prev => prev.map(() => Math.random() > 0.6));
      
      setTimeout(() => {
        setMetrics(prev => ({
          modelsActive: Math.max(10, Math.min(15, prev.modelsActive + (Math.random() > 0.5 ? 1 : -1))),
          dataProcessed: `${(parseFloat(prev.dataProcessed) + 0.05).toFixed(2)}TB`,
          accuracy: Math.min(99.5, Math.max(93, prev.accuracy + (Math.random() - 0.5) * 0.1)),
          requestsPerSec: Math.max(2000, Math.min(4000, prev.requestsPerSec + Math.floor(Math.random() * 100) - 50))
        }));
        setIsProcessing(false);
      }, 800);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isInView, mounted]);
  
  return (
    <div className="space-y-6">
      {/* Live System Monitor */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm neural-glow">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">AI System Monitor</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
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
              <div className="grid grid-cols-8 gap-1">
                {mounted ? neuralPattern.map((isActive, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ease-in-out ${
                      isProcessing
                        ? 'bg-cyan-400 animate-pulse'
                        : isActive
                        ? 'bg-cyan-400/50'
                        : 'bg-slate-600/70'
                    }`}
                    style={{
                      animationDelay: `${i * 30}ms`,
                      transform: isProcessing ? 'scale(1.1)' : 'scale(1)',
                      willChange: 'transform, background-color'
                    }}
                  />
                )) : (
                  // Fallback during SSR - consistent pattern
                  Array.from({ length: 24 }, (_, i) => (
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
      </div>
      
      {/* CTA Section */}
      <div className="text-center space-y-4">
        <button className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1">
          <span className="flex items-center gap-2">
            Deploy Your AI System
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
    </div>
  );
}