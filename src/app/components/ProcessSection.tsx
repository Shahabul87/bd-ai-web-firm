"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualTransition, setIsManualTransition] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomMetrics, setRandomMetrics] = useState({ efficiency: 87, time: 18, quality: 97 });
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // Initialize mounted state and random metrics
  useEffect(() => {
    setMounted(true);
    setRandomMetrics({
      efficiency: Math.floor(Math.random() * 20 + 80),
      time: Math.floor(Math.random() * 5 + 15),
      quality: Math.floor(Math.random() * 10 + 95)
    });
  }, []);

  const processSteps = [
    {
      id: 'discovery',
      commit: 'feat: AI business analysis initiated',
      timestamp: '2min ago',
      title: 'AI-Powered Discovery',
      description: 'Advanced algorithms analyze your business requirements, competition, and target audience to create comprehensive project insights.',
      icon: '🔍',
      color: 'from-cyan-400 to-purple-500',
      svgComponent: DiscoverySVG
    },
    {
      id: 'design',
      commit: 'feat: generative design concepts created',
      timestamp: '5min ago',
      title: 'Generative AI Design',
      description: 'Neural networks generate multiple design variations, optimize user experience patterns, and create brand-aligned visual concepts.',
      icon: '🎨',
      color: 'from-purple-500 to-orange-500',
      svgComponent: DesignSVG
    },
    {
      id: 'development',
      commit: 'feat: AI-assisted code generation complete',
      timestamp: '8min ago',
      title: 'Intelligent Development',
      description: 'AI coding assistants accelerate development with automated testing, code optimization, and real-time quality assurance.',
      icon: '⚡',
      color: 'from-orange-500 to-green-400',
      svgComponent: DevelopmentSVG
    },
    {
      id: 'launch',
      commit: 'feat: automated deployment & monitoring active',
      timestamp: '12min ago',
      title: 'Smart Launch & Scale',
      description: 'Automated deployment pipelines, performance monitoring, and AI-driven optimizations ensure flawless launches.',
      icon: '🚀',
      color: 'from-green-400 to-cyan-400',
      svgComponent: LaunchSVG
    }
  ];

  // Auto-cycle through steps with optimized requestAnimationFrame
  useEffect(() => {
    if (!isInView) return;
    
    let isActive = true;
    let currentTimeout: NodeJS.Timeout;
    let animationFrame: number;
    
    const cycleSteps = () => {
      if (!isActive) return;
      
      setIsProcessing(true);
      currentTimeout = setTimeout(() => {
        if (!isActive) return;
        setActiveStep((prev) => (prev + 1) % processSteps.length);
        currentTimeout = setTimeout(() => {
          if (!isActive) return;
          setIsProcessing(false);
          // Schedule next cycle using requestAnimationFrame for better performance
          animationFrame = requestAnimationFrame(() => {
            currentTimeout = setTimeout(cycleSteps, 7200); // 8s total cycle
          });
        }, 800);
      }, 1200);
    };
    
    // Initial delay before starting
    currentTimeout = setTimeout(cycleSteps, 8000);
    
    return () => {
      isActive = false;
      if (currentTimeout) clearTimeout(currentTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, processSteps.length]);

  // Handle manual step changes with smooth transitions
  const handleStepClick = (index: number) => {
    if (index === activeStep || isManualTransition) return; // Prevent rapid clicks
    
    setIsManualTransition(true);
    setIsProcessing(true);
    
    setTimeout(() => {
      setActiveStep(index);
      setTimeout(() => {
        setIsProcessing(false);
        setTimeout(() => {
          setIsManualTransition(false);
        }, 200); // Allow new clicks after transition completes
      }, 600); // Smooth manual transition
    }, 300); // Brief processing state for manual clicks
  };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl opacity-3 dark:opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-300/60 dark:bg-slate-800/60 backdrop-blur-sm border border-cyan-400/30 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Live AI Development Process</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 animate-gradient">AI-Powered</span> Process
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Watch our AI systems work in real-time. Each step is powered by advanced algorithms 
            that learn, adapt, and optimize for exceptional results.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Git-style Timeline */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400">ai-development-pipeline</span>
              <div className="flex items-center gap-2 ml-auto">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">{isProcessing ? 'PROCESSING' : 'ACTIVE'}</span>
              </div>
            </div>

            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative cursor-pointer transition-all duration-700 ease-out smooth-click layout-stable ${
                  index === activeStep ? 'scale-105 opacity-100' : 'opacity-70 hover:opacity-95 hover:scale-102'
                }`}
                onClick={() => handleStepClick(index)}
              >
                {/* Timeline Line */}
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                
                {/* Commit Node */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xl shadow-lg transition-all duration-1000 ease-in-out ${
                    index === activeStep ? '' : ''
                  }`}
                    style={{
                      transform: index === activeStep ? 'scale(1.1)' : 'scale(1)',
                      opacity: index === activeStep ? 1 : 0.8
                    }}
                  >
                    {index === activeStep ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    ) : (
                      step.icon
                    )}
                  </div>
                  
                  <div className="flex-1 bg-white/70 dark:bg-slate-900/70 rounded-lg p-4 border border-slate-300/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-1000 ease-in-out"
                    style={{
                      borderColor: index === activeStep ? 'rgba(0, 229, 255, 0.3)' : 'rgba(51, 65, 85, 0.5)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-green-400">
                        {step.commit}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-500">{step.timestamp}</span>
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 ${
                      index === activeStep 
                        ? `text-transparent bg-clip-text bg-gradient-to-r ${step.color}` 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {index === activeStep && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 200}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-cyan-400 font-medium">AI Processing Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Terminal Output */}
            <div className="bg-slate-100/80 dark:bg-slate-950/80 rounded-lg p-4 border border-slate-300/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">$ ai-process-monitor --live</span>
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-green-400">✓ Neural networks initialized</div>
                <div className="text-cyan-400">→ Processing step: {processSteps[activeStep].title}</div>
                <div className="text-orange-400">⚡ AI efficiency: 94.7%</div>
                <div className="text-purple-400">📊 Performance metrics: Optimal</div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-300/50 dark:border-slate-700/50 p-8 backdrop-blur-sm neural-glow transition-all duration-700 ease-out">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI Process Visualization</h4>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isProcessing 
                    ? 'bg-orange-400/20 text-orange-400 animate-pulse' 
                    : 'bg-green-400/20 text-green-400'
                }`}>
                  {isProcessing ? 'Processing...' : 'Active'}
                </div>
              </div>
            </div>
            
            {/* Dynamic SVG Content */}
            <div className="h-96 flex items-center justify-center">
              {React.createElement(processSteps[activeStep].svgComponent, { 
                isActive: true,
                isProcessing
              })}
            </div>
            
            {/* Process Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${processSteps[activeStep].color} transition-all duration-1000 ease-in-out`}>
                  {isProcessing ? '...' : mounted ? randomMetrics.efficiency : 87}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Efficiency</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${processSteps[activeStep].color} transition-all duration-1000 ease-in-out`}>
                  {isProcessing ? '...' : mounted ? randomMetrics.time : 18}s
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Process Time</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${processSteps[activeStep].color} transition-all duration-1000 ease-in-out`}>
                  {isProcessing ? '...' : mounted ? randomMetrics.quality : 97}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Quality Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="group px-8 py-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-500 ease-in-out transform hover:-translate-y-1 smooth-click active:scale-95">
            <span className="flex items-center gap-2">
              Experience Our AI Process
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          
          <p className="text-slate-600 dark:text-slate-500 text-sm mt-4">
            Join 500+ businesses that have transformed with our AI-powered development
          </p>
        </div>
      </div>
    </section>
  );
}

