"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import Link from 'next/link';

export default function HeroSectionOptimized() {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.1 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden min-h-screen flex items-center ${
        mounted ? 'animate-fadeIn' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 25%, #0a0f1a 50%, #0d0d14 75%, #0a0a0f 100%)'
      }}
    >
      {/* Animated Code Rain Background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-emerald-400 font-mono text-xs whitespace-nowrap animate-code-fall"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${15 + i % 5}s`
                }}
              >
                {['const', 'async', 'await', 'function', 'return', 'export', 'import', '{ }', '( )', '=>'][i % 10]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #10b981 1px, transparent 1px),
            linear-gradient(#10b981 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 relative z-10 w-full py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-20 items-center">
          <AgentHeroContent isInView={isInView} />
          <LiveCodeSynthesis isInView={isInView} mounted={mounted} />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </section>
  );
}

// Hero Content with Agentic AI Focus - CSS Animations Only
function AgentHeroContent({ isInView }: { isInView: boolean }) {
  const services = [
    { icon: '🌐', label: 'Web Development' },
    { icon: '📱', label: 'Android Apps' },
    { icon: '📊', label: 'Data Analysis' },
    { icon: '📈', label: 'Visualization' }
  ];

  return (
    <div className={`space-y-8 ${isInView ? 'animate-fadeInLeft' : 'opacity-0'}`}>
      {/* Agent Status Badge */}
      <div
        className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm animate-scaleIn"
        style={{ animationDelay: '200ms' }}
      >
        <div className="relative">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full" />
          <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-emerald-300 tracking-wide">
          AI Agents Active
        </span>
        <span className="text-[10px] sm:text-xs text-emerald-400/60 font-mono">v2.4.1</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="block text-white/90 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            Agentic AI
          </span>
          <span
            className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 animate-fadeInUp"
            style={{ animationDelay: '600ms' }}
          >
            Coding Studio
          </span>
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed animate-fadeInUp"
          style={{ animationDelay: '800ms' }}
        >
          Our autonomous AI agents write production-ready code for your business.
          <span className="text-emerald-400"> Web apps, Android apps, data solutions</span> -
          delivered 10x faster at a fraction of the cost.
        </p>
      </div>

      {/* Service Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {services.map((service, i) => (
          <div
            key={service.label}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-800/40 border border-slate-700/50 text-xs sm:text-sm text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 cursor-default animate-fadeIn"
            style={{ animationDelay: `${1000 + i * 100}ms` }}
          >
            <span className="text-sm sm:text-base">{service.icon}</span>
            <span>{service.label}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div
        className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4 animate-fadeInUp"
        style={{ animationDelay: '1200ms' }}
      >
        <Link
          href="/quote"
          className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold text-sm sm:text-base overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 w-full sm:w-auto text-center sm:text-left"
        >
          <span className="relative z-10 flex items-center justify-center sm:justify-start gap-2">
            Start Your Project
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        <Link
          href="/portfolio"
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-slate-600/50 text-slate-300 font-medium text-sm sm:text-base hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300 w-full sm:w-auto text-center"
        >
          View Our Work
        </Link>
      </div>

      {/* Trust Indicators */}
      <div
        className="flex flex-wrap items-center gap-6 pt-6 text-sm text-slate-500 animate-fadeIn"
        style={{ animationDelay: '1400ms' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span>50+ Projects Delivered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          <span>24/7 AI Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          <span>Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}

// Live Code Synthesis Visualization - CSS Animations Only
function LiveCodeSynthesis({ isInView, mounted }: { isInView: boolean; mounted: boolean }) {
  const [activeAgent, setActiveAgent] = useState(0);
  const [codeLines, setCodeLines] = useState(0);

  const agents = [
    { name: 'WebDev Agent', task: 'Building React components', color: 'emerald' },
    { name: 'Android Agent', task: 'Generating Kotlin code', color: 'cyan' },
    { name: 'Data Agent', task: 'Processing analytics', color: 'violet' },
    { name: 'Viz Agent', task: 'Creating dashboards', color: 'amber' }
  ];

  const codeSnippets = [
    { text: 'export function App() {', color: 'text-violet-400' },
    { text: '  const [data, setData] = useState([]);', color: 'text-cyan-400' },
    { text: '  useEffect(() => {', color: 'text-emerald-400' },
    { text: '    fetchUserData().then(setData);', color: 'text-slate-300' },
    { text: '  }, []);', color: 'text-emerald-400' },
    { text: '  return <Dashboard data={data} />;', color: 'text-amber-400' },
    { text: '}', color: 'text-violet-400' },
  ];

  useEffect(() => {
    if (!isInView || !mounted) return;

    const agentInterval = setInterval(() => {
      setActiveAgent(prev => (prev + 1) % agents.length);
    }, 4000);

    const codeInterval = setInterval(() => {
      setCodeLines(prev => (prev + 1) % (codeSnippets.length + 1));
    }, 800);

    return () => {
      clearInterval(agentInterval);
      clearInterval(codeInterval);
    };
  }, [isInView, mounted, agents.length, codeSnippets.length]);

  return (
    <div className={`relative mt-8 lg:mt-0 ${isInView ? 'animate-fadeInRight' : 'opacity-0'}`}>
      {/* Main Code Editor Panel */}
      <div
        className="relative bg-[#0d1117] rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/50 animate-scaleIn"
        style={{ animationDelay: '400ms' }}
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs font-mono text-slate-500">ai-generated-app.tsx</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-xs text-emerald-400 font-medium">SYNTHESIZING</span>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-3 sm:p-4 md:p-5 font-mono text-xs sm:text-sm min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
          <div className="space-y-1 sm:space-y-1.5">
            {codeSnippets.map((line, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 sm:gap-3 transition-opacity duration-300 ${
                  i < codeLines ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <span className="text-slate-600 w-4 sm:w-5 text-right text-[10px] sm:text-xs">{i + 1}</span>
                <span className={`${line.color} break-words`}>{line.text}</span>
                {i === codeLines - 1 && mounted && (
                  <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 bg-emerald-400 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agent Status Bar */}
        <div className="px-4 py-3 bg-[#161b22] border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Agent:</span>
              <span className="text-xs text-emerald-400 font-medium">{agents[activeAgent].name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Lines: {codeLines * 47}</span>
              <span>Quality: 98.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Activity Cards */}
      <div
        className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-4 w-56 sm:w-64 animate-fadeInUp hidden sm:block"
        style={{ animationDelay: '800ms' }}
      >
        <div className="bg-[#0d1117]/95 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 shadow-xl">
          <div className="text-[10px] sm:text-xs font-medium text-slate-400 mb-2 sm:mb-3">Active Agents</div>
          <div className="space-y-1.5 sm:space-y-2">
            {agents.map((agent, i) => (
              <div
                key={agent.name}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:py-1.5 rounded-lg transition-all duration-300 ${
                  i === activeAgent ? 'bg-emerald-500/10 border border-emerald-500/30' : 'opacity-50'
                }`}
              >
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                  i === activeAgent ? 'bg-emerald-400' : 'bg-slate-600'
                }`} />
                <span className={`text-[10px] sm:text-xs ${i === activeAgent ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Metrics */}
      <div
        className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 flex gap-2 sm:gap-3 animate-fadeIn"
        style={{ animationDelay: '1000ms' }}
      >
        <div className="bg-[#0d1117]/95 backdrop-blur-sm rounded-lg border border-emerald-500/30 px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="text-base sm:text-lg font-bold text-emerald-400">10x</div>
          <div className="text-[9px] sm:text-[10px] text-slate-500">Faster</div>
        </div>
        <div className="bg-[#0d1117]/95 backdrop-blur-sm rounded-lg border border-cyan-500/30 px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="text-base sm:text-lg font-bold text-cyan-400">80%</div>
          <div className="text-[9px] sm:text-[10px] text-slate-500">Cost Saved</div>
        </div>
      </div>
    </div>
  );
}
