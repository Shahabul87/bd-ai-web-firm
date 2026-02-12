'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header />
      <main>
        <HeroSection />
        <OriginStorySection />
        <AIAgentsShowcase />
        <MissionVisionSection />
        <TechnologyDNA />
        <FounderSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-24"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[150px] opacity-30" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--brand-accent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 backdrop-blur-sm">
              <div className="relative">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                <div className="absolute inset-0 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-ping" style={{ background: 'var(--brand-primary)' }} />
              </div>
              <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>
                About CraftsAI
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="block" style={{ color: 'var(--foreground)' }}>
                The Neural Network
              </span>
              <span className="block mt-1 md:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                Behind the Code
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We&apos;re not just another dev agency. We&apos;re a collective of
              <span style={{ color: 'var(--brand-primary)' }}> autonomous AI agents </span>
              and human strategists building the future of software development.
            </p>

            <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-8 pt-2 md:pt-4">
              {[
                { value: '2025', label: 'Founded' },
                { value: '2', label: 'AI Agents' },
                { value: '10x', label: 'Faster Delivery' },
                { value: '∞', label: 'Possibilities' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Agent Visualization */}
          <motion.div
            className="relative mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full aspect-square max-w-sm sm:max-w-md md:max-w-lg mx-auto">
              {/* Central Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full backdrop-blur-sm border flex items-center justify-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl">
                    <span className="text-2xl md:text-3xl font-bold text-white">C</span>
                  </div>
                </div>
              </div>

              {/* Orbiting Agent Icons */}
              {[
                { icon: '🌐', label: 'WebForge', angle: 60, color: 'indigo' },
                { icon: '📱', label: 'DroidMaster', angle: 240, color: 'cyan' }
              ].map((agent, i) => (
                <motion.div
                  key={agent.label}
                  className="absolute"
                  style={{
                    top: `${50 + 35 * Math.sin((agent.angle * Math.PI) / 180)}%`,
                    left: `${50 + 35 * Math.cos((agent.angle * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-14 h-14 md:w-18 md:h-18 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-lg backdrop-blur-sm border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    {agent.icon}
                  </div>
                  <div className="text-[10px] md:text-xs text-center mt-1 md:mt-2" style={{ color: 'var(--text-secondary)' }}>{agent.label}</div>
                </motion.div>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {[60, 240].map((angle, i) => (
                  <line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`${50 + 35 * Math.cos((angle * Math.PI) / 180)}%`}
                    y2={`${50 + 35 * Math.sin((angle * Math.PI) / 180)}%`}
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                ))}
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OriginStorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 50%, var(--background) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border mb-4 md:mb-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
            <span className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>Our Origin</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span style={{ color: 'var(--foreground)' }}>Born from a </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Vision
            </span>
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            The story of how one developer&apos;s frustration with traditional software development
            sparked a revolution in AI-powered coding.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block" style={{ background: 'linear-gradient(to bottom, var(--brand-primary), var(--brand-accent))' }} />

          {[
            {
              year: 'The Problem',
              title: 'Broken Industry',
              description: 'Software development was expensive, slow, and inaccessible to startups. Traditional agencies charged $50k+ for basic apps. We knew there had to be a better way.',
              icon: '💔',
              gradient: 'from-red-500 to-orange-500'
            },
            {
              year: 'The Insight',
              title: 'AI Agents Can Code',
              description: 'What if AI didn&apos;t just assist developers but became the developer? Multiple specialized agents working in parallel, each mastering a different aspect of software creation.',
              icon: '💡',
              gradient: 'from-amber-500 to-yellow-500'
            },
            {
              year: 'The Build',
              title: 'Creating the Agents',
              description: 'We trained 2 specialized AI agents: WebForge for full-stack web apps and DroidMaster for native Android development. Each an expert in their domain.',
              icon: '🔧',
              gradient: 'from-indigo-500 to-cyan-500'
            },
            {
              year: 'The Launch',
              title: 'CraftsAI is Born',
              description: 'In 2025, CraftsAI emerged as the first Agentic AI Coding Studio. We&apos;re not replacing developers - we&apos;re democratizing development, making great software accessible to everyone.',
              icon: '🚀',
              gradient: 'from-cyan-500 to-violet-500'
            }
          ].map((item, i) => (
            <motion.div
              key={item.year}
              className={`relative flex flex-col lg:flex-row items-center gap-6 md:gap-8 mb-12 md:mb-16 last:mb-0 ${
                i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className={`flex-1 w-full text-center lg:text-left ${i % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
                <div className={`inline-block px-3 md:px-4 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white text-xs md:text-sm font-bold mb-3 md:mb-4`}>
                  {item.year}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
                <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              </div>

              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl md:text-3xl shadow-lg`}>
                  {item.icon}
                </div>
              </div>

              <div className="flex-1 hidden lg:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIAgentsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    {
      id: 'webforge',
      name: 'WebForge',
      icon: '🌐',
      role: 'Web Development Agent',
      description: 'Specializes in crafting modern, responsive web applications. From React to Next.js, it builds production-ready frontends with pixel-perfect precision.',
      capabilities: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'API Integration'],
      stats: { speed: 95, quality: 98, creativity: 88 },
      gradient: 'from-indigo-500 to-cyan-500'
    },
    {
      id: 'droidmaster',
      name: 'DroidMaster',
      icon: '📱',
      role: 'Android Development Agent',
      description: 'Expert in native Android development using Kotlin and Jetpack Compose. Creates smooth, performant mobile experiences that users love.',
      capabilities: ['Kotlin', 'Jetpack Compose', 'Material Design', 'Firebase', 'Play Store'],
      stats: { speed: 92, quality: 96, creativity: 85 },
      gradient: 'from-cyan-500 to-violet-500'
    }
  ];

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border mb-4 md:mb-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse" style={{ background: 'var(--brand-success)' }} />
            <span className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>Our AI Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span style={{ color: 'var(--foreground)' }}>Meet the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Agents
            </span>
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Two specialized AI agents, each a master of their craft, working together to build your vision.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4 mb-8 md:mb-10 lg:mb-12 px-4">
          {agents.map((agent, i) => (
            <motion.button
              key={agent.id}
              className="flex items-center gap-2 md:gap-3 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl border transition-all duration-300 text-sm md:text-base"
              style={{
                background: activeAgent === i ? 'var(--card-bg)' : 'transparent',
                borderColor: activeAgent === i ? 'var(--brand-primary)' : 'var(--card-border)',
                color: activeAgent === i ? 'var(--foreground)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveAgent(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-xl md:text-2xl">{agent.icon}</span>
              <span className={activeAgent === i ? 'font-medium' : ''}>{agent.name}</span>
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeAgent}
          className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start lg:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${agents[activeAgent].gradient} flex items-center justify-center text-3xl md:text-4xl shadow-lg flex-shrink-0`}>
                {agents[activeAgent].icon}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{agents[activeAgent].name}</h3>
                <p className={`text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r ${agents[activeAgent].gradient}`}>
                  {agents[activeAgent].role}
                </p>
              </div>
            </div>

            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {agents[activeAgent].description}
            </p>

            <div>
              <h4 className="text-xs md:text-sm font-medium mb-2 md:mb-3" style={{ color: 'var(--text-secondary)' }}>CAPABILITIES</h4>
              <div className="flex flex-wrap gap-2">
                {agents[activeAgent].capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm border"
                    style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-xl md:rounded-2xl border backdrop-blur-sm order-1 lg:order-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6" style={{ color: 'var(--foreground)' }}>Agent Performance Metrics</h4>

            {Object.entries(agents[activeAgent].stats).map(([key, value]) => (
              <div key={key} className="mb-4 md:mb-6 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="text-xs md:text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span className="text-xs md:text-sm font-bold" style={{ color: 'var(--foreground)' }}>{value}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${agents[activeAgent].gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs md:text-sm text-emerald-500">Active &amp; Ready</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionVisionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative p-6 md:p-8 rounded-xl md:rounded-2xl border backdrop-blur-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: 'var(--foreground)' }}>Our Mission</h3>
              <p className="text-sm md:text-base leading-relaxed mb-4 md:mb-6" style={{ color: 'var(--text-secondary)' }}>
                To democratize software development by making high-quality, custom applications
                accessible to every startup, entrepreneur, and business - regardless of budget.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['Accessibility', 'Quality', 'Speed'].map((tag) => (
                  <span key={tag} className="px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm border" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', background: 'var(--brand-primary)' + '10' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative p-6 md:p-8 rounded-xl md:rounded-2xl border backdrop-blur-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: 'var(--foreground)' }}>Our Vision</h3>
              <p className="text-sm md:text-base leading-relaxed mb-4 md:mb-6" style={{ color: 'var(--text-secondary)' }}>
                A future where AI agents and humans collaborate seamlessly, where great ideas
                aren&apos;t limited by development costs, and where innovation moves at the speed of thought.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['Innovation', 'Collaboration', 'Future'].map((tag) => (
                  <span key={tag} className="px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm border" style={{ borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)', background: 'var(--brand-secondary)' + '10' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 px-4" style={{ color: 'var(--foreground)' }}>What Drives Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: '⚡', title: 'Speed', desc: 'Deliver 10x faster than traditional development' },
              { icon: '💎', title: 'Quality', desc: 'Production-ready code, every single time' },
              { icon: '🤝', title: 'Partnership', desc: 'Your success is our success' },
              { icon: '🔄', title: 'Iteration', desc: 'Rapid refinement based on your feedback' }
            ].map((value) => (
              <div
                key={value.title}
                className="text-center p-4 md:p-6 rounded-lg md:rounded-xl border transition-colors hover:shadow-md"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <span className="text-3xl md:text-4xl mb-3 md:mb-4 block">{value.icon}</span>
                <h4 className="text-base md:text-lg font-bold mb-1 md:mb-2" style={{ color: 'var(--foreground)' }}>{value.title}</h4>
                <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TechnologyDNA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const techCategories = [
    { name: 'Frontend', gradient: 'from-indigo-500 to-blue-500', techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
    { name: 'Mobile', gradient: 'from-cyan-500 to-teal-500', techs: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Material Design'] },
    { name: 'Backend', gradient: 'from-violet-500 to-purple-500', techs: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis'] },
    { name: 'AI/ML', gradient: 'from-amber-500 to-orange-500', techs: ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'LangChain'] }
  ];

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--surface-elevated) 0%, var(--background) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border mb-4 md:mb-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ background: 'var(--brand-secondary)' }} />
            <span className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>Technology Stack</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span style={{ color: 'var(--foreground)' }}>Our Technical </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              DNA
            </span>
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Modern, battle-tested technologies that power enterprise-grade solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {techCategories.map((category, i) => (
            <motion.div
              key={category.name}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative p-5 md:p-6 rounded-xl md:rounded-2xl border hover:shadow-md transition-all h-full" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className={`inline-block px-2.5 md:px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-xs md:text-sm font-medium mb-3 md:mb-4`}>
                  {category.name}
                </div>
                <div className="space-y-2 md:space-y-3">
                  {category.techs.map((tech) => (
                    <div key={tech} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--brand-primary)' }} />
                      <span className="text-xs md:text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="relative p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border backdrop-blur-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute -top-4 md:-top-6 -left-2 md:-left-4 text-6xl md:text-8xl font-serif" style={{ color: 'var(--brand-primary)', opacity: 0.2 }}>&ldquo;</div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-4xl md:text-5xl shadow-xl">
                👨‍💻
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-4 md:mb-6 italic" style={{ color: 'var(--foreground)' }}>
                &ldquo;I built CraftsAI because I believe every entrepreneur deserves access to
                world-class software development. AI agents aren&apos;t here to replace human creativity -
                they&apos;re here to amplify it. Let&apos;s build something amazing together.&rdquo;
              </p>
              <div>
                <div className="text-base md:text-lg font-bold" style={{ color: 'var(--foreground)' }}>Founder &amp; AI Architect</div>
                <div className="text-sm md:text-base" style={{ color: 'var(--brand-primary)' }}>CraftsAI</div>
              </div>
            </div>
          </div>
        </motion.div>
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
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--surface-elevated) 0%, var(--background) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span style={{ color: 'var(--foreground)' }}>Ready to Build </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Something Amazing?
            </span>
          </h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Join the AI revolution. Let our agents turn your vision into reality -
            faster, better, and more affordable than ever before.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link
              href="/quote"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg md:rounded-xl text-white font-semibold text-sm md:text-base overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your Project
                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>

            <Link
              href="/services"
              className="px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl border font-medium text-sm md:text-base transition-all duration-300 hover:shadow-md"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Explore Services
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mt-8 md:mt-10 lg:mt-12 text-xs md:text-sm px-4" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
              <span>24/7 AI Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
              <span>Startup-Friendly Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{ background: 'var(--brand-secondary)' }} />
              <span>Production-Ready Code</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
