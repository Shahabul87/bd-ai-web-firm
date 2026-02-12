'use client';

import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const codeExamples = [
  {
    title: 'AI-Powered React Component',
    language: 'typescript',
    code: `// AI generates optimized React components
const Dashboard = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    revenue: 0,
    users: 0,
    performance: 0
  });

  // AI-optimized data fetching with caching
  const { data, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    staleTime: 5 * 60 * 1000, // AI-suggested cache time
    refetchOnWindowFocus: false // AI optimization
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* AI generates responsive layout */}
      <MetricCard 
        title="Revenue" 
        value={data?.revenue} 
        trend={calculateTrend(data)}
      />
    </div>
  );
};`
  },
  {
    title: 'Automated API Integration',
    language: 'python',
    code: `# AI builds complete API with error handling
from fastapi import FastAPI, HTTPException
from typing import List, Optional
import asyncio

app = FastAPI()

class AIOptimizedAPI:
    def __init__(self):
        self.cache = {}
        self.rate_limiter = RateLimiter(100, 60)
    
    @app.get("/api/v1/predictions")
    async def get_predictions(
        self, 
        model_id: str,
        input_data: dict
    ) -> PredictionResult:
        # AI implements caching strategy
        cache_key = f"{model_id}:{hash(str(input_data))}"
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # AI handles async processing
        result = await self.process_with_ml_model(
            model_id, 
            input_data
        )
        
        self.cache[cache_key] = result
        return result`
  },
  {
    title: 'Smart Data Pipeline',
    language: 'javascript',
    code: `// AI creates efficient data processing pipeline
class DataPipeline {
  constructor() {
    this.processors = [];
    this.errorHandlers = new Map();
  }

  // AI suggests optimal batch size
  async process(data, options = {}) {
    const batchSize = options.batchSize || 1000;
    const results = [];
    
    // AI implements parallel processing
    const batches = chunk(data, batchSize);
    const promises = batches.map(batch => 
      this.processBatch(batch)
    );
    
    // AI adds smart error recovery
    try {
      const batchResults = await Promise.allSettled(promises);
      return this.consolidateResults(batchResults);
    } catch (error) {
      return this.handleError(error, data);
    }
  }
}`
  }
];

