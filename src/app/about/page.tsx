'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white bg-[#0a0a0f]">
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

// Hero Section - "The Neural Network Behind CraftsAI"
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-24"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 25%, #0a0f1a 50%, #0d0d14 75%, #0a0a0f 100%)'
      }}
    >
      {/* Animated Neural Network Background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Neural connections */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {Array.from({ length: 15 }).map((_, i) => (
              <circle
                key={i}
                cx={`${10 + (i * 6) % 90}%`}
                cy={`${15 + (i * 7) % 80}%`}
                r="3"
                fill="url(#neuralGradient)"
                className="animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`line-${i}`}
                x1={`${10 + (i * 5) % 80}%`}
                y1={`${20 + (i * 4) % 70}%`}
                x2={`${30 + (i * 6) % 60}%`}
                y2={`${30 + (i * 5) % 60}%`}
                stroke="url(#neuralGradient)"
                strokeWidth="0.5"
                className="opacity-30"
              />
            ))}
          </svg>
        </div>
      )}

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[100px] md:blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-violet-500/10 rounded-full blur-[60px] md:blur-[100px]" />
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
              <div className="relative">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <span className="text-xs md:text-sm font-medium text-emerald-300 tracking-wide">
                About CraftsAI
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="block text-white/90">
                The Neural Network
              </span>
              <span className="block mt-1 md:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                Behind the Code
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
              We&apos;re not just another dev agency. We&apos;re a collective of
              <span className="text-emerald-400"> autonomous AI agents </span>
              and human strategists building the future of software development.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-8 pt-2 md:pt-4">
              {[
                { value: '2025', label: 'Founded' },
                { value: '4', label: 'AI Agents' },
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
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - 3D Agent Visualization */}
          <motion.div
            className="relative mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full aspect-square max-w-sm sm:max-w-md md:max-w-lg mx-auto">
              {/* Central Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/30 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900">C</span>
                  </div>
                </div>
              </div>

              {/* Orbiting Agent Icons */}
              {[
                { icon: '🌐', label: 'WebForge', angle: 0, color: 'emerald' },
                { icon: '📱', label: 'DroidMaster', angle: 90, color: 'cyan' },
                { icon: '📊', label: 'DataMind', angle: 180, color: 'violet' },
                { icon: '📈', label: 'VizCraft', angle: 270, color: 'amber' }
              ].map((agent, i) => (
                <motion.div
                  key={agent.label}
                  className="absolute"
                  style={{
                    top: `${50 + 35 * Math.sin((agent.angle * Math.PI) / 180)}%`,
                    left: `${50 + 35 * Math.cos((agent.angle * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-800/80 border border-${agent.color}-500/40 flex items-center justify-center text-xl md:text-2xl shadow-lg backdrop-blur-sm`}>
                    {agent.icon}
                  </div>
                  <div className="text-[10px] md:text-xs text-center mt-1 md:mt-2 text-slate-400">{agent.label}</div>
                </motion.div>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {[0, 90, 180, 270].map((angle, i) => (
                  <line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`${50 + 35 * Math.cos((angle * Math.PI) / 180)}%`}
                    y2={`${50 + 35 * Math.sin((angle * Math.PI) / 180)}%`}
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                ))}
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
}

// Origin Story Section
function OriginStorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)'
      }}
    >
      {/* Background accents */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-emerald-500/5 rounded-full blur-[100px] md:blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-violet-500/5 rounded-full blur-[100px] md:blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 md:mb-6">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full" />
            <span className="text-xs md:text-sm text-slate-300">Our Origin</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span className="text-white/90">Born from a </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Vision
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto px-4">
            The story of how one developer&apos;s frustration with traditional software development
            sparked a revolution in AI-powered coding.
          </p>
        </motion.div>

        {/* Story Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-cyan-500/50 to-violet-500/50 hidden lg:block" />

          {/* Timeline Items */}
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
              description: 'We trained 4 specialized AI agents: WebForge for web apps, DroidMaster for Android, DataMind for analytics, and VizCraft for visualizations. Each an expert in their domain.',
              icon: '🔧',
              gradient: 'from-emerald-500 to-cyan-500'
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
              {/* Content Card */}
              <div className={`flex-1 w-full text-center lg:text-left ${i % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
                <div className={`inline-block px-3 md:px-4 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white text-xs md:text-sm font-bold mb-3 md:mb-4`}>
                  {item.year}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              {/* Center Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl md:text-3xl shadow-lg`}>
                  {item.icon}
                </div>
              </div>

              {/* Spacer for alignment */}
              <div className="flex-1 hidden lg:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// AI Agents Showcase
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
      gradient: 'from-emerald-500 to-cyan-500',
      bgGradient: 'from-emerald-500/10 to-cyan-500/10'
    },
    {
      id: 'droidmaster',
      name: 'DroidMaster',
      icon: '📱',
      role: 'Android Development Agent',
      description: 'Expert in native Android development using Kotlin and Jetpack Compose. Creates smooth, performant mobile experiences that users love.',
      capabilities: ['Kotlin', 'Jetpack Compose', 'Material Design', 'Firebase', 'Play Store'],
      stats: { speed: 92, quality: 96, creativity: 85 },
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/10 to-blue-500/10'
    },
    {
      id: 'datamind',
      name: 'DataMind',
      icon: '📊',
      role: 'Data Analysis Agent',
      description: 'Transforms raw data into actionable insights. Builds automated pipelines, performs statistical analysis, and uncovers patterns in your data.',
      capabilities: ['Python', 'Pandas', 'SQL', 'ETL Pipelines', 'Statistical Analysis'],
      stats: { speed: 90, quality: 99, creativity: 82 },
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10'
    },
    {
      id: 'vizcraft',
      name: 'VizCraft',
      icon: '📈',
      role: 'Data Visualization Agent',
      description: 'Creates stunning, interactive visualizations that tell compelling data stories. From dashboards to reports, makes data beautiful and understandable.',
      capabilities: ['D3.js', 'Chart.js', 'Plotly', 'Dashboard Design', 'Interactive Reports'],
      stats: { speed: 88, quality: 95, creativity: 97 },
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10'
    }
  ];

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0f1a 0%, #0d1117 50%, #0a0a0f 100%)'
      }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-500/5 rounded-full blur-[100px] md:blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-violet-500/5 rounded-full blur-[100px] md:blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 md:mb-6">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs md:text-sm text-slate-300">Our AI Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span className="text-white/90">Meet the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Agents
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Four specialized AI agents, each a master of their craft, working together to build your vision.
          </p>
        </motion.div>

        {/* Agent Selector */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4 mb-8 md:mb-10 lg:mb-12 px-4">
          {agents.map((agent, i) => (
            <motion.button
              key={agent.id}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl border transition-all duration-300 text-sm md:text-base ${
                activeAgent === i
                  ? `bg-gradient-to-r ${agent.bgGradient} border-${agent.gradient.split('-')[1]}-500/50`
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
              }`}
              onClick={() => setActiveAgent(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-xl md:text-2xl">{agent.icon}</span>
              <span className={activeAgent === i ? 'text-white font-medium' : 'text-slate-400'}>
                {agent.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Active Agent Display */}
        <motion.div
          key={activeAgent}
          className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start lg:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Agent Info */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${agents[activeAgent].gradient} flex items-center justify-center text-3xl md:text-4xl shadow-lg flex-shrink-0`}>
                {agents[activeAgent].icon}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{agents[activeAgent].name}</h3>
                <p className={`text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r ${agents[activeAgent].gradient}`}>
                  {agents[activeAgent].role}
                </p>
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              {agents[activeAgent].description}
            </p>

            {/* Capabilities */}
            <div>
              <h4 className="text-xs md:text-sm font-medium text-slate-400 mb-2 md:mb-3">CAPABILITIES</h4>
              <div className="flex flex-wrap gap-2">
                {agents[activeAgent].capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs md:text-sm text-slate-300"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Stats */}
          <div className={`p-6 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-br ${agents[activeAgent].bgGradient} border border-slate-700/50 backdrop-blur-sm order-1 lg:order-2`}>
            <h4 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6">Agent Performance Metrics</h4>

            {Object.entries(agents[activeAgent].stats).map(([key, value]) => (
              <div key={key} className="mb-4 md:mb-6 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="text-xs md:text-sm text-slate-300 capitalize">{key}</span>
                  <span className="text-xs md:text-sm font-bold text-white">{value}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${agents[activeAgent].gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-slate-400">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs md:text-sm text-emerald-400">Active &amp; Ready</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Mission & Vision Section
function MissionVisionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)'
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-emerald-500/5 rounded-full blur-[150px] md:blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Mission */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -top-4 -left-4 w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-full blur-xl" />
            <div className="relative p-6 md:p-8 rounded-xl md:rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Our Mission</h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4 md:mb-6">
                To democratize software development by making high-quality, custom applications
                accessible to every startup, entrepreneur, and business - regardless of budget.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['Accessibility', 'Quality', 'Speed'].map((tag) => (
                  <span key={tag} className="px-2.5 md:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-violet-500/10 rounded-full blur-xl" />
            <div className="relative p-6 md:p-8 rounded-xl md:rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Our Vision</h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4 md:mb-6">
                A future where AI agents and humans collaborate seamlessly, where great ideas
                aren&apos;t limited by development costs, and where innovation moves at the speed of thought.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['Innovation', 'Collaboration', 'Future'].map((tag) => (
                  <span key={tag} className="px-2.5 md:px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs md:text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          className="mt-12 md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center text-white mb-8 md:mb-12 px-4">What Drives Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: '⚡', title: 'Speed', desc: 'Deliver 10x faster than traditional development' },
              { icon: '💎', title: 'Quality', desc: 'Production-ready code, every single time' },
              { icon: '🤝', title: 'Partnership', desc: 'Your success is our success' },
              { icon: '🔄', title: 'Iteration', desc: 'Rapid refinement based on your feedback' }
            ].map((value) => (
              <div
                key={value.title}
                className="text-center p-4 md:p-6 rounded-lg md:rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-emerald-500/30 transition-colors"
              >
                <span className="text-3xl md:text-4xl mb-3 md:mb-4 block">{value.icon}</span>
                <h4 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">{value.title}</h4>
                <p className="text-xs md:text-sm text-slate-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Technology DNA Section
function TechnologyDNA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const techCategories = [
    {
      name: 'Frontend',
      color: 'emerald',
      techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
    },
    {
      name: 'Mobile',
      color: 'cyan',
      techs: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Material Design']
    },
    {
      name: 'Backend',
      color: 'violet',
      techs: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis']
    },
    {
      name: 'AI/ML',
      color: 'amber',
      techs: ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'LangChain']
    }
  ];

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0f1a 50%, #0a0a0f 100%)'
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 md:mb-6">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-violet-400 rounded-full" />
            <span className="text-xs md:text-sm text-slate-300">Technology Stack</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span className="text-white/90">Our Technical </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              DNA
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
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
              <div className={`absolute inset-0 bg-${category.color}-500/5 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-5 md:p-6 rounded-xl md:rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors h-full">
                <div className={`inline-block px-2.5 md:px-3 py-1 rounded-full bg-${category.color}-500/10 border border-${category.color}-500/30 text-${category.color}-400 text-xs md:text-sm font-medium mb-3 md:mb-4`}>
                  {category.name}
                </div>
                <div className="space-y-2 md:space-y-3">
                  {category.techs.map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center gap-2 text-slate-300"
                    >
                      <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-${category.color}-400 flex-shrink-0`} />
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

// Founder Section
function FounderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)'
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-emerald-500/5 rounded-full blur-[150px] md:blur-[200px] -translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="relative p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Quote mark */}
          <div className="absolute -top-4 md:-top-6 -left-2 md:-left-4 text-6xl md:text-8xl text-emerald-500/20 font-serif">&ldquo;</div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-4xl md:text-5xl shadow-xl shadow-emerald-500/20">
                👨‍💻
              </div>
            </div>

            {/* Quote */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-lg md:text-xl lg:text-2xl text-slate-200 leading-relaxed mb-4 md:mb-6 italic">
                &ldquo;I built CraftsAI because I believe every entrepreneur deserves access to
                world-class software development. AI agents aren&apos;t here to replace human creativity -
                they&apos;re here to amplify it. Let&apos;s build something amazing together.&rdquo;
              </p>
              <div>
                <div className="text-base md:text-lg font-bold text-white">Founder &amp; AI Architect</div>
                <div className="text-emerald-400 text-sm md:text-base">CraftsAI</div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-full blur-xl md:blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)'
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[150px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-violet-500/10 rounded-full blur-[100px] md:blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
            <span className="text-white/90">Ready to Build </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Something Amazing?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join the AI revolution. Let our agents turn your vision into reality -
            faster, better, and more affordable than ever before.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link
              href="/quote"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg md:rounded-xl text-white font-semibold text-sm md:text-base overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your Project
                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/services"
              className="px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl border border-slate-600/50 text-slate-300 font-medium text-sm md:text-base hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300"
            >
              Explore Services
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mt-8 md:mt-10 lg:mt-12 text-xs md:text-sm text-slate-500 px-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-400 rounded-full" />
              <span>24/7 AI Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-400 rounded-full" />
              <span>Startup-Friendly Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-violet-400 rounded-full" />
              <span>Production-Ready Code</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