// SVG Component for Discovery Step
function DiscoverySVG({ isActive, isProcessing }: { isActive: boolean; isProcessing: boolean }) {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let scanFrame: number;
    let lastTime = 0;
    const scanSpeed = 120; // ms between progress updates
    
    const updateScan = (currentTime: number) => {
      if (!isComponentActive) return;
      
      if (currentTime - lastTime >= scanSpeed) {
        setScanProgress(prev => (prev + 2) % 100);
        lastTime = currentTime;
      }
      
      scanFrame = requestAnimationFrame(updateScan);
    };
    
    scanFrame = requestAnimationFrame(updateScan);
    
    return () => {
      isComponentActive = false;
      if (scanFrame) cancelAnimationFrame(scanFrame);
    };
  }, [isActive]);

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="discoveryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Background Grid */}
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
      </pattern>
      <rect width="400" height="300" fill="url(#grid)" />

      {/* Data Nodes */}
      {[
        { x: 80, y: 80, label: 'Market Data' },
        { x: 200, y: 60, label: 'User Behavior' },
        { x: 320, y: 100, label: 'Competition' },
        { x: 120, y: 180, label: 'Business Goals' },
        { x: 280, y: 200, label: 'Tech Stack' }
      ].map((node, index) => (
        <g key={index}>
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill="url(#discoveryGradient)"
            className={`${isProcessing ? 'animate-pulse' : ''}`}
          />
          <text
            x={node.x}
            y={node.y + 25}
            textAnchor="middle"
            className="fill-slate-400 text-xs"
          >
            {node.label}
          </text>
          
          {/* Connections */}
          {index > 0 && (
            <line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="150"
              stroke="url(#discoveryGradient)"
              strokeWidth="1"
              opacity="0.6"
              className="transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: isProcessing ? 0.8 : 0.4,
                animation: 'none'
              }}
            />
          )}
        </g>
      ))}

      {/* Central AI Brain */}
      <circle 
        cx="200" 
        cy="150" 
        r="20" 
        fill="none" 
        stroke="url(#discoveryGradient)" 
        strokeWidth="2" 
        className="transition-all duration-1000 ease-in-out"
        style={{
          opacity: isProcessing ? 1 : 0.7,
          strokeWidth: isProcessing ? 3 : 2
        }}
      />
      <circle 
        cx="200" 
        cy="150" 
        r="15" 
        fill="url(#discoveryGradient)" 
        className="transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: isProcessing ? 0.5 : 0.3
        }}
      />
      <text x="200" y="155" textAnchor="middle" className="fill-white text-sm font-bold">AI</text>

      {/* Scanning Line */}
      {isActive && (
        <line
          x1={scanProgress * 4}
          y1="50"
          x2={scanProgress * 4}
          y2="250"
          stroke="url(#scanGradient)"
          strokeWidth="3"
          opacity="0.8"
        />
      )}

      {/* Analysis Results */}
      <rect x="50" y="240" width="300" height="40" rx="5" fill="#1E293B" stroke="url(#discoveryGradient)" strokeWidth="1" opacity="0.8"/>
      <text x="200" y="260" textAnchor="middle" className="fill-cyan-400 text-sm">
        {isProcessing ? 'Analyzing business requirements...' : '✓ Business analysis complete'}
      </text>
    </svg>
  );
}

