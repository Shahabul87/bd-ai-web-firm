'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ServicesPage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'web',
      name: 'WebForge',
      title: 'Web Development Agent',
      subtitle: 'Full-Stack Applications',
      icon: '🌐',
      status: 'ONLINE',
      gradient: 'from-indigo-500 to-cyan-500',
      description: 'Autonomous AI agent specialized in building modern web applications. From React frontends to Node.js backends, this agent handles the entire stack.',
      capabilities: [
        'React & Next.js Applications',
        'RESTful & GraphQL APIs',
        'Database Architecture',
        'Cloud Deployment (AWS/GCP/Vercel)',
        'Authentication & Security',
        'Performance Optimization'
      ],
      metrics: {
        speed: '10x faster',
        accuracy: '99.2%',
        uptime: '99.9%'
      },
      techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind'],
      deliveryTime: '2-6 weeks',
      projects: '150+'
    },
    {
      id: 'android',
      name: 'DroidMaster',
      title: 'Android Development Agent',
      subtitle: 'Native Mobile Apps',
      icon: '📱',
      status: 'ONLINE',
      gradient: 'from-cyan-500 to-violet-500',
      description: 'Expert Android development agent using Kotlin and Jetpack Compose. Creates beautiful, performant native apps ready for the Play Store.',
      capabilities: [
        'Native Kotlin Development',
        'Jetpack Compose UI',
        'Material Design 3',
        'Firebase Integration',
        'Play Store Optimization',
        'Push Notifications'
      ],
      metrics: {
        speed: '8x faster',
        accuracy: '98.7%',
        uptime: '99.9%'
      },
      techStack: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Room DB', 'Retrofit', 'Hilt'],
      deliveryTime: '4-8 weeks',
      projects: '80+'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header />

      <main className="pt-16 sm:pt-18 md:pt-20">
        <HeroSection />
        <AgentGridSection agents={agents} activeAgent={activeAgent} setActiveAgent={setActiveAgent} />
        {activeAgent && (
          <AgentDetailSection
            agent={agents.find(a => a.id === activeAgent)!}
            onClose={() => setActiveAgent(null)}
          />
        )}
        <ComparisonSection />
        <ProcessSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full blur-[150px] opacity-20" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full blur-[150px] opacity-15" style={{ background: 'var(--brand-accent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Status Badge */}
          <motion.div
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border backdrop-blur-sm mb-6 sm:mb-8"
            style={{ borderColor: 'var(--brand-primary)', background: 'var(--brand-primary)' + '08' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>2 AI Agents Online</span>
            <div className="h-3 sm:h-4 w-px hidden sm:block" style={{ background: 'var(--border-default)' }} />
            <span className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>System Status: OPTIMAL</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 leading-[1.1] px-2">
            <span style={{ color: 'var(--foreground)' }}>AI Agent</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Deployment Center
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2" style={{ color: 'var(--text-secondary)' }}>
            Two specialized AI agents ready to be deployed on your project.
            Each agent is trained for specific tasks and works autonomously to deliver
            <span style={{ color: 'var(--brand-primary)' }}> production-ready code</span>.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12 px-2">
            {[
              { value: '230+', label: 'Projects Completed' },
              { value: '10x', label: 'Faster Than Traditional' },
              { value: '99.9%', label: 'Uptime Guaranteed' },
              { value: '24/7', label: 'Agent Availability' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Terminal Preview */}
          <motion.div
            className="max-w-2xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="rounded-lg sm:rounded-xl border overflow-hidden shadow-lg" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)' }}>
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[10px] sm:text-xs font-mono ml-1 sm:ml-2 truncate" style={{ color: 'var(--text-secondary)' }}>craftsai-agent-control</span>
              </div>
              <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <div style={{ color: 'var(--text-secondary)' }} className="whitespace-nowrap">$ craftsai deploy --list-agents</div>
                <div className="mt-2 space-y-0.5 sm:space-y-1">
                  <div className="text-indigo-500 whitespace-nowrap">  [ONLINE] WebForge     - Web Development</div>
                  <div className="text-cyan-500 whitespace-nowrap">  [ONLINE] DroidMaster  - Android Development</div>
                </div>
                <div className="mt-2 sm:mt-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>$ craftsai deploy WebForge --project &quot;your-next-app&quot;</div>
                <div className="text-emerald-500 flex items-center gap-1.5 sm:gap-2 mt-1">
                  <span className="animate-pulse">_</span>
                  <span className="text-xs sm:text-sm">Initializing agent deployment...</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

interface Agent {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  status: string;
  gradient: string;
  description: string;
  capabilities: string[];
  metrics: { speed: string; accuracy: string; uptime: string };
  techStack: string[];
  deliveryTime: string;
  projects: string;
}

interface AgentGridProps {
  agents: Agent[];
  activeAgent: string | null;
  setActiveAgent: (id: string | null) => void;
}

function AgentGridSection({ agents, activeAgent, setActiveAgent }: AgentGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2" style={{ color: 'var(--foreground)' }}>
            Select Your Agent
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
            Click on an agent to see detailed capabilities, tech stack, and deployment options
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <AgentCard
                agent={agent}
                isActive={activeAgent === agent.id}
                onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCard({ agent, isActive, onClick }: { agent: Agent; isActive: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-500 ${
        isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${isActive ? 'opacity-15' : ''}`} />

      <div
        className={`relative rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${isActive ? 'shadow-lg' : ''}`}
        style={{ background: 'var(--card-bg)', borderColor: isActive ? 'var(--brand-primary)' : 'var(--card-border)' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b" style={{ borderColor: 'var(--card-border)', background: 'var(--surface-elevated)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0`}>
                {agent.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'var(--foreground)' }}>{agent.name}</h3>
                  <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500">{agent.status}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{agent.title}</p>
              </div>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-lg transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-180' : ''}`} style={{ background: 'var(--surface-elevated)' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 md:p-6">
          <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6" style={{ color: 'var(--text-secondary)' }}>
            {agent.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.metrics.speed}
              </div>
              <div className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>Speed</div>
            </div>
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.metrics.accuracy}
              </div>
              <div className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
            </div>
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.projects}
              </div>
              <div className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>Projects</div>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            {agent.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full border" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}>
                {tech}
              </span>
            ))}
            {agent.techStack.length > 4 && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                +{agent.techStack.length - 4} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Delivery: </span>
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>{agent.deliveryTime}</span>
            </div>
            <Link
              href="/quote"
              onClick={(e) => e.stopPropagation()}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r ${agent.gradient} text-white text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-center`}
            >
              Deploy Agent
            </Link>
          </div>
        </div>

        {/* Expanded Capabilities */}
        <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4 sm:p-5 md:p-6 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <h4 className="text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>Full Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agent.capabilities.map((cap) => (
                <div key={cap} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r ${agent.gradient} flex-shrink-0`} />
                  <span className="break-words">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentDetailSection({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <section className="py-8 sm:py-10 md:py-12 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl sm:rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {/* Agent Header with Visual */}
          <div className={`relative p-4 sm:p-6 md:p-8 bg-gradient-to-br ${agent.gradient} bg-opacity-10`}>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg transition-colors" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pr-8 sm:pr-0">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-2xl flex-shrink-0`}>
                {agent.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{agent.name}</h2>
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-500">{agent.status}</span>
                  </div>
                </div>
                <p className="text-lg sm:text-xl" style={{ color: 'var(--text-secondary)' }}>{agent.title}</p>
                <p className="text-sm sm:text-base mt-1 sm:mt-2" style={{ color: 'var(--text-secondary)' }}>{agent.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Agent Details */}
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8">
            {/* Left: Description & Capabilities */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>About This Agent</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{agent.description}</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Capabilities</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {agent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${agent.gradient} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm break-words" style={{ color: 'var(--text-secondary)' }}>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Tech Stack & Metrics */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Technology Stack</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {agent.techStack.map((tech) => (
                    <span key={tech} className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg border text-xs sm:text-sm" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl text-center" style={{ background: 'var(--surface-elevated)' }}>
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.speed}
                    </div>
                    <div className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Speed Boost</div>
                  </div>
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl text-center" style={{ background: 'var(--surface-elevated)' }}>
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.accuracy}
                    </div>
                    <div className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
                  </div>
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl text-center" style={{ background: 'var(--surface-elevated)' }}>
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.uptime}
                    </div>
                    <div className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Uptime</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ background: 'var(--surface-elevated)' }}>
                <div>
                  <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Typical Delivery Time</div>
                  <div className="text-lg sm:text-xl font-bold" style={{ color: 'var(--foreground)' }}>{agent.deliveryTime}</div>
                </div>
                <Link
                  href="/quote"
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${agent.gradient} text-white text-sm sm:text-base font-semibold hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-center`}
                >
                  Deploy {agent.name}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const comparisons = [
    { feature: 'Development Speed', traditional: '8-12 weeks', ai: '2-4 weeks', improvement: '4x faster' },
    { feature: 'Cost Efficiency', traditional: '$50-100K', ai: '$10-25K', improvement: '80% savings' },
    { feature: 'Availability', traditional: 'Business hours', ai: '24/7/365', improvement: 'Always on' },
    { feature: 'Iteration Speed', traditional: '1-2 weeks', ai: '24-48 hours', improvement: '7x faster' },
    { feature: 'Code Consistency', traditional: 'Varies', ai: '99.9%', improvement: 'Standardized' },
    { feature: 'Documentation', traditional: 'Often lacking', ai: 'Auto-generated', improvement: 'Complete' },
  ];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2" style={{ color: 'var(--foreground)' }}>
            Traditional Agency vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">AI Agents</span>
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
            See how our AI agents outperform traditional development approaches
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl sm:rounded-2xl border overflow-hidden overflow-x-auto"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 border-b min-w-[600px]" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)' }}>
            <div className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Feature</div>
            <div className="text-xs sm:text-sm font-medium text-center" style={{ color: 'var(--text-secondary)' }}>Traditional</div>
            <div className="text-xs sm:text-sm font-medium text-center text-indigo-500">AI Agents</div>
            <div className="text-xs sm:text-sm font-medium text-center text-cyan-500">Improvement</div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={row.feature}
              className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 border-b transition-colors min-w-[600px]"
              style={{ borderColor: 'var(--card-border)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <div className="text-xs sm:text-sm md:text-base font-medium" style={{ color: 'var(--foreground)' }}>{row.feature}</div>
              <div className="text-xs sm:text-sm md:text-base text-center" style={{ color: 'var(--text-secondary)' }}>{row.traditional}</div>
              <div className="text-xs sm:text-sm md:text-base text-indigo-500 text-center font-medium">{row.ai}</div>
              <div className="text-center">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] sm:text-xs md:text-sm font-medium">
                  {row.improvement}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const steps = [
    {
      number: '01',
      title: 'Select Your Agent',
      description: 'Choose from our specialized AI agents based on your project needs',
      icon: '🎯',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      number: '02',
      title: 'Brief the Agent',
      description: 'Provide project requirements through our intuitive quote system',
      icon: '📋',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      number: '03',
      title: 'Agent Deploys',
      description: 'Your AI agent autonomously starts building your solution',
      icon: '🚀',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      number: '04',
      title: 'Review & Launch',
      description: 'Review the deliverables and deploy to production',
      icon: '✨',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-20 lg:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2" style={{ color: 'var(--foreground)' }}>
            How It Works
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
            From concept to deployment in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5" style={{ background: 'linear-gradient(to right, var(--border-default), transparent)' }} />
              )}

              <div className="relative rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 transition-colors group hover:shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                {/* Step Number */}
                <div className={`absolute -top-2.5 sm:-top-3 -left-2.5 sm:-left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 mt-3 sm:mt-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2" style={{ color: 'var(--foreground)' }}>{step.title}</h3>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[700px] md:w-[800px] h-[600px] sm:h-[700px] md:h-[800px] rounded-full blur-[200px] opacity-10" style={{ background: 'var(--brand-primary)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 px-2">
            <span style={{ color: 'var(--foreground)' }}>Ready to Deploy </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Your Agent?
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-9 md:mb-10 max-w-2xl mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
            Get a free quote and see how our AI agents can transform your next project.
            No commitment, no pressure.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link
              href="/quote"
              className="group px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                Get Free Quote
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/portfolio"
              className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl border font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-md"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              View Portfolio
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm px-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
              <span>Free consultation</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
              <span>24-hour response</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-secondary)' }} />
              <span>No obligation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
