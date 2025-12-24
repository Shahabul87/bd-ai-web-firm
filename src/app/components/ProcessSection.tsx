"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const processSteps = [
    {
      id: 'understand',
      title: 'Understand Your Vision',
      description: 'You describe what you need. Our AI agents analyze requirements, research best practices, and create a detailed project blueprint.',
      icon: '💡',
      color: 'from-emerald-400 to-cyan-500',
      features: ['Requirement Analysis', 'Tech Stack Selection', 'Architecture Design']
    },
    {
      id: 'code',
      title: 'AI Agents Write Code',
      description: 'Multiple specialized AI agents work in parallel - writing frontend, backend, database schemas, and tests simultaneously.',
      icon: '🤖',
      color: 'from-cyan-400 to-violet-500',
      features: ['Parallel Development', 'Auto-Testing', 'Code Review']
    },
    {
      id: 'iterate',
      title: 'Rapid Iteration',
      description: 'AI agents refine the code based on your feedback. Changes that would take days are done in hours.',
      icon: '🔄',
      color: 'from-violet-400 to-amber-500',
      features: ['Quick Revisions', 'Performance Tuning', 'Bug Fixes']
    },
    {
      id: 'deliver',
      title: 'Deploy & Support',
      description: 'Production-ready code deployed to your infrastructure. Our AI continues monitoring and can make updates instantly.',
      icon: '🚀',
      color: 'from-amber-400 to-emerald-500',
      features: ['Cloud Deployment', 'Monitoring', 'Ongoing Support']
    }
  ];

  const handleStepClick = (index: number) => {
    if (index === activeStep) return;
    setActiveStep(index);
  };

  return (
    <section
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0f1a 0%, #0d1117 50%, #0a0a0f 100%)'
      }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-white/90">From Idea to</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Production
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Our AI agents handle everything. You describe, we deliver.
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                activeStep === index
                  ? 'bg-slate-800/60 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/30'
              }`}
            >
              {/* Step Number */}
              <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                activeStep === index
                  ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                activeStep === index
                  ? `bg-gradient-to-br ${step.color} shadow-lg`
                  : 'bg-slate-800/60'
              }`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className={`text-lg font-bold mb-2 ${
                activeStep === index ? 'text-white' : 'text-slate-300'
              }`}>
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {step.features.map((feature, i) => (
                  <div
                    key={feature}
                    className={`flex items-center gap-2 text-xs ${
                      activeStep === index ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      activeStep === index
                        ? `bg-gradient-to-r ${step.color}`
                        : 'bg-slate-600'
                    }`} />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Active Indicator */}
              {activeStep === index && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">Active</span>
                </div>
              )}

              {/* Connector Line (not on last item) */}
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-700/50" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { value: '10x', label: 'Faster Delivery' },
            { value: '80%', label: 'Cost Reduction' },
            { value: '24/7', label: 'AI Availability' },
            { value: '99%', label: 'Client Satisfaction' }
          ].map((stat, i) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}