// SVG Component for Design Step
function DesignSVG({ isActive, isProcessing }: { isActive: boolean; isProcessing: boolean }) {
  const [designIteration, setDesignIteration] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let iterationTimeout: NodeJS.Timeout;
    
    const nextIteration = () => {
      if (!isComponentActive) return;
      
      setDesignIteration(prev => (prev + 1) % 4);
      iterationTimeout = setTimeout(nextIteration, 2500);
    };
    
    iterationTimeout = setTimeout(nextIteration, 2500);
    
    return () => {
      isComponentActive = false;
      if (iterationTimeout) clearTimeout(iterationTimeout);
    };
  }, [isActive]);

  const designs = [
    { name: 'Concept A', color: '#00E5FF' },
    { name: 'Concept B', color: '#8B5CF6' },
    { name: 'Concept C', color: '#FF6D00' },
    { name: 'Final Design', color: '#00E676' }
  ];

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="designGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
      </defs>

      {/* Design Canvas */}
      <rect x="50" y="50" width="300" height="200" rx="10" fill="#0F172A" stroke="url(#designGradient)" strokeWidth="2"/>
      
      {/* Mock UI Elements */}
      <g opacity={designIteration === 0 ? "1" : "0.3"} className="transition-all duration-1000 ease-in-out">
        <rect x="70" y="70" width="260" height="20" rx="5" fill="#00E5FF" opacity="0.6"/>
        <rect x="70" y="100" width="120" height="60" rx="5" fill="#00E5FF" opacity="0.4"/>
        <rect x="210" y="100" width="120" height="60" rx="5" fill="#00E5FF" opacity="0.4"/>
        <rect x="70" y="180" width="260" height="40" rx="5" fill="#00E5FF" opacity="0.3"/>
      </g>

      <g opacity={designIteration === 1 ? "1" : "0.3"} className="transition-all duration-1000 ease-in-out">
        <rect x="70" y="70" width="260" height="20" rx="5" fill="#8B5CF6" opacity="0.6"/>
        <circle cx="150" cy="130" r="30" fill="#8B5CF6" opacity="0.4"/>
        <circle cx="250" cy="130" r="30" fill="#8B5CF6" opacity="0.4"/>
        <rect x="70" y="180" width="260" height="40" rx="20" fill="#8B5CF6" opacity="0.5"/>
      </g>

      <g opacity={designIteration === 2 ? "1" : "0.3"} className="transition-all duration-1000 ease-in-out">
        <rect x="70" y="70" width="260" height="15" rx="8" fill="#FF6D00" opacity="0.6"/>
        <polygon points="150,100 180,130 150,160 120,130" fill="#FF6D00" opacity="0.4"/>
        <polygon points="250,100 280,130 250,160 220,130" fill="#FF6D00" opacity="0.4"/>
        <rect x="70" y="180" width="260" height="30" rx="15" fill="#FF6D00" opacity="0.4"/>
      </g>

      <g opacity={designIteration === 3 ? "1" : "0.3"} className="transition-all duration-1000 ease-in-out">
        <rect x="70" y="70" width="260" height="20" rx="10" fill="#00E676" opacity="0.8"/>
        <rect x="70" y="100" width="80" height="80" rx="10" fill="#00E676" opacity="0.6"/>
        <rect x="160" y="100" width="80" height="80" rx="10" fill="#00E676" opacity="0.6"/>
        <rect x="250" y="100" width="80" height="80" rx="10" fill="#00E676" opacity="0.6"/>
        <rect x="70" y="190" width="260" height="30" rx="15" fill="#00E676" opacity="0.7"/>
      </g>

      {/* AI Generator */}
      <circle 
        cx="200" 
        cy="270" 
        r="15" 
        fill="url(#designGradient)" 
        className="transition-all duration-1000 ease-in-out"
        style={{
          opacity: isProcessing ? 1 : 0.8,
          transform: isProcessing ? 'scale(1.1)' : 'scale(1)'
        }}
      />
      <text x="200" y="275" textAnchor="middle" className="fill-white text-xs font-bold">AI</text>

      {/* Design Info */}
      <rect x="50" y="10" width="300" height="25" rx="5" fill="#1E293B" stroke={designs[designIteration].color} strokeWidth="1"/>
      <text x="200" y="25" textAnchor="middle" className="fill-white text-sm">
        Generating: {designs[designIteration].name}
      </text>

      {/* Progress Indicators */}
      <g transform="translate(50, 280)">
        {designs.map((design, index) => (
          <rect
            key={index}
            x={index * 80}
            y="0"
            width="70"
            height="4"
            rx="2"
            fill={index <= designIteration ? design.color : '#334155'}
            className="transition-all duration-1000 ease-in-out"
          />
        ))}
      </g>
    </svg>
  );
}

