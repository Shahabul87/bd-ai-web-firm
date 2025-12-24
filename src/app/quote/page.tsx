'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import validator from 'validator';
import Link from 'next/link';
import { PageBackground } from '../components/PageBackground';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Types
interface ProjectDetails {
  services: string[];
  projectType: string;
  complexity: 'mvp' | 'standard' | 'advanced' | 'enterprise';
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
  specialRequirements: string;
  agreedToTerms: boolean;
}

const initialFormData: QuoteFormData = {
  currentStep: 1,
  projectDetails: {
    services: [],
    projectType: '',
    complexity: 'mvp',
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
  specialRequirements: '',
  agreedToTerms: false,
};

export default function QuotePage() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = useMemo(() => [
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Full-stack web apps with React, Next.js, and modern APIs',
      icon: '🌐',
      gradient: 'from-emerald-400 to-cyan-500',
      bgGlow: 'emerald',
      deliverables: ['React/Next.js Apps', 'API Development', 'Database Design', 'Cloud Deployment'],
      timeline: '2-6 weeks',
      perfectFor: 'SaaS platforms, dashboards, e-commerce',
    },
    {
      id: 'android-development',
      name: 'Android Development',
      description: 'Native Android apps with Kotlin and Jetpack Compose',
      icon: '📱',
      gradient: 'from-cyan-400 to-violet-500',
      bgGlow: 'cyan',
      deliverables: ['Native Kotlin Apps', 'Material Design 3', 'Play Store Ready', 'Firebase Backend'],
      timeline: '4-8 weeks',
      perfectFor: 'Consumer apps, B2B mobile tools',
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis',
      description: 'Transform raw data into actionable business insights',
      icon: '📊',
      gradient: 'from-violet-400 to-amber-500',
      bgGlow: 'violet',
      deliverables: ['Pattern Recognition', 'Predictive Models', 'Automated Reports', 'Data Pipelines'],
      timeline: '1-4 weeks',
      perfectFor: 'Business intelligence, market research',
    },
    {
      id: 'data-visualization',
      name: 'Data Visualization',
      description: 'Beautiful interactive dashboards and reports',
      icon: '📈',
      gradient: 'from-amber-400 to-emerald-500',
      bgGlow: 'amber',
      deliverables: ['Custom Dashboards', 'Real-time Charts', 'Interactive Reports', 'Export Features'],
      timeline: '1-3 weeks',
      perfectFor: 'Executive dashboards, analytics portals',
    }
  ], []);

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
        break;
      case 2:
        if (!formData.projectDetails.description || formData.projectDetails.description.length < 20) {
          newErrors.description = 'Please describe your project (minimum 20 characters)';
        }
        break;
      case 3:
        if (!formData.projectDetails.budget) {
          newErrors.budget = 'Please select your investment level';
        }
        break;
      case 4:
        if (!formData.companyInfo.contactName || formData.companyInfo.contactName.length < 2) {
          newErrors.contactName = 'Your name is required';
        }
        if (!formData.companyInfo.email || !validator.isEmail(formData.companyInfo.email)) {
          newErrors.email = 'Valid email is required';
        }
        break;
      case 5:
        if (!formData.agreedToTerms) {
          newErrors.terms = 'Please agree to the terms';
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
        currentStep: Math.min(prev.currentStep + 1, 5),
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
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDetails: formData.projectDetails,
          companyInfo: formData.companyInfo,
          specialRequirements: formData.specialRequirements,
          agreedToTerms: formData.agreedToTerms,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Quote request submitted! We will contact you within 24 hours.');
        setFormData(initialFormData);
      } else {
        if (result.errors) {
          setErrors(result.errors);
          setFormData(prev => ({ ...prev, currentStep: 1 }));
        } else {
          alert('Error: ' + (result.message || 'Something went wrong. Please try again.'));
        }
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const stepTitles = ['Select Services', 'Project Details', 'Investment', 'Contact Info', 'Review'];

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />

        <main className="pt-20">
          {/* Hero Section */}
          <section
            className="relative py-20 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)'
            }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Hero Content */}
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-sm text-emerald-300">Free Quote in 24 Hours</span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
                      <span className="text-white/90">Get Your Project</span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                        Built by AI Agents
                      </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-lg">
                      Tell us what you need. Our AI agents will analyze your requirements and deliver a
                      <span className="text-emerald-400"> custom quote within 24 hours</span>.
                    </p>
                  </div>

                  {/* Value Props */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: '⚡', value: '10x', label: 'Faster Delivery' },
                      { icon: '💰', value: '80%', label: 'Cost Savings' },
                      { icon: '🤖', value: '24/7', label: 'AI Working' },
                      { icon: '✨', value: '100%', label: 'Satisfaction' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                      >
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                          <div className="text-lg font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-slate-500">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social Proof */}
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-2">
                      {['🧑‍💻', '👩‍💼', '👨‍🔬', '👩‍🎨'].map((emoji, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-sm">
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="text-white font-medium">50+ founders</span>
                      <span className="text-slate-500"> trust us with their projects</span>
                    </div>
                  </div>
                </motion.div>

                {/* Right: Quick Stats */}
                <motion.div
                  className="hidden lg:block"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative">
                    {/* Main Card */}
                    <div className="bg-[#0d1117] rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                      <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🚀</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Why Startups Choose Us</h3>
                        <p className="text-slate-400 text-sm">We&apos;re founders too. We get it.</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: 'No upfront payment required', check: true },
                          { label: 'Milestone-based billing', check: true },
                          { label: 'Equity-friendly arrangements', check: true },
                          { label: 'Cancel anytime policy', check: true },
                          { label: 'Source code ownership', check: true },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <span className="text-slate-300">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">💬</div>
                          <div>
                            <div className="text-sm font-medium text-white">&quot;Shipped our MVP in 3 weeks&quot;</div>
                            <div className="text-xs text-slate-500">- Sarah K., Fintech Founder</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -top-4 -right-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg">
                      <span className="text-sm font-bold text-white">Startup Friendly</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Quote Form Section */}
          <section className="py-16 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Step Indicators */}
              <div className="mb-12">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  {stepTitles.map((title, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          formData.currentStep > i + 1
                            ? 'bg-emerald-500 text-white'
                            : formData.currentStep === i + 1
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {formData.currentStep > i + 1 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`mt-2 text-xs hidden sm:block ${
                        formData.currentStep === i + 1 ? 'text-emerald-400 font-medium' : 'text-slate-500'
                      }`}>
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress Line */}
                <div className="mt-4 max-w-3xl mx-auto">
                  <div className="h-1 bg-slate-800 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${((formData.currentStep - 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-[#0d1117] rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={formData.currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {formData.currentStep === 1 && (
                          <Step1Services
                            formData={formData}
                            services={services}
                            handleServiceToggle={handleServiceToggle}
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 2 && (
                          <Step2Details
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 3 && (
                          <Step3Investment
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 4 && (
                          <Step4Contact
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                          />
                        )}
                        {formData.currentStep === 5 && (
                          <Step5Review
                            formData={formData}
                            setFormData={setFormData}
                            services={services}
                            errors={errors}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-10 pt-8 border-t border-slate-700/50">
                      {formData.currentStep > 1 ? (
                        <button
                          onClick={prevStep}
                          className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {formData.currentStep < 5 ? (
                        <button
                          onClick={nextStep}
                          className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
                        >
                          Continue
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Get My Free Quote
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust Bar */}
                <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Secure & Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span>Response within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    <span>No spam, ever</span>
                  </div>
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

// Step Components
interface StepProps {
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  errors: Record<string, string>;
}

interface Step1Props {
  formData: QuoteFormData;
  services: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    gradient: string;
    bgGlow: string;
    deliverables: string[];
    timeline: string;
    perfectFor: string;
  }>;
  handleServiceToggle: (serviceId: string) => void;
  errors: Record<string, string>;
}

function Step1Services({ formData, services, handleServiceToggle, errors }: Step1Props) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">What do you need built?</h2>
        <p className="text-slate-400">Select all the services that apply to your project</p>
      </div>

      {errors.services && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
          {errors.services}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const isSelected = formData.projectDetails.services.includes(service.id);
          return (
            <div
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
              }`}
            >
              {/* Selection Indicator */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{service.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.deliverables.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800/50 text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Timeline: {service.timeline}</span>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${service.gradient} font-medium`}>
                      {isSelected ? 'Selected' : 'Click to select'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step2Details({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Tell us about your project</h2>
        <p className="text-slate-400">The more details you share, the better quote we can provide</p>
      </div>

      <div className="space-y-6">
        {/* Project Scale */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Project Scale
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'mvp', label: 'MVP', desc: 'Quick validation', icon: '🌱' },
              { value: 'standard', label: 'Standard', desc: 'Full features', icon: '🚀' },
              { value: 'advanced', label: 'Advanced', desc: 'Complex logic', icon: '⚡' },
              { value: 'enterprise', label: 'Enterprise', desc: 'Mission-critical', icon: '🏢' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData((prev) => ({
                  ...prev,
                  projectDetails: { ...prev.projectDetails, complexity: option.value as 'mvp' | 'standard' | 'advanced' | 'enterprise' }
                }))}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                  formData.projectDetails.complexity === option.value
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700/50 hover:border-slate-600/50 text-slate-400'
                }`}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Project Description *
          </label>
          <textarea
            value={formData.projectDetails.description}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, description: e.target.value }
            }))}
            placeholder="Describe your project goals, target users, and key features you need..."
            rows={4}
            className={`w-full px-4 py-3 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all ${
              errors.description ? 'border-red-500/50' : 'border-slate-700/50'
            }`}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Special Requirements (Optional)
          </label>
          <textarea
            value={formData.projectDetails.requirements}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, requirements: e.target.value }
            }))}
            placeholder="Any technical requirements, integrations, or specific technologies you need..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
          />
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Preferred Timeline
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'urgent', label: 'ASAP', desc: '2-4 weeks', badge: 'Priority' },
              { value: 'standard', label: 'Standard', desc: '4-8 weeks', badge: 'Recommended' },
              { value: 'flexible', label: 'Flexible', desc: '8+ weeks', badge: 'Best Value' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData((prev) => ({
                  ...prev,
                  projectDetails: { ...prev.projectDetails, timeline: option.value as 'urgent' | 'standard' | 'flexible' }
                }))}
                className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                  formData.projectDetails.timeline === option.value
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-700/50 hover:border-slate-600/50 text-slate-400'
                }`}
              >
                {formData.projectDetails.timeline === option.value && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500 rounded-full text-[10px] font-bold text-white">
                    {option.badge}
                  </div>
                )}
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Investment({ formData, setFormData, errors }: StepProps) {
  const budgetOptions = [
    {
      value: 'bootstrap',
      label: 'Bootstrap',
      range: '$2K - $8K',
      desc: 'Perfect for MVPs and validation',
      icon: '🌱',
      features: ['Core features only', '2-4 week delivery', 'Essential support'],
      popular: false
    },
    {
      value: 'seed',
      label: 'Seed Stage',
      range: '$8K - $25K',
      desc: 'Full-featured product launch',
      icon: '🚀',
      features: ['Complete feature set', 'Premium design', '60-day support'],
      popular: true
    },
    {
      value: 'growth',
      label: 'Growth',
      range: '$25K - $75K',
      desc: 'Scalable enterprise solution',
      icon: '📈',
      features: ['Advanced features', 'Custom integrations', '90-day support'],
      popular: false
    },
    {
      value: 'enterprise',
      label: 'Enterprise',
      range: '$75K+',
      desc: 'Mission-critical systems',
      icon: '🏢',
      features: ['Full customization', 'Dedicated team', 'Ongoing partnership'],
      popular: false
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">What&apos;s your investment level?</h2>
        <p className="text-slate-400">We work with startups at every stage. Pick what fits your budget.</p>
      </div>

      {errors.budget && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
          {errors.budget}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, budget: option.value }
            }))}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
              formData.projectDetails.budget === option.value
                ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                : 'border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            {option.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-xs font-bold text-white">
                Most Popular
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">{option.label}</h3>
                  <span className="text-emerald-400 font-bold">{option.range}</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{option.desc}</p>
                <div className="space-y-1">
                  {option.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 bg-slate-600 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
        <div className="flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Not sure about budget?</h4>
            <p className="text-xs text-slate-400">
              No worries! We&apos;ll provide a detailed quote based on your requirements.
              We also offer flexible payment plans and equity arrangements for early-stage startups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Contact({ formData, setFormData, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">How can we reach you?</h2>
        <p className="text-slate-400">We&apos;ll send your personalized quote to this email</p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        {/* Name */}
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
            placeholder="John Smith"
            className={`w-full px-4 py-3 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
              errors.contactName ? 'border-red-500/50' : 'border-slate-700/50'
            }`}
          />
          {errors.contactName && (
            <p className="mt-2 text-sm text-red-400">{errors.contactName}</p>
          )}
        </div>

        {/* Email */}
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
            placeholder="john@company.com"
            className={`w-full px-4 py-3 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
              errors.email ? 'border-red-500/50' : 'border-slate-700/50'
            }`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Company (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Company Name <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.companyInfo.companyName}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, companyName: e.target.value }
            }))}
            placeholder="Acme Inc."
            className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {/* Phone (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Phone Number <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="tel"
            value={formData.companyInfo.phone}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, phone: e.target.value }
            }))}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

interface Step5Props extends StepProps {
  services: Array<{
    id: string;
    name: string;
    icon: string;
    gradient: string;
  }>;
}

function Step5Review({ formData, setFormData, services, errors }: Step5Props) {
  const selectedServices = formData.projectDetails.services.map((id) =>
    services.find((s) => s.id === id)
  ).filter(Boolean);

  const getBudgetLabel = (value: string) => {
    const labels: Record<string, string> = {
      bootstrap: 'Bootstrap ($2K - $8K)',
      seed: 'Seed Stage ($8K - $25K)',
      growth: 'Growth ($25K - $75K)',
      enterprise: 'Enterprise ($75K+)'
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Review Your Quote Request</h2>
        <p className="text-slate-400">Make sure everything looks good before submitting</p>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Services</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedServices.map((service) => (
                  <span key={service?.id} className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-full text-sm">
                    <span>{service?.icon}</span>
                    <span className="text-white">{service?.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Project Scale</span>
              <span className="text-white capitalize">{formData.projectDetails.complexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timeline</span>
              <span className="text-white capitalize">{formData.projectDetails.timeline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Investment Level</span>
              <span className="text-emerald-400 font-medium">{getBudgetLabel(formData.projectDetails.budget)}</span>
            </div>
            <div className="border-t border-slate-700/50 pt-4">
              <span className="text-slate-400 block mb-2">Contact</span>
              <div className="text-white">{formData.companyInfo.contactName}</div>
              <div className="text-slate-400 text-sm">{formData.companyInfo.email}</div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              agreedToTerms: e.target.checked
            }))}
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300">
            I agree to the{' '}
            <Link href="/terms" className="text-emerald-400 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>.
            This is a quote request, not a binding contract.
          </span>
        </label>
        {errors.terms && (
          <p className="text-sm text-red-400">{errors.terms}</p>
        )}

        {/* What Happens Next */}
        <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span> What happens next?
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">1</div>
              <span>Our AI analyzes your requirements (instant)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">2</div>
              <span>You receive a detailed quote (within 24 hours)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">3</div>
              <span>Free consultation call (optional)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
