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
  ];

  const currentService = services[activeService];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-default)] mb-4 sm:mb-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">AI Agent Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 tracking-tight px-2">
            <span className="text-[var(--foreground)]">What We</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Build
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto px-2">
            Specialized AI agent teams ready to build your next project
          </p>
        </motion.div>

        {/* Service Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 md:mb-16 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {services.map((service, index) => (
            <button
              key={service.id}
              onClick={() => setActiveService(index)}
              className={`group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeService === index
                  ? `bg-gradient-to-r ${service.gradient} text-white shadow-lg shadow-emerald-500/20`
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-sunken)] border border-[var(--border-default)]'
              }`}
            >
              <span className="text-base sm:text-lg">{service.icon}</span>
              <span className="hidden sm:inline">{service.title}</span>
            </button>
          ))}
        </motion.div>

        {/* Service Content */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Left: Service Info */}
          <div className="space-y-6 sm:space-y-7 md:space-y-8">
            <div>
              <div className={`inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${currentService.gradient} flex items-center justify-center text-xl sm:text-2xl shadow-lg`}>
                  {currentService.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                    {currentService.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${currentService.gradient}`}>
                    {currentService.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                {currentService.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentService.features.map((feature, i) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-default)]"
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${currentService.gradient}`} />
                  <span className="text-xs sm:text-sm text-[var(--foreground)]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6">
              {Object.entries(currentService.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentService.gradient}`}>
                    {value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-wider mt-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/quote"
                className={`group px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${currentService.gradient} text-white font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5 text-center sm:text-left`}
              >
                <span className="flex items-center justify-center sm:justify-start gap-2">
                  Start Project
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href={`/services/${currentService.id}`}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] font-medium text-sm sm:text-base hover:border-[var(--brand-primary)]/50 hover:text-[var(--foreground)] transition-all duration-300 text-center"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div className={`relative rounded-3xl overflow-hidden border border-[var(--border-default)] ${currentService.bgGlow}`}>
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
                  : 'w-3 bg-[var(--border-default)] hover:bg-[var(--text-secondary)]'
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
  };

  return (
    <div className="bg-slate-950 min-h-[400px]">
      {visuals[service.id] || (
        <div className="p-8 text-center text-slate-500">
          Demo Coming Soon
        </div>
      )}
    </div>
  );
}