// SVG Component for Development Step
function DevelopmentSVG({ isActive, isProcessing }: { isActive: boolean; isProcessing: boolean }) {
  const [codeLines, setCodeLines] = useState(0);
  
  // Deterministic widths for code lines to avoid hydration issues
  const codeLineWidths = [180, 220, 160, 200, 240, 190, 170, 210, 250, 185, 195, 175, 230, 165, 205];

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let codeTimeout: NodeJS.Timeout;
    
    const generateCodeLine = () => {
      if (!isComponentActive) return;
      
      setCodeLines(prev => (prev + 1) % 15);
      codeTimeout = setTimeout(generateCodeLine, 400);
    };
    
    codeTimeout = setTimeout(generateCodeLine, 400);
    
    return () => {
      isComponentActive = false;
      if (codeTimeout) clearTimeout(codeTimeout);
    };
  }, [isActive]);

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6D00" />
          <stop offset="100%" stopColor="#00E676" />
        </linearGradient>
      </defs>

      {/* Code Editor */}
      <rect x="20" y="20" width="360" height="260" rx="10" fill="#0D1117" stroke="url(#codeGradient)" strokeWidth="2"/>
      
      {/* Editor Header */}
      <rect x="20" y="20" width="360" height="30" rx="10" fill="#21262D"/>
      <circle cx="40" cy="35" r="5" fill="#FF5F56"/>
      <circle cx="55" cy="35" r="5" fill="#FFBD2E"/>
      <circle cx="70" cy="35" r="5" fill="#27CA3F"/>
      <text x="200" y="39" textAnchor="middle" className="fill-slate-400 text-xs">ai-generated-component.tsx</text>

      {/* Code Lines */}
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i} opacity={i < codeLines ? "1" : "0.3"} className="transition-all duration-800 ease-in-out">
          <rect
            x="30"
            y={60 + i * 12}
            width={codeLineWidths[i]}
            height="8"
            rx="2"
            fill={i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#8B5CF6" : "#FF6D00"}
            opacity="0.6"
          />
        </g>
      ))}

      {/* AI Assistant */}
      <circle 
        cx="350" 
        cy="250" 
        r="20" 
        fill="url(#codeGradient)" 
        className="transition-all duration-1000 ease-in-out"
        style={{
          opacity: isProcessing ? 1 : 0.8,
          transform: isProcessing ? 'scale(1.05)' : 'scale(1)'
        }}
      />
      <text x="350" y="255" textAnchor="middle" className="fill-white text-xs font-bold">AI</text>

      {/* Code Statistics */}
      <rect x="250" y="100" width="120" height="80" rx="5" fill="#1E293B" stroke="url(#codeGradient)" strokeWidth="1" opacity="0.8"/>
      <text x="310" y="115" textAnchor="middle" className="fill-orange-400 text-xs font-bold">Code Stats</text>
      <text x="260" y="130" className="fill-slate-300 text-xs">Lines: {codeLines * 10 + 247}</text>
      <text x="260" y="145" className="fill-slate-300 text-xs">Quality: 98.5%</text>
      <text x="260" y="160" className="fill-slate-300 text-xs">Tests: ✓ Passing</text>
      <text x="260" y="175" className="fill-slate-300 text-xs">Build: ✓ Success</text>

      {/* Typing Indicator */}
      {isProcessing && (
        <g>
          <rect x="30" y={60 + codeLines * 12} width="8" height="8" fill="#00E5FF" className="animate-ping"/>
        </g>
      )}
    </svg>
  );
}

