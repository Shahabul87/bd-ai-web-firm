"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-20">
      {/* Enhanced Background Effects - Static */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-cyan-400 rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <HeroContent isInView={isInView} />
          <CodeVisualizer />
        </div>
      </div>
    </section>
  );
}

function HeroContent({ isInView }: { isInView: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
        <div className="overflow-hidden">
          <span className="block transform transition-all duration-700 ease-out" 
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
                  transitionDelay: '0.2s'
                }}>
            <span className="relative inline-block">
              AI-
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-purple-500 transform scale-x-0 origin-left transition-transform duration-500 ease-out" 
                    style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: '0.7s' }}></span>
            </span>
            <span className="relative inline-block ml-2">
              Powered
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-blue-500 transform scale-x-0 origin-left transition-transform duration-500 ease-out" 
                    style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: '0.9s' }}></span>
            </span>
          </span>
        </div>
        
        <div className="overflow-hidden mt-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 block transform transition-all duration-700 ease-out"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
                  transitionDelay: '0.4s',
                  backgroundSize: isVisible ? '200% 100%' : '100% 100%',
                  animation: isVisible ? 'bg-shift 3s ease-in-out infinite alternate' : 'none'
                }}>
            Web Development
          </span>
        </div>
        
        <div className="overflow-hidden mt-2">
          <span className="transform transition-all duration-700 ease-out flex items-center"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
                  transitionDelay: '0.6s'
                }}>
            For The 
            <span className="relative inline-block ml-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ animation: isVisible ? 'pulse 2s ease-in-out infinite' : 'none' }}>
              Future
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-70"
                   style={{ animation: isVisible ? 'float 3s ease-in-out infinite' : 'none' }}></div>
            </span>
          </span>
        </div>
      </h1>
      
      <p className="text-lg text-gray-300 max-w-lg transform transition-all duration-700"
         style={{ 
           opacity: isVisible ? 1 : 0,
           transform: isVisible ? 'translateY(0)' : 'translateY(1rem)',
           transitionDelay: '0.8s'
         }}>
        We combine cutting-edge AI technology with expert web development to create stunning, intelligent websites in a fraction of the time.
      </p>
      
      <div className="transform transition-all duration-700"
           style={{ 
             opacity: isVisible ? 1 : 0,
             transform: isVisible ? 'translateY(0)' : 'translateY(1rem)',
             transitionDelay: '1s'
           }}>
        <CTAButtons />
      </div>
      
      <div className="transform transition-all duration-700"
           style={{ 
             opacity: isVisible ? 1 : 0,
             transform: isVisible ? 'translateY(0)' : 'translateY(1rem)',
             transitionDelay: '1.2s'
           }}>
        <ClientShowcase />
      </div>
    </div>
  );
}

function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
        Get Started
      </button>
      <button className="px-8 py-3 rounded-full border border-gray-600 text-white font-medium hover:bg-white/5 transition-colors">
        View Portfolio
      </button>
    </div>
  );
}

