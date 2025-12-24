'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function ServicesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const agents = [
    {
      id: 'web',
      name: 'WebForge',
      title: 'Web Development Agent',
      subtitle: 'Full-Stack Applications',
      icon: '🌐',
      status: 'ONLINE',
      gradient: 'from-emerald-400 to-cyan-500',
      glowColor: 'emerald',
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
      gradient: 'from-cyan-400 to-violet-500',
      glowColor: 'cyan',
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
    },
    {
      id: 'data',
      name: 'DataMind',
      title: 'Data Analysis Agent',
      subtitle: 'AI-Powered Insights',
      icon: '📊',
      status: 'ONLINE',
      gradient: 'from-violet-400 to-amber-500',
      glowColor: 'violet',
      description: 'Advanced data analysis agent that transforms raw data into actionable business intelligence. Pattern recognition, predictive modeling, and automated reporting.',
      capabilities: [
        'Pattern Recognition',
        'Predictive Analytics',
        'Statistical Modeling',
        'ETL Pipelines',
        'Automated Reporting',
        'Anomaly Detection'
      ],
      metrics: {
        speed: '100x faster',
        accuracy: '99.5%',
        uptime: '99.9%'
      },
      techStack: ['Python', 'Pandas', 'TensorFlow', 'SQL', 'Apache Spark', 'Jupyter'],
      deliveryTime: '1-4 weeks',
      projects: '200+'
    },
    {
      id: 'viz',
      name: 'VizCraft',
      title: 'Data Visualization Agent',
      subtitle: 'Interactive Dashboards',
      icon: '📈',
      status: 'ONLINE',
      gradient: 'from-amber-400 to-emerald-500',
      glowColor: 'amber',
      description: 'Creative visualization agent that builds stunning interactive dashboards and reports. Makes complex data accessible and beautiful.',
      capabilities: [
        'Custom Dashboards',
        'Real-time Charts',
        'Interactive Reports',
        'Data Storytelling',
        'Export & Sharing',
        'Embedded Analytics'
      ],
      metrics: {
        speed: '15x faster',
        accuracy: '99.1%',
        uptime: '99.9%'
      },
      techStack: ['D3.js', 'Chart.js', 'Recharts', 'Plotly', 'Tableau', 'Power BI'],
      deliveryTime: '1-3 weeks',
      projects: '120+'
    }
  ];

  if (!mounted) return null;

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />

        <main className="pt-16 sm:pt-18 md:pt-20">
          {/* Hero Section - Mission Control */}
          <HeroSection />

          {/* Agent Grid */}
          <AgentGridSection agents={agents} activeAgent={activeAgent} setActiveAgent={setActiveAgent} />

          {/* Detailed Agent View */}
          {activeAgent && (
            <AgentDetailSection
              agent={agents.find(a => a.id === activeAgent)!}
              onClose={() => setActiveAgent(null)}
            />
          )}

          {/* Comparison Section */}
          <ComparisonSection />

          {/* Process Section */}
          <ProcessSection />

          {/* CTA Section */}
          <CTASection />
        </main>

        <Footer />
      </div>
    </PageBackground>
  );
}

