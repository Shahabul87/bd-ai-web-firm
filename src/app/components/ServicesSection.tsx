"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import DataVisualizationDemo from './services/DataVisualizationDemo';
import MachineLearningDemo from './services/MachineLearningDemo';
import NLPDemo from './services/NLPDemo';
import ComputerVisionDemo from './services/ComputerVisionDemo';
import PredictiveAnalyticsDemo from './services/PredictiveAnalyticsDemo';
import AIAutomationDemo from './services/AIAutomationDemo';

export default function ServicesSection() {
  const [activeCapability, setActiveCapability] = useState(0);
  // Removed isTransitioning for better performance
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const capabilities = [
    {
      id: 'ai-model-training',
      title: 'AI Model Development',
      description: 'End-to-end AI model training, validation, and deployment. From data preprocessing to production-ready models.',
      icon: '🧠',
      gradient: 'from-cyan-400 to-purple-500',
      component: MachineLearningDemo
    },
    {
      id: 'data-pipelines',
      title: 'Data Processing Pipelines',
      description: 'Automated data preprocessing, ETL workflows, and real-time data streaming for AI applications.',
      icon: '🔄',
      gradient: 'from-purple-500 to-orange-500',
      component: DataVisualizationDemo
    },
    {
      id: 'web-development',
      title: 'Autonomous Web Development',
      description: 'Low-cost, high-quality websites and web applications built with AI-powered autonomous coding.',
      icon: '🌐',
      gradient: 'from-orange-500 to-green-400',
      component: AIAutomationDemo
    },
    {
      id: 'fintech-analysis',
      title: 'FinTech Data Analysis',
      description: 'Financial data visualization, risk analysis, trading insights, and compliance reporting solutions.',
      icon: '💹',
      gradient: 'from-green-400 to-cyan-400',
      component: PredictiveAnalyticsDemo
    },
    {
      id: 'healthcare-analytics',
      title: 'Healthcare Analytics',
      description: 'Medical data analysis, patient insights, diagnostic support, and healthcare workflow optimization.',
      icon: '🏥',
      gradient: 'from-cyan-400 to-orange-500',
      component: ComputerVisionDemo
    },
    {
      id: 'customer-intelligence',
      title: 'Customer Analysis',
      description: 'Customer behavior analysis, segmentation, lifetime value prediction, and personalization engines.',
      icon: '👥',
      gradient: 'from-purple-500 to-green-400',
      component: NLPDemo
    }
  ];

  // Auto-cycle through capabilities with optimized requestAnimationFrame
  useEffect(() => {
    if (!isInView) return;
    
    let isActive = true;
    let currentTimeout: NodeJS.Timeout;
    
    const cycleCapabilities = () => {
      if (!isActive) return;
      
      setActiveCapability((prev) => (prev + 1) % capabilities.length);
      
      // Simple timeout without nested chains
      currentTimeout = setTimeout(cycleCapabilities, 8000); // Simpler 8s cycle
    };
    
    // Start cycling after initial delay
    currentTimeout = setTimeout(cycleCapabilities, 5000);
    
    return () => {
      isActive = false;
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [isInView, capabilities.length]);

  // Simple capability switching without complex transitions
  const handleCapabilityClick = (index: number) => {
    if (index === activeCapability) return;
    setActiveCapability(index);
  };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 animate-gradient">Development</span> Services
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Autonomous AI development, model training, data pipelines, and low-cost web solutions. 
            Experience agentic coding that delivers results fast.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {capabilities.map((capability, index) => (
            <button
              key={capability.id}
              onClick={() => handleCapabilityClick(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 ${
                activeCapability === index
                  ? `bg-gradient-to-r ${capability.gradient} text-white shadow-lg scale-105`
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-600/80 hover:shadow-md'
              }`}
            >
              <span className="mr-2">{capability.icon}</span>
              <span className="hidden sm:inline">{capability.title}</span>
              <span className="sm:hidden">{capability.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Capability Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-300 ease-out">
          {/* Info Panel */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${capabilities[activeCapability].gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {capabilities[activeCapability].icon}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {capabilities[activeCapability].title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">AI Powered</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-slate-300 leading-relaxed">
              {capabilities[activeCapability].description}
            </p>
            
            {/* Features List */}
            <FeaturesList capabilityId={capabilities[activeCapability].id} />
            
            {/* CTA */}
            <div className="pt-4">
              <button className={`group px-6 py-3 rounded-full bg-gradient-to-r ${capabilities[activeCapability].gradient} text-white font-semibold hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-105 active:scale-95`}>
                <span className="flex items-center gap-2">
                  Explore {capabilities[activeCapability].title}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Demo Panel */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-700/50 p-8 backdrop-blur-sm neural-glow transition-all duration-300 ease-out">
            {React.createElement(capabilities[activeCapability].component, { 
              isActive: true
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-12">
          {capabilities.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeCapability ? 'w-12 bg-cyan-400' : 'w-3 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesList({ capabilityId }: { capabilityId: string }) {
  const features = {
    'ai-model-training': [
      'Model Training & Validation',
      'Hyperparameter Optimization',
      'Performance Testing',
      'Production Deployment'
    ],
    'data-pipelines': [
      'ETL Workflow Design',
      'Real-time Data Processing',
      'Data Quality Monitoring',
      'Automated Preprocessing'
    ],
    'web-development': [
      'Autonomous Code Generation',
      'Responsive Design',
      'Low-Cost Solutions',
      'Fast Delivery'
    ],
    'fintech-analysis': [
      'Financial Data Visualization',
      'Risk Assessment Models',
      'Trading Analytics',
      'Compliance Reporting'
    ],
    'healthcare-analytics': [
      'Medical Data Processing',
      'Patient Journey Analysis',
      'Diagnostic Support',
      'Workflow Optimization'
    ],
    'customer-intelligence': [
      'Behavior Analysis',
      'Customer Segmentation',
      'Lifetime Value Prediction',
      'Personalization Engines'
    ]
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {features[capabilityId as keyof typeof features]?.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
          <span className="text-sm text-slate-400">{feature}</span>
        </div>
      ))}
    </div>
  );
}