function ClientShowcase() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-gradient-to-r ${
            i === 1 ? 'from-purple-600 to-blue-500' : 
            i === 2 ? 'from-blue-500 to-cyan-400' : 
            i === 3 ? 'from-cyan-400 to-teal-300' :
            'from-teal-300 to-green-400'
          }`}>
            <span className="text-xs font-bold">AI</span>
          </div>
        ))}
      </div>
      <p className="text-gray-300">
        <span className="font-semibold">100+</span> websites launched
      </p>
    </div>
  );
}

function CodeVisualizer() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  
  // Array of different AI services to showcase
  const services = useMemo(() => [
    {
      title: "AI Web Development",
      code: [
        { content: 'const website = AI.create({', className: '' },
        { content: 'design: \'modern\',', className: 'pl-4' },
        { content: 'features: [\'responsive\', \'fast\', \'seo-optimized\'],', className: 'pl-4' },
        { content: 'timeline: Days.not(\'months\')', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "AI Branding",
      code: [
        { content: 'const brand = AI.design({', className: '' },
        { content: 'identity: {', className: 'pl-4' },
        { content: 'logo: \'dynamic\',', className: 'pl-8' },
        { content: 'colors: generatePalette(\'modern\'),', className: 'pl-8' },
        { content: 'voice: \'authentic\'', className: 'pl-8' },
        { content: '}', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "Data Visualization",
      code: [
        { content: 'const insights = AI.analyze({', className: '' },
        { content: 'data: customerData,', className: 'pl-4' },
        { content: 'visualize: [\'trends\', \'patterns\', \'forecasts\'],', className: 'pl-4' },
        { content: 'format: \'interactive-dashboard\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "Customer Analysis",
      code: [
        { content: 'const segments = AI.segment({', className: '' },
        { content: 'customers,', className: 'pl-4' },
        { content: 'by: [\'behavior\', \'demographics\', \'spending\'],', className: 'pl-4' },
        { content: 'predict: \'future_value\',', className: 'pl-4' },
        { content: 'recommend: \'personalized_offers\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "AI Agent Deployment",
      code: [
        { content: 'const agent = AI.deploy({', className: '' },
        { content: 'type: \'customer_service\',', className: 'pl-4' },
        { content: 'capabilities: [\'24/7\', \'multilingual\', \'learning\'],', className: 'pl-4' },
        { content: 'integration: \'seamless\',', className: 'pl-4' },
        { content: 'personality: \'friendly_professional\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    },
    {
      title: "Marketing Automation",
      code: [
        { content: 'const campaign = AI.market({', className: '' },
        { content: 'channels: [\'email\', \'social\', \'search\'],', className: 'pl-4' },
        { content: 'content: AI.generate(\'personalized\'),', className: 'pl-4' },
        { content: 'targeting: \'smart_segments\',', className: 'pl-4' },
        { content: 'optimization: \'continuous\'', className: 'pl-4' },
        { content: '});', className: '' }
      ]
    }
  ], []);
  
  const currentService = useMemo(() => services[serviceIndex], [services, serviceIndex]);
  const codeLines = useMemo(() => currentService.code, [currentService]);
  
  // Format the current line with syntax highlighting
  const formatCodeLine = (line: { content: string, className: string }) => {
    // Generic syntax highlighting based on patterns
    const line1 = line.content
      .replace(/const\s+(\w+)/g, '<span class="text-cyan-400">const</span> <span class="text-green-400">$1</span>')
      .replace(/AI\.(\w+)/g, '<span class="text-purple-400">AI</span>.<span class="text-yellow-400">$1</span>')
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '<span class="text-pink-400">$1</span>:')
      .replace(/'([^']*)'/g, '<span class="text-orange-400">\'$1\'</span>')
      .replace(/\{|\}/g, (match) => match);
      
    // Just return the JSX directly since our replacement handles the syntax highlighting
    return <span dangerouslySetInnerHTML={{ __html: line1 }} />;
  };
  
  useEffect(() => {
    setIsVisible(true);
    
    // Typewriter effect
    let typingInterval: NodeJS.Timeout;
    
    if (isVisible) {
      typingInterval = setInterval(() => {
        // If we've completed typing the current line
        if (currentChar >= codeLines[currentLine].content.length) {
          // Move to the next line if there is one
          if (currentLine < codeLines.length - 1) {
            setCurrentLine(prev => prev + 1);
            setCurrentChar(0);
          } else {
            // Move to next service after a pause or loop back to first
            setTimeout(() => {
              setServiceIndex((prev) => (prev + 1) % services.length);
              setCurrentLine(0);
              setCurrentChar(0);
            }, 3000); // Pause for 3 seconds before switching
            clearInterval(typingInterval);
          }
        } else {
          // Continue typing the current line
          setCurrentChar(prev => prev + 1);
        }
      }, 50); // Speed of typing
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
      {/* Animated Code Block */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-xl max-w-md mx-auto backdrop-blur-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs font-mono text-gray-400 px-2 py-1 rounded bg-gray-800 bg-opacity-50">
            {currentService.title}
          </div>
        </div>
        
        {/* Code with typewriter effect */}
        <div className="font-mono text-sm space-y-2 overflow-hidden relative z-10 min-h-[180px]">
          {codeLines.map((line, idx) => (
            <div key={idx} className={`${line.className}`}>
              {idx < currentLine ? (
                // Fully typed lines
                <p className="opacity-90">{formatCodeLine(line)}</p>
              ) : idx === currentLine ? (
                // Currently typing line
                <p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: line.content
                      .substring(0, currentChar)
                      .replace(/const\s+(\w+)/g, '<span class="text-cyan-400">const</span> <span class="text-green-400">$1</span>')
                      .replace(/AI\.(\w+)/g, '<span class="text-purple-400">AI</span>.<span class="text-yellow-400">$1</span>')
                      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '<span class="text-pink-400">$1</span>:')
                      .replace(/'([^']*)'/g, '<span class="text-orange-400">\'$1\'</span>')
                  }} />
                  <span className="animate-pulse">|</span>
                </p>
              ) : (
                // Lines not yet typed
                <p className="opacity-0">{formatCodeLine(line)}</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Moving particle effects in the background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Subtle Glow Effect - Not flashing */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-cyan-400/20 blur-xl rounded-full -z-10"></div>
    </div>
  );
} 