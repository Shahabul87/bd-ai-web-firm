"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function CodeShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-cyan-400 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
              See AI in Action
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Watch our AI systems work in real-time. From data processing to model deployment, 
            experience the power of intelligent automation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-200">
              Real-Time AI Development
            </h3>
            <p className="text-lg text-slate-400">
              Our platform demonstrates live AI workflows including data pipeline creation, 
              model training, and intelligent agent deployment.
            </p>
            <div className="space-y-4">
              <FeatureItem 
                icon="🔄" 
                title="Automated Workflows" 
                description="Self-optimizing processes that adapt to your data"
              />
              <FeatureItem 
                icon="⚡" 
                title="Real-Time Processing" 
                description="Instant results with millisecond response times"
              />
              <FeatureItem 
                icon="🧠" 
                title="Intelligent Agents" 
                description="AI that learns and evolves with your business"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <CodeVisualizerComponent isInView={isInView} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
      <div className="text-2xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-slate-200 mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function CodeVisualizerComponent({ isInView }: { isInView: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  
  // Array of different AI services to showcase
  const services = useMemo(() => [
    {
      title: "Data Pipeline Creation",
      code: [
        { content: 'const pipeline = DataPipeline.create({', className: '' },
        { content: 'sources: [\'csv\', \'api\', \'database\'],', className: 'pl-4' },
        { content: 'transform: AI.clean().normalize(),', className: 'pl-4' },
        { content: 'destination: \'data_warehouse\',', className: 'pl-4' },
        { content: 'schedule: \'real-time\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "Model Training Workflow",
      code: [
        { content: 'const model = ModelTrainer.build({', className: '' },
        { content: 'algorithm: \'transformer\',', className: 'pl-4' },
        { content: 'dataset: preprocessed_data,', className: 'pl-4' },
        { content: 'hyperparameters: auto_tune(),', className: 'pl-4' },
        { content: 'validation: cross_validate(k=5),', className: 'pl-4' },
        { content: 'metrics: [\'accuracy\', \'f1\', \'precision\']', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "AI Agent Deployment",
      code: [
        { content: 'const agent = AgentFramework.deploy({', className: '' },
        { content: 'model: trained_llm,', className: 'pl-4' },
        { content: 'tools: [\'web_search\', \'calculator\', \'db_query\'],', className: 'pl-4' },
        { content: 'memory: \'persistent\',', className: 'pl-4' },
        { content: 'scaling: \'auto\',', className: 'pl-4' },
        { content: 'monitoring: \'continuous\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "Data Visualization Studio",
      code: [
        { content: 'const dashboard = VizStudio.create({', className: '' },
        { content: 'data: live_stream,', className: 'pl-4' },
        { content: 'charts: [\'time_series\', \'heatmap\', \'3d_scatter\'],', className: 'pl-4' },
        { content: 'interactions: \'drill_down\',', className: 'pl-4' },
        { content: 'updates: \'real_time\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    }
  ], []);
  
  const currentService = useMemo(() => services[serviceIndex], [services, serviceIndex]);
  const codeLines = useMemo(() => currentService.code, [currentService]);
  
  // Format the current line with syntax highlighting - safe JSX version
  const formatCodeLine = (line: { content: string, className: string }) => {
    const parts: React.ReactNode[] = [];
    let remaining = line.content;
    let key = 0;

    // Process const keywords
    remaining = remaining.replace(/const\s+(\w+)/g, (match, p1) => {
      parts.push(
        <span key={key++} className="text-cyan-400">const</span>,
        ' ',
        <span key={key++} className="text-green-400">{p1}</span>
      );
      return `__CONST_${key-2}__`;
    });

    // Process AI method calls
    remaining = remaining.replace(/AI\.(\w+)/g, (match, p1) => {
      parts.push(
        <span key={key++} className="text-purple-400">AI</span>,
        '.',
        <span key={key++} className="text-yellow-400">{p1}</span>
      );
      return `__AI_${key-2}__`;
    });

    // Process object properties
    remaining = remaining.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (match, p1) => {
      parts.push(<span key={key++} className="text-pink-400">{p1}</span>, ':');
      return `__PROP_${key-1}__`;
    });

    // Process strings
    remaining = remaining.replace(/'([^']*)'/g, (match, p1) => {
      parts.push(<span key={key++} className="text-orange-400">&apos;{p1}&apos;</span>);
      return `__STRING_${key-1}__`;
    });

    // Reconstruct the line with safe JSX
    const finalParts = [];
    const currentIndex = 0;
    
    for (let i = 0; i < remaining.length; i++) {
      if (remaining.substr(i).startsWith('__')) {
        const endIndex = remaining.indexOf('__', i + 2) + 2;
        const placeholder = remaining.substring(i, endIndex);
        const partIndex = parseInt(placeholder.match(/\d+/)?.[0] || '0');
        if (parts[partIndex]) {
          finalParts.push(...(Array.isArray(parts[partIndex]) ? parts[partIndex] : [parts[partIndex]]));
        }
        i = endIndex - 1;
      } else {
        finalParts.push(remaining[i]);
      }
    }

    return <span>{finalParts.length ? finalParts : remaining}</span>;
  };
  
  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);
  
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    
    if (isVisible) {
      typingInterval = setInterval(() => {
        if (currentChar >= codeLines[currentLine].content.length) {
          if (currentLine < codeLines.length - 1) {
            setCurrentLine(prev => prev + 1);
            setCurrentChar(0);
          } else {
            setTimeout(() => {
              setServiceIndex((prev) => (prev + 1) % services.length);
              setCurrentLine(0);
              setCurrentChar(0);
            }, 3000);
            clearInterval(typingInterval);
          }
        } else {
          setCurrentChar(prev => prev + 1);
        }
      }, 50);
    }
    
    return () => {
      clearInterval(typingInterval);
    };
  }, [isVisible, currentLine, currentChar, codeLines.length, codeLines, services.length]);
  
  return (
    <div className="relative transform transition-all duration-1000"
         style={{ 
           opacity: isVisible ? 1 : 0,
           transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
           transitionDelay: '0.5s'
         }}>
      {/* Enhanced AI Dashboard */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/50 shadow-2xl backdrop-blur-sm relative overflow-hidden neural-glow max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-medium text-slate-500">AI Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-800/70 backdrop-blur-sm border border-slate-600/30">
              {currentService.title}
            </div>
          </div>
        </div>
        
        {/* Professional Code Display */}
        <div className="font-mono text-sm space-y-2 overflow-hidden relative z-10 min-h-[200px] bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
          {codeLines.map((line, idx) => (
            <div key={idx} className={`${line.className}`}>
              {idx < currentLine ? (
                <p className="opacity-90">{formatCodeLine(line)}</p>
              ) : idx === currentLine ? (
                <p>
                  {formatCodeLine({ content: line.content.substring(0, currentChar), className: line.className })}
                  <span className="animate-pulse">|</span>
                </p>
              ) : (
                <p className="opacity-0">{formatCodeLine(line)}</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Moving particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
      
      {/* Professional Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-400/15 to-orange-500/10 blur-2xl rounded-2xl -z-10"></div>
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/5 via-purple-500/5 to-orange-500/5 blur-3xl rounded-3xl -z-20"></div>
    </div>
  );
}