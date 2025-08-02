'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ServiceConfig {
  category: string;
  services: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  timeline: string;
  features: string[];
  budget: number;
}


const serviceCategories = {
  'AI & Machine Learning': {
    services: [
      'Predictive Analytics',
      'Natural Language Processing',
      'Computer Vision',
      'Recommendation Systems',
      'Chatbot Development',
      'Custom AI Models'
    ],
    basePrice: 15000,
    complexityMultipliers: { basic: 0.7, intermediate: 1, advanced: 1.5, enterprise: 2.5 }
  },
  'Web Development': {
    services: [
      'AI-Powered Web Apps',
      'E-commerce Platforms',
      'Dashboard Development',
      'API Development',
      'Mobile-Responsive Sites',
      'Custom Integrations'
    ],
    basePrice: 8000,
    complexityMultipliers: { basic: 0.6, intermediate: 1, advanced: 1.4, enterprise: 2.2 }
  },
  'Data Analytics': {
    services: [
      'Data Visualization',
      'Business Intelligence',
      'Real-time Dashboards',
      'Data Pipeline Setup',
      'Performance Analytics',
      'Custom Reports'
    ],
    basePrice: 12000,
    complexityMultipliers: { basic: 0.5, intermediate: 1, advanced: 1.3, enterprise: 2.0 }
  }
};

const complexityLevels = {
  basic: {
    name: 'Basic',
    description: 'Simple implementation with core features',
    timeline: '2-4 weeks',
    features: ['Basic functionality', 'Standard UI', 'Documentation', 'Basic testing']
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Enhanced features with custom integrations',
    timeline: '6-10 weeks',
    features: ['Advanced features', 'Custom UI/UX', 'API integrations', 'Comprehensive testing', 'Performance optimization']
  },
  advanced: {
    name: 'Advanced',
    description: 'Complex system with advanced AI capabilities',
    timeline: '3-5 months',
    features: ['Complex AI models', 'Advanced analytics', 'Real-time processing', 'Custom algorithms', 'Scalable architecture', 'Advanced security']
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full-scale solution with enterprise-grade features',
    timeline: '6-12 months',
    features: ['Enterprise integration', 'Multi-tenant architecture', 'Advanced security', 'Compliance features', 'Dedicated support', 'Custom training', 'SLA guarantees']
  }
};

export default function ServiceConfigurator() {
  const [config, setConfig] = useState<ServiceConfig>({
    category: '',
    services: [],
    complexity: 'intermediate',
    timeline: '',
    features: [],
    budget: 0
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const calculateEstimate = useCallback(() => {
    if (!config.category || config.services.length === 0) {
      setEstimatedCost(0);
      return;
    }

    const categoryData = serviceCategories[config.category as keyof typeof serviceCategories];
    const basePrice = categoryData.basePrice;
    const complexityMultiplier = categoryData.complexityMultipliers[config.complexity];
    const serviceMultiplier = config.services.length * 0.8; // Discount for multiple services

    const estimate = basePrice * complexityMultiplier * serviceMultiplier;
    setEstimatedCost(Math.round(estimate));
  }, [config]);

  useEffect(() => {
    calculateEstimate();
  }, [config, calculateEstimate]);

  const handleCategoryChange = (category: string) => {
    setConfig(prev => ({
      ...prev,
      category,
      services: [],
      features: complexityLevels[prev.complexity].features,
      timeline: complexityLevels[prev.complexity].timeline
    }));
    setShowResults(false);
  };

  const handleServiceToggle = (service: string) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleComplexityChange = (complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise') => {
    setConfig(prev => ({
      ...prev,
      complexity,
      features: complexityLevels[complexity].features,
      timeline: complexityLevels[complexity].timeline
    }));
  };

  const generateProposal = () => {
    setShowResults(true);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          <span className="text-white">Service </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Configurator
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Configure your ideal AI solution and get an instant estimate tailored to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6 lg:space-y-8">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">1. Select Service Category</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(serviceCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    config.category === category
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                      : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">{category}</div>
                  <div className="text-xs sm:text-sm mt-1 opacity-80">
                    Starting from ${serviceCategories[category as keyof typeof serviceCategories].basePrice.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          {config.category && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">2. Choose Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceCategories[config.category as keyof typeof serviceCategories].services.map((service) => (
                  <button
                    key={service}
                    onClick={() => handleServiceToggle(service)}
                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                      config.services.includes(service)
                        ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 ${
                        config.services.includes(service)
                          ? 'bg-purple-400 border-purple-400'
                          : 'border-slate-500'
                      }`}>
                        {config.services.includes(service) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{service}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complexity Selection */}
          {config.services.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">3. Select Complexity Level</h3>
              <div className="space-y-3">
                {Object.entries(complexityLevels).map(([key, level]) => (
                  <button
                    key={key}
                    onClick={() => handleComplexityChange(key as 'basic' | 'intermediate' | 'advanced' | 'enterprise')}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      config.complexity === key
                        ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{level.name}</div>
                      <div className="text-sm opacity-80">{level.timeline}</div>
                    </div>
                    <div className="text-sm opacity-80">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Live Estimate */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-xl border border-slate-600/50">
            <h3 className="text-xl font-semibold text-white mb-4">Estimated Investment</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                ${estimatedCost.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">
                {config.timeline && `Timeline: ${config.timeline}`}
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          {config.category && (
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Your Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Category</div>
                  <div className="text-cyan-400 font-medium">{config.category}</div>
                </div>

                {config.services.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Selected Services</div>
                    <div className="space-y-1">
                      {config.services.map((service, index) => (
                        <div key={index} className="text-sm text-slate-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-slate-400 mb-1">Complexity</div>
                  <div className="text-orange-400 font-medium">{complexityLevels[config.complexity].name}</div>
                </div>

                {config.features.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Included Features</div>
                    <div className="space-y-1">
                      {config.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="text-xs text-slate-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          {feature}
                        </div>
                      ))}
                      {config.features.length > 4 && (
                        <div className="text-xs text-slate-400">
                          +{config.features.length - 4} more features
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Proposal Button */}
          {estimatedCost > 0 && (
            <button
              onClick={generateProposal}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Generate Detailed Proposal
            </button>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Project Proposal</h3>
              <button
                onClick={() => setShowResults(false)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-400/20 to-purple-500/20 p-6 rounded-xl border border-cyan-400/30">
                <h4 className="text-xl font-bold text-white mb-2">Investment Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Total Investment</div>
                    <div className="text-2xl font-bold text-cyan-400">${estimatedCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Estimated Timeline</div>
                    <div className="text-lg font-semibold text-white">{config.timeline}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Project Scope</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <span className="text-cyan-400 font-medium">Category:</span>
                      <span className="text-slate-300 ml-2">{config.category}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-medium">Services:</span>
                      <div className="mt-1 ml-2">
                        {config.services.map((service, index) => (
                          <div key={index} className="text-slate-300 text-sm">• {service}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-medium">Complexity:</span>
                      <span className="text-slate-300 ml-2">{complexityLevels[config.complexity].name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">What&apos;s Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 py-3 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-500 transition-colors"
                >
                  Modify Configuration
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300">
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}