export default function CodeShowcaseOptimized() {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [activeTab, setActiveTab] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedCode, setDisplayedCode] = useState('');
  
  useEffect(() => {
    if (!isInView) return;
    
    // Simulate AI typing effect
    setIsTyping(true);
    const code = codeExamples[activeTab].code;
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex < code.length) {
        setDisplayedCode(code.slice(0, currentIndex + 10)); // Type 10 chars at a time
        currentIndex += 10;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 20);
    
    return () => clearInterval(typeInterval);
  }, [activeTab, isInView]);
  
  return (
    <section ref={ref as any} className="py-12 sm:py-16 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(to bottom, var(--surface-sunken), var(--background))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-8 sm:mb-10 md:mb-12 ${isInView ? 'animate-fadeInDown' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 mb-4 sm:mb-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-cyan-400">Live AI Coding</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-3 sm:mb-4 px-2">
            Watch AI Build Your Code
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto px-2">
            Our AI agents write production-ready code in seconds, not hours. 
            Clean, optimized, and fully tested.
          </p>
        </div>
        
        {/* Code Editor UI */}
        <div className={`bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-700 overflow-hidden ${
          isInView ? 'animate-scaleIn delay-200' : 'opacity-0'
        }`}>
          {/* Editor Header */}
          <div className="bg-slate-900 border-b border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 sm:py-3 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Window Controls */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto flex-1 sm:flex-initial">
                  {codeExamples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveTab(index);
                        setDisplayedCode('');
                      }}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap ${
                        activeTab === index
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="hidden sm:inline">{example.title}</span>
                      <span className="sm:hidden">{example.title.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isTyping && (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs text-green-400">AI Writing...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Code Content */}
          <div className="relative">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 md:w-12 bg-slate-900/50 border-r border-slate-800">
              <div className="p-2 sm:p-3 md:p-4 text-slate-600 text-xs sm:text-sm font-mono leading-5 sm:leading-6">
                {displayedCode.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
            
            {/* Code */}
            <div className="pl-10 sm:pl-12 md:pl-16 pr-2 sm:pr-3 md:pr-4 py-3 sm:py-4 min-h-[300px] sm:min-h-[350px] md:min-h-[400px] max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-auto">
              <pre className="text-xs sm:text-sm font-mono leading-5 sm:leading-6">
                <code className="language-typescript">
                  {highlightCode(displayedCode || codeExamples[activeTab].code)}
                </code>
              </pre>
              
              {/* Typing Cursor */}
              {isTyping && <span className="animate-blink text-cyan-400">|</span>}
            </div>
            
            {/* AI Suggestions Panel */}
            <div className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-3 md:top-4 w-48 sm:w-56 md:w-64 bg-slate-800/90 rounded-lg p-2 sm:p-2.5 md:p-3 border border-slate-700 backdrop-blur-sm animate-fadeIn delay-1000 hidden sm:block">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="text-[10px] sm:text-xs font-medium text-purple-400">AI Copilot</span>
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-slate-300">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Optimized for performance</span>
                </div>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Type-safe implementation</span>
                </div>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Error handling included</span>
                </div>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Following best practices</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Editor Footer */}
          <div className="bg-slate-900 border-t border-slate-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{codeExamples[activeTab].language}</span>
                <span>UTF-8</span>
                <span>LF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-slate-400">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-8 sm:mt-10 md:mt-12">
          {[
            { icon: '⚡', title: '10x Faster', desc: 'AI writes code in seconds, not hours' },
            { icon: '🛡️', title: 'Bug-Free', desc: 'Automated testing and validation' },
            { icon: '🎯', title: 'Best Practices', desc: 'Always follows industry standards' }
          ].map((feature, index) => (
            <div
              key={index}
              className={`bg-[var(--card-bg)] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-[var(--border-default)] shadow-sm hover-lift backdrop-blur-sm ${
                isInView ? `animate-fadeInUp delay-${400 + index * 100}` : 'opacity-0'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{feature.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-1.5 sm:mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Single-pass syntax highlighter using React elements (no dangerouslySetInnerHTML)
const keywordSet = new Set(['const', 'let', 'var', 'function', 'class', 'async', 'await', 'return', 'import', 'from', 'export', 'default', 'if', 'else', 'try', 'catch', 'def', 'self', 'True', 'False', 'new', 'throw', 'typeof', 'instanceof']);
const typeSet = new Set(['string', 'number', 'boolean', 'void', 'any', 'List', 'Optional', 'dict', 'str', 'int', 'float', 'Metrics', 'PredictionResult', 'RateLimiter', 'FastAPI', 'HTTPException']);

// Tokenize a single line into colored spans
function tokenizeLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < line.length) {
    // Single-line comment: // or #
    if ((line[i] === '/' && line[i + 1] === '/') || (line[i] === '#' && (i === 0 || /\s/.test(line[i - 1])))) {
      tokens.push(<span key={key++} className="text-slate-500">{line.slice(i)}</span>);
      return tokens;
    }

    // String literals: "..." or '...' or `...`
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++; // skip escaped char
        j++;
      }
      j++; // include closing quote
      tokens.push(<span key={key++} className="text-green-400">{line.slice(i, j)}</span>);
      i = j;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push(<span key={key++} className="text-amber-400">{line.slice(i, j)}</span>);
      i = j;
      continue;
    }

    // Words (identifiers, keywords, types)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      if (keywordSet.has(word)) {
        tokens.push(<span key={key++} className="text-purple-400">{word}</span>);
      } else if (typeSet.has(word)) {
        tokens.push(<span key={key++} className="text-cyan-400">{word}</span>);
      } else {
        tokens.push(<span key={key++} className="text-slate-300">{word}</span>);
      }
      i = j;
      continue;
    }

    // Operators and punctuation
    tokens.push(<span key={key++} className="text-slate-400">{line[i]}</span>);
    i++;
  }

  return tokens;
}

function highlightCode(code: string): React.ReactNode {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {tokenizeLine(line)}
          {lineIdx < lines.length - 1 ? '\n' : null}
        </React.Fragment>
      ))}
    </>
  );
}