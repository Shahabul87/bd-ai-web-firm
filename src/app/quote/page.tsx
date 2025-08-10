'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import validator from 'validator';
import { PageBackground } from '../components/PageBackground';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Types for form data
interface ProjectDetails {
  services: string[];
  projectType: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  description: string;
  requirements: string;
  timeline: 'urgent' | 'standard' | 'flexible';
  budget: string;
}

interface CompanyInfo {
  companyName: string;
  industry: string;
  companySize: string;
  contactName: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'both';
}

interface QuoteFormData {
  currentStep: number;
  projectDetails: ProjectDetails;
  companyInfo: CompanyInfo;
  additionalFiles: File[];
  specialRequirements: string;
  agreedToTerms: boolean;
}

const initialFormData: QuoteFormData = {
  currentStep: 1,
  projectDetails: {
    services: [],
    projectType: '',
    complexity: 'basic',
    description: '',
    requirements: '',
    timeline: 'standard',
    budget: '',
  },
  companyInfo: {
    companyName: '',
    industry: '',
    companySize: '',
    contactName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
  },
  additionalFiles: [],
  specialRequirements: '',
  agreedToTerms: false,
};

export default function QuotePage() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState({ min: 0, max: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = useMemo(() => [
    {
      id: 'ai-model-development',
      name: 'AI Model Development',
      description: 'Custom machine learning models, training, and deployment',
      icon: '🧠',
      priceCategory: 'premium',
      valueProps: ['Custom AI Solutions', 'Production-Ready Models', 'Ongoing Support'],
    },
    {
      id: 'data-pipelines',
      name: 'Data Processing Pipelines',
      description: 'ETL workflows, real-time data processing, and automation',
      icon: '🔄',
      priceCategory: 'standard',
      valueProps: ['Automated Workflows', 'Real-time Processing', 'Scalable Architecture'],
    },
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Modern websites, web apps, and autonomous coding solutions',
      icon: '🌐',
      priceCategory: 'affordable',
      valueProps: ['Rapid Development', 'Modern Stack', 'Responsive Design'],
    },
    {
      id: 'fintech-analysis',
      name: 'FinTech Solutions',
      description: 'Financial data analysis, risk assessment, and trading insights',
      icon: '💹',
      priceCategory: 'premium',
      valueProps: ['Compliance Ready', 'Advanced Analytics', 'Risk Management'],
    },
    {
      id: 'healthcare-analytics',
      name: 'Healthcare Analytics',
      description: 'Medical data analysis, patient insights, and diagnostic support',
      icon: '🏥',
      priceCategory: 'enterprise',
      valueProps: ['HIPAA Compliant', 'Clinical Grade', 'Regulatory Support'],
    },
    {
      id: 'automation',
      name: 'Business Automation',
      description: 'Workflow automation, process optimization, and AI integration',
      icon: '⚡',
      priceCategory: 'standard',
      valueProps: ['Process Optimization', 'Cost Reduction', 'Efficiency Gains'],
    }
  ], []);

  // Calculate project scope and complexity indicators
  useEffect(() => {
    if (!mounted) return;
    
    const calculateProjectScope = () => {
      const { services: selectedServices, complexity } = formData.projectDetails;
      
      if (selectedServices.length === 0) {
        setEstimatedCost({ min: 0, max: 0 });
        return;
      }
      
      // Calculate project scope based on service categories and complexity
      let scopePoints = 0;
      
      selectedServices.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          switch (service.priceCategory) {
            case 'affordable': scopePoints += 1; break;
            case 'standard': scopePoints += 2; break;
            case 'premium': scopePoints += 3; break;
            case 'enterprise': scopePoints += 4; break;
          }
        }
      });
      
      // Complexity multiplier
      const complexityMultipliers = {
        basic: 1,
        intermediate: 1.3,
        advanced: 1.8,
        enterprise: 2.5,
      };
      
      scopePoints *= complexityMultipliers[complexity];
      
      // Convert scope points to startup-style indicators
      if (scopePoints <= 3) {
        setEstimatedCost({ min: 1, max: 1 }); // "Startup Friendly"
      } else if (scopePoints <= 6) {
        setEstimatedCost({ min: 2, max: 2 }); // "Growth Ready"
      } else if (scopePoints <= 10) {
        setEstimatedCost({ min: 3, max: 3 }); // "Scale-Up"
      } else {
        setEstimatedCost({ min: 4, max: 4 }); // "Enterprise"
      }
    };
    
    calculateProjectScope();
  }, [formData.projectDetails, mounted, services]);

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      projectDetails: {
        ...prev.projectDetails,
        services: prev.projectDetails.services.includes(serviceId)
          ? prev.projectDetails.services.filter(s => s !== serviceId)
          : [...prev.projectDetails.services, serviceId],
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (formData.projectDetails.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        if (!formData.projectDetails.projectType) {
          newErrors.projectType = 'Please specify your project type';
        }
        break;

      case 2:
        if (!formData.projectDetails.description || formData.projectDetails.description.length < 20) {
          newErrors.description = 'Please provide a detailed project description (minimum 20 characters)';
        }
        if (!formData.projectDetails.requirements || formData.projectDetails.requirements.length < 10) {
          newErrors.requirements = 'Please describe your technical requirements';
        }
        break;

      case 3:
        if (!formData.projectDetails.budget) {
          newErrors.budget = 'Please select a budget range';
        }
        break;

      case 4:
        if (!formData.companyInfo.companyName || formData.companyInfo.companyName.length < 2) {
          newErrors.companyName = 'Company name is required';
        }
        if (!formData.companyInfo.contactName || formData.companyInfo.contactName.length < 2) {
          newErrors.contactName = 'Contact name is required';
        }
        if (!formData.companyInfo.email || !validator.isEmail(formData.companyInfo.email)) {
          newErrors.email = 'Valid email address is required';
        }
        if (!formData.companyInfo.industry) {
          newErrors.industry = 'Please select your industry';
        }
        if (!formData.companyInfo.companySize) {
          newErrors.companySize = 'Please select your company size';
        }
        break;

      case 6:
        if (!formData.agreedToTerms) {
          newErrors.terms = 'Please agree to the terms and conditions';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(formData.currentStep)) {
      setFormData(prev => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 6),
      }));
    }
  };

  const prevStep = () => {
    setFormData(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // In a real implementation, this would redirect to a thank you page
      alert('Quote request submitted successfully! We\'ll contact you within 24 hours.');
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">AI Solution</span> Quote
                </motion.h1>
                <motion.p 
                  className="text-xl text-slate-400 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Tell us about your project and get a detailed estimate for enterprise-grade AI development, 
                  data processing, and web solutions. Our autonomous coding platform delivers results fast.
                </motion.p>
                
                {/* Trust Indicators */}
                <motion.div 
                  className="flex flex-wrap justify-center gap-8 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm font-medium">24-Hour Response</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm font-medium">No Obligation</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm font-medium">Enterprise Security</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Quote Form Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Form Steps */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-900/90 rounded-3xl border border-slate-700/50 p-8 backdrop-blur-sm neural-glow">
                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-300">Step {formData.currentStep} of 6</span>
                        <span className="text-cyan-400 font-medium">{Math.round((formData.currentStep / 6) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(formData.currentStep / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={formData.currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {formData.currentStep === 1 && (
                          <QuoteStep1 
                            formData={formData} 
                            setFormData={setFormData} 
                            services={services}
                            handleServiceToggle={handleServiceToggle}
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 2 && (
                          <QuoteStep2 
                            formData={formData} 
                            setFormData={setFormData} 
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 3 && (
                          <QuoteStep3 
                            formData={formData} 
                            setFormData={setFormData} 
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 4 && (
                          <QuoteStep4 
                            formData={formData} 
                            setFormData={setFormData} 
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 5 && (
                          <QuoteStep5 
                            formData={formData} 
                            setFormData={setFormData} 
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 6 && (
                          <QuoteStep6 
                            formData={formData} 
                            setFormData={setFormData} 
                            errors={errors}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-8 border-t border-slate-700/50">
                      {formData.currentStep > 1 ? (
                        <button
                          onClick={prevStep}
                          className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-300"
                        >
                          Previous
                        </button>
                      ) : (
                        <div />
                      )}

                      {formData.currentStep < 6 ? (
                        <button
                          onClick={nextStep}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          Next Step
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cost Estimation Panel */}
                <div className="space-y-6">
                  <CostEstimationPanel estimatedCost={estimatedCost} formData={formData} services={services} />
                  <TrustSignalsPanel />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageBackground>
  );
}

// Step Component Props Types
interface StepProps {
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  errors: Record<string, string>;
}

interface Step1Props extends StepProps {
  services: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    priceCategory: string;
    valueProps: string[];
  }>;
  handleServiceToggle: (serviceId: string) => void;
}

// Step Components
function QuoteStep1({ formData, setFormData, services, handleServiceToggle, errors }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Services</h2>
        <p className="text-slate-400">Choose the AI and development services you need for your project.</p>
      </div>

      {errors.services && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {errors.services}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceToggle(service.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              formData.projectDetails.services.includes(service.id)
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{service.icon}</div>
              <div>
                <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{service.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {service.valueProps.map((prop, idx) => (
                    <span key={idx} className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded">
                      {prop}
                    </span>
                  ))}
                </div>
                <div className={`text-xs font-medium ${
                  service.priceCategory === 'affordable' ? 'text-green-400' :
                  service.priceCategory === 'standard' ? 'text-cyan-400' :
                  service.priceCategory === 'premium' ? 'text-purple-400' :
                  'text-orange-400'
                }`}>
                  {service.priceCategory === 'affordable' ? '💰 Startup Friendly' :
                   service.priceCategory === 'standard' ? '🚀 Growth Ready' :
                   service.priceCategory === 'premium' ? '⭐ Premium Solution' :
                   '🏢 Enterprise Grade'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project Type *
        </label>
        <input
          type="text"
          value={formData.projectDetails.projectType}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            projectDetails: { ...prev.projectDetails, projectType: e.target.value }
          }))}
          placeholder="e.g., E-commerce platform, Predictive analytics dashboard, Customer service chatbot"
          className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${
            errors.projectType ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {errors.projectType && (
          <p className="mt-2 text-sm text-red-400">{errors.projectType}</p>
        )}
      </div>
    </div>
  );
}

function QuoteStep2({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Details</h2>
        <p className="text-slate-400">Tell us more about your project requirements and complexity.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project Complexity *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'basic', label: 'Basic', desc: 'Simple implementation' },
            { value: 'intermediate', label: 'Intermediate', desc: 'Moderate complexity' },
            { value: 'advanced', label: 'Advanced', desc: 'Complex solution' },
            { value: 'enterprise', label: 'Enterprise', desc: 'Mission-critical' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData((prev) => ({
                ...prev,
                projectDetails: { ...prev.projectDetails, complexity: option.value }
              }))}
              className={`p-3 text-center rounded-lg border-2 transition-all duration-300 ${
                formData.projectDetails.complexity === option.value
                  ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                  : 'border-slate-600 hover:border-slate-500 text-slate-400'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Detailed Project Description *
        </label>
        <textarea
          value={formData.projectDetails.description}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            projectDetails: { ...prev.projectDetails, description: e.target.value }
          }))}
          placeholder="Describe your project goals, target users, key features, and expected outcomes..."
          rows={4}
          className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all duration-300 ${
            errors.description ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Technical Requirements *
        </label>
        <textarea
          value={formData.projectDetails.requirements}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            projectDetails: { ...prev.projectDetails, requirements: e.target.value }
          }))}
          placeholder="Specific technical requirements, integrations, platforms, data sources, performance needs..."
          rows={3}
          className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all duration-300 ${
            errors.requirements ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {errors.requirements && (
          <p className="mt-2 text-sm text-red-400">{errors.requirements}</p>
        )}
      </div>
    </div>
  );
}

function QuoteStep3({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Timeline & Budget</h2>
        <p className="text-slate-400">Help us understand your timeline and budget constraints.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project Timeline *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'urgent', label: 'Urgent', desc: '2-4 weeks', multiplier: '+80%' },
            { value: 'standard', label: 'Standard', desc: '6-8 weeks', multiplier: 'Base price' },
            { value: 'flexible', label: 'Flexible', desc: '10-12 weeks', multiplier: '-20%' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData((prev) => ({
                ...prev,
                projectDetails: { ...prev.projectDetails, timeline: option.value }
              }))}
              className={`p-4 text-center rounded-lg border-2 transition-all duration-300 ${
                formData.projectDetails.timeline === option.value
                  ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                  : 'border-slate-600 hover:border-slate-500 text-slate-400'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm mt-1">{option.desc}</div>
              <div className="text-xs mt-1">{option.multiplier}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Investment Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { 
              value: 'bootstrap', 
              label: 'Bootstrap Budget', 
              desc: 'MVP development, essential features only',
              icon: '🌱'
            },
            { 
              value: 'seed', 
              label: 'Seed Funding Ready', 
              desc: 'Full-featured product, market-ready',
              icon: '🚀'
            },
            { 
              value: 'series-a', 
              label: 'Growth Investment', 
              desc: 'Advanced features, scalable architecture',
              icon: '📈'
            },
            { 
              value: 'enterprise', 
              label: 'Enterprise Scale', 
              desc: 'Enterprise-grade, compliance, custom integrations',
              icon: '🏢'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData((prev) => ({
                ...prev,
                projectDetails: { ...prev.projectDetails, budget: option.value }
              }))}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                formData.projectDetails.budget === option.value
                  ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                  : 'border-slate-600 hover:border-slate-500 text-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs mt-1 opacity-80">{option.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.budget && (
          <p className="mt-2 text-sm text-red-400">{errors.budget}</p>
        )}
        
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400">
            💡 <strong>Flexible Pricing:</strong> We work with startups at every stage. 
            Our pricing is tailored to your current funding situation and growth plans.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuoteStep4({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
        <p className="text-slate-400">Tell us about your organization so we can tailor our approach.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyInfo.companyName}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, companyName: e.target.value }
            }))}
            className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${
              errors.companyName ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Your company name"
          />
          {errors.companyName && (
            <p className="mt-2 text-sm text-red-400">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Industry *
          </label>
          <select
            value={formData.companyInfo.industry}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, industry: e.target.value }
            }))}
            className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${
              errors.industry ? 'border-red-500' : 'border-slate-600'
            }`}
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance & Banking</option>
            <option value="healthcare">Healthcare</option>
            <option value="retail">Retail & E-commerce</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="education">Education</option>
            <option value="media">Media & Entertainment</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.industry && (
            <p className="mt-2 text-sm text-red-400">{errors.industry}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Company Size *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'startup', label: 'Startup', desc: '1-10 employees' },
            { value: 'small', label: 'Small', desc: '11-50 employees' },
            { value: 'medium', label: 'Medium', desc: '51-200 employees' },
            { value: 'large', label: 'Enterprise', desc: '200+ employees' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData((prev) => ({
                ...prev,
                companyInfo: { ...prev.companyInfo, companySize: option.value }
              }))}
              className={`p-3 text-center rounded-lg border-2 transition-all duration-300 ${
                formData.companyInfo.companySize === option.value
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-slate-600 hover:border-slate-500 text-slate-400'
              }`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
        {errors.companySize && (
          <p className="mt-2 text-sm text-red-400">{errors.companySize}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={formData.companyInfo.contactName}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, contactName: e.target.value }
            }))}
            className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${
              errors.contactName ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Full name"
          />
          {errors.contactName && (
            <p className="mt-2 text-sm text-red-400">{errors.contactName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.companyInfo.email}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, email: e.target.value }
            }))}
            className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${
              errors.email ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="your.email@company.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.companyInfo.phone}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, phone: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Preferred Contact Method
          </label>
          <select
            value={formData.companyInfo.preferredContact}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, preferredContact: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function QuoteStep5({ formData, setFormData }: Omit<StepProps, 'errors'>) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Additional Requirements</h2>
        <p className="text-slate-400">Any additional information that would help us provide an accurate quote.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Special Requirements or Notes
        </label>
        <textarea
          value={formData.specialRequirements}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            specialRequirements: e.target.value
          }))}
          placeholder="Compliance requirements, integration specifics, performance targets, security needs, etc."
          rows={4}
          className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project Documents (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors duration-300">
          <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-slate-400 mb-2">Upload project documents, mockups, or reference materials</p>
          <p className="text-sm text-slate-500">PDF, DOC, PNG, JPG (Max 10MB each)</p>
          <button className="mt-3 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-300">
            Choose Files
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteStep6({ formData, setFormData, errors }: StepProps) {
  const selectedServices = formData.projectDetails.services.map((serviceId: string) => 
    serviceId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-slate-400">Please review your quote request before submitting.</p>
      </div>

      {/* Quote Summary */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Quote Summary</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Company:</span>
            <span className="text-white">{formData.companyInfo.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Services:</span>
            <span className="text-white">{selectedServices.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Project Type:</span>
            <span className="text-white">{formData.projectDetails.projectType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Complexity:</span>
            <span className="text-white capitalize">{formData.projectDetails.complexity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Timeline:</span>
            <span className="text-white capitalize">{formData.projectDetails.timeline}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Investment Level:</span>
            <span className="text-white capitalize">{formData.projectDetails.budget?.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              agreedToTerms: e.target.checked
            }))}
            className="mt-1 w-4 h-4 text-cyan-400 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
          />
          <span className="text-sm text-slate-300">
            I agree to the{' '}
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
            . I understand this is a quote request and not a binding contract.
          </span>
        </label>
        {errors.terms && (
          <p className="text-sm text-red-400">{errors.terms}</p>
        )}
      </div>

      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-sm text-cyan-300">
          <strong>Next Steps:</strong> After submitting your quote request, our team will review your requirements 
          and contact you within 24 hours with a detailed proposal and timeline.
        </p>
      </div>
    </div>
  );
}

interface CostEstimationPanelProps {
  estimatedCost: { min: number; max: number };
  formData: QuoteFormData;
  services: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    priceCategory: string;
    valueProps: string[];
  }>;
}

function CostEstimationPanel({ estimatedCost, formData, services }: CostEstimationPanelProps) {
  const selectedServices = formData.projectDetails.services.map((serviceId: string) => 
    services.find((s) => s.id === serviceId)
  ).filter((service): service is NonNullable<typeof service> => service !== undefined);

  const getProjectTier = (tier: number) => {
    switch (tier) {
      case 1: return { name: 'Startup Friendly', icon: '🌱', color: 'text-green-400', desc: 'Perfect for MVPs and early-stage startups' };
      case 2: return { name: 'Growth Ready', icon: '🚀', color: 'text-cyan-400', desc: 'Ideal for scaling businesses and funded startups' };
      case 3: return { name: 'Scale-Up', icon: '📈', color: 'text-purple-400', desc: 'Advanced solutions for established companies' };
      case 4: return { name: 'Enterprise', icon: '🏢', color: 'text-orange-400', desc: 'Enterprise-grade, mission-critical solutions' };
      default: return null;
    }
  };

  const projectTier = getProjectTier(estimatedCost.min);

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-700/50 p-6 backdrop-blur-sm neural-glow">
      <h3 className="text-xl font-semibold text-white mb-4">Project Assessment</h3>
      
      {projectTier ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl mb-2`}>{projectTier.icon}</div>
            <div className={`text-2xl font-bold ${projectTier.color}`}>
              {projectTier.name}
            </div>
            <p className="text-sm text-slate-400 mt-1">{projectTier.desc}</p>
          </div>
          
          {selectedServices.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Selected Services:</p>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{service.icon}</span>
                    <span className="text-slate-300 text-sm">{service.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    service.priceCategory === 'affordable' ? 'bg-green-400/20 text-green-300' :
                    service.priceCategory === 'standard' ? 'bg-cyan-400/20 text-cyan-300' :
                    service.priceCategory === 'premium' ? 'bg-purple-400/20 text-purple-300' :
                    'bg-orange-400/20 text-orange-300'
                  }`}>
                    {service.priceCategory === 'affordable' ? 'Budget' :
                     service.priceCategory === 'standard' ? 'Standard' :
                     service.priceCategory === 'premium' ? 'Premium' :
                     'Enterprise'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <h4 className="text-sm font-medium text-white mb-2">What&apos;s Included:</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>✅ Flexible payment terms based on your funding stage</p>
              <p>✅ Milestone-based delivery with regular check-ins</p>
              <p>✅ Post-launch support and maintenance options</p>
              <p>✅ Transparent pricing with no hidden fees</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-slate-400 mb-2">Select services to see your</div>
          <div className="text-xl font-bold text-slate-500">Project Assessment</div>
          <p className="text-sm text-slate-500 mt-2">We&apos;ll match you with the right solution for your stage</p>
        </div>
      )}
    </div>
  );
}

function TrustSignalsPanel() {
  return (
    <div className="space-y-6">
      {/* Guarantee */}
      <div className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="font-semibold text-green-400">Satisfaction Guarantee</h3>
        </div>
        <p className="text-sm text-slate-300">
          We guarantee your satisfaction with our work. If you&apos;re not completely happy, 
          we&apos;ll work until it&apos;s right or refund your money.
        </p>
      </div>

      {/* Response Time */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-cyan-400">Quick Response</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Quote Response:</span>
            <span className="text-white font-medium">Within 24 hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Initial Consultation:</span>
            <span className="text-white font-medium">Within 48 hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Project Kickoff:</span>
            <span className="text-white font-medium">Within 1 week</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-300">info@cognivat.com</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-slate-300">+1 (775) 250-6651</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Have questions about the quote process? We&apos;re here to help!
          </p>
        </div>
      </div>
    </div>
  );
}