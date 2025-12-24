"use client";

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

export default function ServicesSection() {
  const [activeService, setActiveService] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      id: 'web-development',
      title: 'Web Development',
      subtitle: 'Full-Stack Applications',
      description: 'Our AI agents build complete web applications from React frontends to Node.js backends. Modern, scalable, and production-ready.',
      icon: '🌐',
      gradient: 'from-emerald-400 to-cyan-500',
      bgGlow: 'bg-emerald-500/10',
      features: ['React & Next.js Apps', 'API Development', 'Database Design', 'Cloud Deployment'],
      stats: { speed: '10x Faster', cost: '80% Savings' }
    },
    {
      id: 'android-development',
      title: 'Android Development',
      subtitle: 'Native Mobile Apps',
      description: 'AI-powered Android app development using Kotlin and Jetpack Compose. Beautiful, performant apps for the Play Store.',
      icon: '📱',
      gradient: 'from-cyan-400 to-violet-500',
      bgGlow: 'bg-cyan-500/10',
      features: ['Kotlin & Compose', 'Material Design 3', 'Firebase Integration', 'Play Store Ready'],
      stats: { speed: '8x Faster', cost: '75% Savings' }
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis',
      subtitle: 'AI-Powered Insights',
      description: 'Transform raw data into actionable business intelligence. Our AI analyzes patterns, trends, and anomalies at scale.',
      icon: '📊',
      gradient: 'from-violet-400 to-amber-500',
      bgGlow: 'bg-violet-500/10',
      features: ['Pattern Recognition', 'Predictive Models', 'Statistical Analysis', 'Report Automation'],
      stats: { accuracy: '99.2%', processing: '100x Faster' }
    },
    {
      id: 'data-visualization',
      title: 'Data Visualization',
      subtitle: 'Interactive Dashboards',
      description: 'Create stunning interactive dashboards and data visualizations that make complex data easy to understand.',
      icon: '📈',
      gradient: 'from-amber-400 to-emerald-500',
      bgGlow: 'bg-amber-500/10',
      features: ['Custom Dashboards', 'Real-time Charts', 'Interactive Reports', 'Export & Share'],
      stats: { customization: '100%', updates: 'Real-time' }
    }
  ];

  const currentService = services[activeService];

  return (
    <section
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">AI Agent Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-white/90">What We</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Build
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Four specialized AI agent teams ready to code your next project
          </p>
        </motion.div>

        {/* Service Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {services.map((service, index) => (
            <button
              key={service.id}
              onClick={() => setActiveService(index)}
              className={`group flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeService === index
                  ? `bg-gradient-to-r ${service.gradient} text-white shadow-lg shadow-emerald-500/20`
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <span className="text-lg">{service.icon}</span>
              <span className="hidden sm:inline">{service.title}</span>
            </button>
          ))}
        </motion.div>

        {/* Service Content */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Left: Service Info */}
          <div className="space-y-8">
            <div>
              <div className={`inline-flex items-center gap-3 mb-4`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentService.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {currentService.icon}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {currentService.title}
                  </h3>
                  <p className={`text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${currentService.gradient}`}>
                    {currentService.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                {currentService.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentService.features.map((feature, i) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentService.gradient}`} />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {Object.entries(currentService.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentService.gradient}`}>
                    {value}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-4">
              <Link
                href="/quote"
                className={`group px-6 py-3 rounded-xl bg-gradient-to-r ${currentService.gradient} text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5`}
              >
                <span className="flex items-center gap-2">
                  Start Project
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href={`/services/${currentService.id}`}
                className="px-6 py-3 rounded-xl border border-slate-600/50 text-slate-300 font-medium hover:border-slate-500/50 hover:text-white transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div className={`relative rounded-3xl overflow-hidden border border-slate-700/50 ${currentService.bgGlow}`}>
            <ServiceVisual service={currentService} />
          </div>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-16">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveService(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeService
                  ? `w-10 bg-gradient-to-r ${services[index].gradient}`
                  : 'w-3 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Visual component for each service
function ServiceVisual({ service }: { service: { id: string; gradient: string; title: string } }) {
  const visuals: Record<string, React.ReactNode> = {
    'web-development': (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-slate-500 font-mono">localhost:3000</span>
        </div>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex gap-3">
            <span className="text-slate-600">1</span>
            <span className="text-violet-400">export default function</span>
            <span className="text-cyan-400">Dashboard</span>
            <span className="text-slate-400">() {'{'}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-600">2</span>
            <span className="text-slate-400 ml-4">const [data] = </span>
            <span className="text-amber-400">useQuery</span>
            <span className="text-slate-400">();</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-600">3</span>
            <span className="text-violet-400 ml-4">return</span>
            <span className="text-emerald-400">&lt;DataGrid</span>
            <span className="text-slate-400">/&gt;;</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-600">4</span>
            <span className="text-slate-400">{'}'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 mt-6">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          AI Agent writing code...
        </div>
      </div>
    ),
    'android-development': (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="relative">
          {/* Phone Frame */}
          <div className="w-48 h-96 bg-slate-900 rounded-[2rem] border-4 border-slate-700 p-2 shadow-2xl">
            <div className="w-full h-full bg-slate-800 rounded-[1.5rem] overflow-hidden">
              {/* Status Bar */}
              <div className="h-6 bg-slate-900 flex items-center justify-between px-4">
                <span className="text-[10px] text-slate-400">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-1.5 bg-slate-400 rounded-sm" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
              </div>
              {/* App Content */}
              <div className="p-3 space-y-2">
                <div className="h-8 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-lg" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-emerald-500/20 rounded-lg" />
                  <div className="h-16 bg-cyan-500/20 rounded-lg" />
                </div>
                <div className="h-24 bg-violet-500/20 rounded-lg" />
                <div className="h-12 bg-amber-500/20 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Agent Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 rounded-full border border-cyan-500/30 text-xs text-cyan-400">
            Kotlin Agent
          </div>
        </div>
      </div>
    ),
    'data-analysis': (
      <div className="p-8 space-y-6 min-h-[400px]">
        <div className="text-xs text-slate-500 font-mono mb-4">analysis_pipeline.py</div>
        <div className="grid grid-cols-3 gap-3">
          {['Raw Data', 'Processing', 'Insights'].map((stage, i) => (
            <div key={stage} className="text-center">
              <div className={`h-20 rounded-lg bg-gradient-to-b ${
                i === 0 ? 'from-slate-600/40 to-slate-700/20' :
                i === 1 ? 'from-violet-500/30 to-violet-600/10' :
                'from-amber-500/30 to-amber-600/10'
              } flex items-center justify-center mb-2`}>
                <span className="text-2xl">{['📥', '⚙️', '💡'][i]}</span>
              </div>
              <span className="text-xs text-slate-400">{stage}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Pattern Detection</span>
            <span className="text-emerald-400">98.7%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[98%] bg-gradient-to-r from-violet-500 to-amber-500 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-violet-400">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          AI analyzing 2.4M records...
        </div>
      </div>
    ),
    'data-visualization': (
      <div className="p-8 space-y-4 min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-300 font-medium">Revenue Dashboard</span>
          <span className="text-xs text-emerald-400">LIVE</span>
        </div>
        {/* Chart */}
        <div className="h-40 flex items-end gap-2 p-4 bg-slate-800/50 rounded-xl">
          {[65, 78, 85, 72, 90, 85, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500/80 to-amber-500/80 transition-all duration-500"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Revenue', value: '$2.4M', change: '+12%' },
            { label: 'Users', value: '18.2K', change: '+8%' },
            { label: 'Growth', value: '24%', change: '+5%' }
          ].map(metric => (
            <div key={metric.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{metric.value}</div>
              <div className="text-xs text-slate-500">{metric.label}</div>
              <div className="text-xs text-emerald-400">{metric.change}</div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="bg-[#0d1117] min-h-[400px]">
      {visuals[service.id] || (
        <div className="p-8 text-center text-slate-500">
          Demo Coming Soon
        </div>
      )}
    </div>
  );
}