// SVG Component for Launch Step
function LaunchSVG({ isActive }: { isActive: boolean }) {
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let deploymentFrame: number;
    let lastTime = 0;
    const progressSpeed = 150; // ms between progress updates
    
    const updateProgress = (currentTime: number) => {
      if (!isComponentActive) return;
      
      if (currentTime - lastTime >= progressSpeed) {
        setDeploymentProgress(prev => (prev + 1) % 100);
        lastTime = currentTime;
      }
      
      deploymentFrame = requestAnimationFrame(updateProgress);
    };
    
    deploymentFrame = requestAnimationFrame(updateProgress);
    
    return () => {
      isComponentActive = false;
      if (deploymentFrame) cancelAnimationFrame(deploymentFrame);
    };
  }, [isActive]);

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="launchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <radialGradient id="serverGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E676" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.3"/>
        </radialGradient>
      </defs>

      {/* Rocket */}
      <g transform={`translate(200, ${250 - deploymentProgress * 1.5})`}>
        <path d="M0,-20 L-10,10 L-5,10 L-5,15 L5,15 L5,10 L10,10 Z" fill="url(#launchGradient)"/>
        <circle cx="0" cy="0" r="3" fill="#FF6D00"/>
        
        {/* Exhaust */}
        <g opacity={deploymentProgress > 20 ? "1" : "0"}>
          <path d="M-3,15 L0,25 L3,15" fill="#FF6D00" opacity="0.8" className="animate-pulse"/>
          <path d="M-2,15 L0,30 L2,15" fill="#FF5722" opacity="0.6" className="animate-pulse"/>
        </g>
      </g>

      {/* Servers/Cloud */}
      {[
        { x: 80, y: 80, label: 'CDN' },
        { x: 200, y: 60, label: 'Load Balancer' },
        { x: 320, y: 80, label: 'Database' },
        { x: 120, y: 160, label: 'API Server' },
        { x: 280, y: 160, label: 'Analytics' }
      ].map((server, index) => (
        <g key={index}>
          <rect
            x={server.x - 15}
            y={server.y - 10}
            width="30"
            height="20"
            rx="5"
            fill="url(#serverGradient)"
            className={deploymentProgress > index * 20 ? 'transition-all duration-1000 ease-in-out' : 'transition-all duration-1000 ease-in-out'}
            style={{
              opacity: deploymentProgress > index * 20 ? 1 : 0.6,
              transform: deploymentProgress > index * 20 ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          <circle
            cx={server.x}
            cy={server.y}
            r="3"
            fill={deploymentProgress > index * 20 ? '#00E676' : '#334155'}
            className="transition-all duration-1000 ease-in-out"
          />
          <text
            x={server.x}
            y={server.y + 25}
            textAnchor="middle"
            className="fill-slate-400 text-xs"
          >
            {server.label}
          </text>
        </g>
      ))}

      {/* Connection Lines */}
      {deploymentProgress > 50 && (
        <g className="transition-opacity duration-1000 ease-in-out">
          <line x1="80" y1="80" x2="200" y2="60" stroke="#00E676" strokeWidth="2" opacity="0.6" className="transition-opacity duration-1000 ease-in-out"/>
          <line x1="200" y1="60" x2="320" y2="80" stroke="#00E676" strokeWidth="2" opacity="0.6" className="transition-opacity duration-1000 ease-in-out"/>
          <line x1="120" y1="160" x2="280" y2="160" stroke="#00E676" strokeWidth="2" opacity="0.6" className="transition-opacity duration-1000 ease-in-out"/>
        </g>
      )}

      {/* Global Network */}
      <circle cx="200" cy="230" r="50" fill="none" stroke="url(#launchGradient)" strokeWidth="1" strokeDasharray="5,5" opacity="0.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 230;360 200 230"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Deployment Status */}
      <rect x="50" y="250" width="300" height="30" rx="5" fill="#1E293B" stroke="url(#launchGradient)" strokeWidth="1" opacity="0.9"/>
      <rect x="55" y="255" width={deploymentProgress * 2.9} height="20" rx="3" fill="url(#launchGradient)" opacity="0.7"/>
      <text x="200" y="268" textAnchor="middle" className="fill-white text-xs">
        {deploymentProgress < 100 ? `Deploying... ${deploymentProgress}%` : '🚀 Launch Successful!'}
      </text>
    </svg>
  );
}