function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #10b981 1px, transparent 1px),
              linear-gradient(#10b981 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
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
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm mb-6 sm:mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-emerald-300">4 AI Agents Online</span>
            <div className="h-3 sm:h-4 w-px bg-emerald-500/30 hidden sm:block" />
            <span className="text-[10px] sm:text-xs text-emerald-400/60 font-mono">System Status: OPTIMAL</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 leading-[1.1] px-2">
            <span className="text-white/90">AI Agent</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Deployment Center
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
            Four specialized AI agents ready to be deployed on your project.
            Each agent is trained for specific tasks and works autonomously to deliver
            <span className="text-emerald-400"> production-ready code</span>.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12 px-2">
            {[
              { value: '550+', label: 'Projects Completed' },
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
                <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
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
            <div className="bg-[#0d1117] rounded-lg sm:rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[#161b22] border-b border-slate-700/50">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-mono ml-1 sm:ml-2 truncate">cognivat-agent-control</span>
              </div>
              <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <div className="text-slate-500 whitespace-nowrap">$ cognivat deploy --list-agents</div>
                <div className="mt-2 space-y-0.5 sm:space-y-1">
                  <div className="text-emerald-400 whitespace-nowrap">  [ONLINE] WebForge     - Web Development</div>
                  <div className="text-cyan-400 whitespace-nowrap">  [ONLINE] DroidMaster  - Android Development</div>
                  <div className="text-violet-400 whitespace-nowrap">  [ONLINE] DataMind     - Data Analysis</div>
                  <div className="text-amber-400 whitespace-nowrap">  [ONLINE] VizCraft     - Data Visualization</div>
                </div>
                <div className="mt-2 sm:mt-3 text-slate-500 whitespace-nowrap">$ cognivat deploy WebForge --project &quot;your-next-app&quot;</div>
                <div className="text-emerald-400 flex items-center gap-1.5 sm:gap-2 mt-1">
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
  glowColor: string;
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Select Your Agent
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto px-2">
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
      <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isActive ? 'opacity-30' : ''}`} />

      <div className={`relative bg-[#0d1117] rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
        isActive ? `border-${agent.glowColor}-500/50 shadow-lg shadow-${agent.glowColor}-500/20` : 'border-slate-700/50 hover:border-slate-600/50'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-slate-700/50 bg-slate-800/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0`}>
                {agent.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">{agent.name}</h3>
                  <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400">{agent.status}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1 font-medium truncate">{agent.title}</p>
              </div>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-lg bg-slate-800/50 transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 md:p-6">
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6">
            {agent.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg bg-slate-800/30">
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.metrics.speed}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">Speed</div>
            </div>
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg bg-slate-800/30">
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.metrics.accuracy}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">Accuracy</div>
            </div>
            <div className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg bg-slate-800/30">
              <div className={`text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                {agent.projects}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500">Projects</div>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            {agent.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-slate-800/50 text-slate-300 border border-slate-700/50">
                {tech}
              </span>
            ))}
            {agent.techStack.length > 4 && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-slate-800/50 text-slate-500">
                +{agent.techStack.length - 4} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm">
              <span className="text-slate-500">Delivery: </span>
              <span className="text-white font-medium">{agent.deliveryTime}</span>
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
          <div className="p-4 sm:p-5 md:p-6 pt-0 border-t border-slate-700/50">
            <h4 className="text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4">Full Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agent.capabilities.map((cap) => (
                <div key={cap} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400">
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
          className="bg-[#0d1117] rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          {/* Agent Header with Visual */}
          <div className={`relative p-4 sm:p-6 md:p-8 bg-gradient-to-br ${agent.gradient} bg-opacity-10`}>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
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
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{agent.name}</h2>
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400">{agent.status}</span>
                  </div>
                </div>
                <p className="text-lg sm:text-xl text-slate-400">{agent.title}</p>
                <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">{agent.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Agent Details */}
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8">
            {/* Left: Description & Capabilities */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">About This Agent</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{agent.description}</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Capabilities</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {agent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-800/30">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${agent.gradient} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm text-slate-300 break-words">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Tech Stack & Metrics */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Technology Stack</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {agent.techStack.map((tech) => (
                    <span key={tech} className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg bg-gradient-to-r ${agent.gradient} bg-opacity-10 border border-slate-700/50 text-white text-xs sm:text-sm`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl bg-slate-800/30 text-center">
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.speed}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Speed Boost</div>
                  </div>
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl bg-slate-800/30 text-center">
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.accuracy}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Accuracy</div>
                  </div>
                  <div className="p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl bg-slate-800/30 text-center">
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${agent.gradient}`}>
                      {agent.metrics.uptime}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Uptime</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/30">
                <div>
                  <div className="text-xs sm:text-sm text-slate-500">Typical Delivery Time</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{agent.deliveryTime}</div>
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
    <section ref={ref} className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Traditional Agency vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Agents</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto px-2">
            See how our AI agents outperform traditional development approaches
          </p>
        </motion.div>

        <motion.div
          className="bg-[#0d1117] rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden overflow-x-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 bg-slate-800/30 border-b border-slate-700/50 min-w-[600px]">
            <div className="text-xs sm:text-sm font-medium text-slate-400">Feature</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 text-center">Traditional</div>
            <div className="text-xs sm:text-sm font-medium text-emerald-400 text-center">AI Agents</div>
            <div className="text-xs sm:text-sm font-medium text-cyan-400 text-center">Improvement</div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={row.feature}
              className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors min-w-[600px]"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <div className="text-xs sm:text-sm md:text-base text-white font-medium">{row.feature}</div>
              <div className="text-xs sm:text-sm md:text-base text-slate-500 text-center">{row.traditional}</div>
              <div className="text-xs sm:text-sm md:text-base text-emerald-400 text-center font-medium">{row.ai}</div>
              <div className="text-center">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs md:text-sm font-medium">
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
      gradient: 'from-emerald-400 to-cyan-500'
    },
    {
      number: '02',
      title: 'Brief the Agent',
      description: 'Provide project requirements through our intuitive quote system',
      icon: '📋',
      gradient: 'from-cyan-400 to-violet-500'
    },
    {
      number: '03',
      title: 'Agent Deploys',
      description: 'Your AI agent autonomously starts building your solution',
      icon: '🚀',
      gradient: 'from-violet-400 to-amber-500'
    },
    {
      number: '04',
      title: 'Review & Launch',
      description: 'Review the deliverables and deploy to production',
      icon: '✨',
      gradient: 'from-amber-400 to-emerald-500'
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto px-2">
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
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
              )}

              <div className="relative bg-[#0d1117] rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-5 md:p-6 hover:border-slate-600/50 transition-colors group">
                {/* Step Number */}
                <div className={`absolute -top-2.5 sm:-top-3 -left-2.5 sm:-left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 mt-3 sm:mt-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400">{step.description}</p>
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
    <section ref={ref} className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[700px] md:w-[800px] h-[600px] sm:h-[700px] md:h-[800px] bg-emerald-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 px-2">
            Ready to Deploy Your Agent?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-9 md:mb-10 max-w-2xl mx-auto px-2">
            Get a free quote and see how our AI agents can transform your next project.
            No commitment, no pressure.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link
              href="/quote"
              className="group px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
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
              className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl border border-slate-600/50 text-slate-300 text-sm sm:text-base font-medium hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-300"
            >
              View Portfolio
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-slate-500 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Free consultation</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>24-hour response</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>No obligation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
