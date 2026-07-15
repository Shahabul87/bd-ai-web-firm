'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import validator from 'validator';
import Link from 'next/link';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import Button from '@/app/design/ui/Button';
import Stepper from '@/app/design/ui/Stepper';
import MonoLabel from '@/app/design/ui/MonoLabel';

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

// Shared field styles (Drafting Room form tokens)
const labelStyles = 'mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-steel';
const inputStyles =
  'w-full border border-line bg-ink-900 px-4 py-3 text-sm text-bone placeholder:text-steel/50 transition-colors focus:border-signal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';

export default function QuotePage() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = useMemo(() => [
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Full-stack web apps with React, Next.js, and modern APIs',
      icon: '\u{1F310}',
      deliverables: ['React/Next.js Apps', 'API Development', 'Database Design', 'Cloud Deployment'],
      timeline: '2-6 weeks',
      perfectFor: 'SaaS platforms, dashboards, e-commerce',
    },
    {
      id: 'android-development',
      name: 'Android Development',
      description: 'Native Android apps with Kotlin and Jetpack Compose',
      icon: '\u{1F4F1}',
      deliverables: ['Native Kotlin Apps', 'Material Design 3', 'Play Store Ready', 'Firebase Backend'],
      timeline: '4-8 weeks',
      perfectFor: 'Consumer apps, B2B mobile tools',
    },
    {
      id: 'ios-development',
      name: 'iOS Development',
      description: 'Native iOS apps with Swift and SwiftUI for iPhone and iPad',
      icon: '\u{1F34F}',
      deliverables: ['Swift/SwiftUI Apps', 'App Store Ready', 'TestFlight Beta', 'CloudKit Integration'],
      timeline: '4-8 weeks',
      perfectFor: 'Consumer apps, enterprise iOS tools',
    },
    {
      id: 'product-inquiry',
      name: 'Product Inquiry',
      description: 'Explore our ready-made products or request customization',
      icon: '\u{1F4E6}',
      deliverables: ['Product Demo', 'Custom Branding', 'Feature Add-ons', 'Deployment Support'],
      timeline: '1-3 weeks',
      perfectFor: 'Quick launch with proven solutions',
    },
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
    setSubmitStatus('idle');
    setSubmitMessage('');

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
        setSubmitStatus('success');
        setSubmitMessage(
          result.message ||
            'Quote request submitted! We\'ll review your requirements and contact you within 24 hours.'
        );
        setFormData(initialFormData);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.errors) {
        setErrors(result.errors);
        setFormData(prev => ({ ...prev, currentStep: 1 }));
        setSubmitStatus('error');
        setSubmitMessage('Please fix the highlighted fields and try again.');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const stepTitles = ['Select Services', 'Project Details', 'Investment', 'Contact Info', 'Review'];

  return (
    <PageLayout>
      <PageHero
        eyebrow="Estimate"
        title="Get your project built by AI agents."
        lede="Tell us what you need. Our agents analyze the brief and a senior engineer delivers a fixed-scope quote within 24 hours."
      />

      <section className="bg-ink-950">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 md:py-24">
          {submitStatus === 'success' ? (
            <div
              role="status"
              aria-live="polite"
              className="border border-signal/40 bg-ink-900 p-8 text-center sm:p-12"
            >
              <MonoLabel className="text-signal">Submitted</MonoLabel>
              <h2 className="mt-6 font-display text-3xl font-medium text-bone sm:text-4xl">
                Quote request received.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-steel">
                {submitMessage}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                <Button variant="signal" size="lg" href="/">
                  Back to home
                </Button>
                <Button variant="ghost" size="lg" href="/portfolio">
                  View our work
                </Button>
              </div>
            </div>
          ) : (
          <>
          <Stepper steps={stepTitles} current={formData.currentStep - 1} className="mb-10 sm:mb-12" />

          {/* Form Card */}
          <div className="border border-line bg-ink-900 p-5 sm:p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={formData.currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
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

            {submitStatus === 'error' && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {submitMessage}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between border-t border-line pt-6 sm:mt-10 sm:pt-8">
              {formData.currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex min-h-[44px] items-center gap-2 px-2 font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-bone"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <div />
              )}

              {formData.currentStep < 5 ? (
                <Button variant="signal" size="lg" onClick={nextStep}>
                  Continue
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button variant="signal" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-2 border-ink-950/30 border-t-ink-950" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Get My Free Quote</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Trust Bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.15em] text-steel">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-signal" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Secure &amp; encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-signal" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span>Response within 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-signal" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span>No spam, ever</span>
            </div>
          </div>
          </>
          )}
        </div>
      </section>
    </PageLayout>
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
    deliverables: string[];
    timeline: string;
    perfectFor: string;
  }>;
  handleServiceToggle: (serviceId: string) => void;
  errors: Record<string, string>;
}

function Step1Services({ formData, services, handleServiceToggle, errors }: Step1Props) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">What do you need built?</h2>
        <p className="mt-2 text-sm text-steel sm:text-base">Select all the services that apply to your project</p>
      </div>

      {errors.services && (
        <div className="border border-amber/40 bg-amber/10 p-3 text-center text-sm text-amber sm:p-4 sm:text-base">
          {errors.services}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {services.map((service) => {
          const isSelected = formData.projectDetails.services.includes(service.id);
          return (
            <div
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`relative min-h-[120px] cursor-pointer border p-4 transition-colors duration-150 sm:p-5 md:p-6 ${
                isSelected ? 'border-signal bg-ink-800' : 'border-line hover:border-signal/50'
              }`}
            >
              {/* Selection Indicator */}
              <div
                className={`absolute right-3 top-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:right-4 sm:top-4 sm:h-6 sm:w-6 ${
                  isSelected ? 'border-signal bg-signal' : 'border-line'
                }`}
              >
                {isSelected && (
                  <svg className="h-3 w-3 text-ink-950 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>

              <div className="flex items-start gap-3 pr-6 sm:gap-4 sm:pr-8">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-line bg-ink-950 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                  {service.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-base font-bold text-bone sm:text-lg">{service.name}</h3>
                  <p className="mb-2 text-xs text-steel sm:mb-3 sm:text-sm">{service.description}</p>

                  <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
                    {service.deliverables.slice(0, 2).map((item, i) => (
                      <span
                        key={i}
                        className="border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-steel sm:px-2 sm:py-1 sm:text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <span className="text-steel">Timeline: {service.timeline}</span>
                    <span className={`font-mono uppercase tracking-[0.1em] ${isSelected ? 'text-signal' : 'text-steel'}`}>
                      {isSelected ? 'Selected' : 'Tap to select'}
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">Tell us about your project</h2>
        <p className="mt-2 text-sm text-steel sm:text-base">The more details you share, the better quote we can provide</p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Project Scale */}
        <div>
          <div id="project-scale-label" className={labelStyles}>Project Scale</div>
          <div role="group" aria-labelledby="project-scale-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { value: 'mvp', label: 'MVP', desc: 'Quick validation', icon: '\u{1F331}' },
              { value: 'standard', label: 'Standard', desc: 'Full features', icon: '\u{1F680}' },
              { value: 'advanced', label: 'Advanced', desc: 'Complex logic', icon: '⚡' },
              { value: 'enterprise', label: 'Enterprise', desc: 'Mission-critical', icon: '\u{1F3E2}' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData((prev) => ({
                  ...prev,
                  projectDetails: { ...prev.projectDetails, complexity: option.value as 'mvp' | 'standard' | 'advanced' | 'enterprise' }
                }))}
                className={`min-h-[80px] border p-3 text-center transition-colors duration-150 sm:min-h-[100px] sm:p-4 ${
                  formData.projectDetails.complexity === option.value
                    ? 'border-signal bg-ink-800 text-signal'
                    : 'border-line text-steel hover:border-signal/50'
                }`}
              >
                <div className="mb-1 text-xl sm:text-2xl">{option.icon}</div>
                <div className="text-xs font-medium sm:text-sm">{option.label}</div>
                <div className="text-[10px] opacity-70 sm:text-xs">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="project-description" className={labelStyles}>Project Description *</label>
          <textarea
            id="project-description"
            value={formData.projectDetails.description}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, description: e.target.value }
            }))}
            placeholder="Describe your project goals, target users, and key features you need..."
            rows={4}
            className={`${inputStyles} resize-none ${errors.description ? 'border-amber' : ''}`}
          />
          {errors.description && (
            <p className="mt-2 text-xs text-amber sm:text-sm">{errors.description}</p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="project-requirements" className={labelStyles}>Special Requirements (Optional)</label>
          <textarea
            id="project-requirements"
            value={formData.projectDetails.requirements}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, requirements: e.target.value }
            }))}
            placeholder="Any technical requirements, integrations, or specific technologies you need..."
            rows={3}
            className={`${inputStyles} resize-none`}
          />
        </div>

        {/* Timeline */}
        <div>
          <div id="timeline-label" className={labelStyles}>Preferred Timeline</div>
          <div role="group" aria-labelledby="timeline-label" className="grid grid-cols-3 gap-2 sm:gap-3">
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
                className={`relative min-h-[80px] border p-3 text-center transition-colors duration-150 sm:min-h-[100px] sm:p-4 ${
                  formData.projectDetails.timeline === option.value
                    ? 'border-signal bg-ink-800 text-signal'
                    : 'border-line text-steel hover:border-signal/50'
                }`}
              >
                {formData.projectDetails.timeline === option.value && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-signal px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink-950 sm:-top-2.5 sm:px-2 sm:text-[10px]">
                    {option.badge}
                  </div>
                )}
                <div className="text-xs font-medium sm:text-sm">{option.label}</div>
                <div className="mt-1 text-[10px] opacity-70 sm:text-xs">{option.desc}</div>
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
      icon: '\u{1F331}',
      features: ['Core features only', '2-4 week delivery', 'Essential support'],
      popular: false
    },
    {
      value: 'seed',
      label: 'Seed Stage',
      range: '$8K - $25K',
      desc: 'Full-featured product launch',
      icon: '\u{1F680}',
      features: ['Complete feature set', 'Premium design', '60-day support'],
      popular: true
    },
    {
      value: 'growth',
      label: 'Growth',
      range: '$25K - $75K',
      desc: 'Scalable enterprise solution',
      icon: '\u{1F4C8}',
      features: ['Advanced features', 'Custom integrations', '90-day support'],
      popular: false
    },
    {
      value: 'enterprise',
      label: 'Enterprise',
      range: '$75K+',
      desc: 'Mission-critical systems',
      icon: '\u{1F3E2}',
      features: ['Full customization', 'Dedicated team', 'Ongoing partnership'],
      popular: false
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">What&apos;s your investment level?</h2>
        <p className="mt-2 text-sm text-steel sm:text-base">We work with startups at every stage. Pick what fits your budget.</p>
      </div>

      {errors.budget && (
        <div className="border border-amber/40 bg-amber/10 p-3 text-center text-sm text-amber sm:p-4 sm:text-base">
          {errors.budget}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {budgetOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFormData((prev) => ({
              ...prev,
              projectDetails: { ...prev.projectDetails, budget: option.value }
            }))}
            className={`relative border p-4 text-left transition-colors duration-150 sm:p-5 md:p-6 ${
              formData.projectDetails.budget === option.value ? 'border-signal bg-ink-800' : 'border-line hover:border-signal/50'
            }`}
          >
            {option.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-signal px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-950 sm:-top-3 sm:px-3 sm:py-1">
                Most Popular
              </div>
            )}

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 text-2xl sm:text-3xl">{option.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <h3 className="text-base font-bold text-bone sm:text-lg">{option.label}</h3>
                  <span className="font-mono text-sm font-bold text-signal sm:text-base">{option.range}</span>
                </div>
                <p className="mb-2 text-xs text-steel sm:mb-3 sm:text-sm">{option.desc}</p>
                <div className="space-y-1">
                  {option.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-steel sm:gap-2 sm:text-xs">
                      <div className="h-1 w-1 flex-shrink-0 rounded-full bg-line" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="border border-line bg-ink-800/50 p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 text-lg sm:text-xl">{'\u{1F4A1}'}</div>
          <div>
            <h4 className="mb-1 text-xs font-medium text-bone sm:text-sm">Not sure about budget?</h4>
            <p className="text-[10px] text-steel sm:text-xs">
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">How can we reach you?</h2>
        <p className="mt-2 text-sm text-steel sm:text-base">We&apos;ll send your personalized quote to this email</p>
      </div>

      <div className="mx-auto max-w-lg space-y-5 sm:space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="contact-name" className={labelStyles}>Your Name *</label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={formData.companyInfo.contactName}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, contactName: e.target.value }
            }))}
            placeholder="John Smith"
            className={`${inputStyles} min-h-[44px] ${errors.contactName ? 'border-amber' : ''}`}
          />
          {errors.contactName && (
            <p className="mt-2 text-xs text-amber sm:text-sm">{errors.contactName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contact-email" className={labelStyles}>Email Address *</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={formData.companyInfo.email}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, email: e.target.value }
            }))}
            placeholder="john@company.com"
            className={`${inputStyles} min-h-[44px] ${errors.email ? 'border-amber' : ''}`}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-amber sm:text-sm">{errors.email}</p>
          )}
        </div>

        {/* Company (Optional) */}
        <div>
          <label htmlFor="company-name" className={labelStyles}>
            Company Name <span className="normal-case tracking-normal text-steel/70">(Optional)</span>
          </label>
          <input
            id="company-name"
            type="text"
            autoComplete="organization"
            value={formData.companyInfo.companyName}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, companyName: e.target.value }
            }))}
            placeholder="Acme Inc."
            className={`${inputStyles} min-h-[44px]`}
          />
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="contact-phone" className={labelStyles}>
            Phone Number <span className="normal-case tracking-normal text-steel/70">(Optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={formData.companyInfo.phone}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, phone: e.target.value }
            }))}
            placeholder="+880 1XXX-XXXXXX"
            className={`${inputStyles} min-h-[44px]`}
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-medium text-bone sm:text-3xl">Review Your Quote Request</h2>
        <p className="mt-2 text-sm text-steel sm:text-base">Make sure everything looks good before submitting</p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Summary Card */}
        <div className="border border-line bg-ink-800/50 p-4 sm:p-5 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              <span className="text-sm text-steel sm:text-base">Services</span>
              <div className="flex flex-wrap justify-start gap-1.5 sm:justify-end sm:gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service?.id}
                    className="flex items-center gap-1 border border-line px-2 py-1 text-xs text-bone sm:px-3 sm:text-sm"
                  >
                    <span>{service?.icon}</span>
                    <span>{service?.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
              <span className="text-sm text-steel sm:text-base">Project Scale</span>
              <span className="text-sm capitalize text-bone sm:text-base">{formData.projectDetails.complexity}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
              <span className="text-sm text-steel sm:text-base">Timeline</span>
              <span className="text-sm capitalize text-bone sm:text-base">{formData.projectDetails.timeline}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
              <span className="text-sm text-steel sm:text-base">Investment Level</span>
              <span className="font-mono text-sm font-medium text-signal sm:text-base">{getBudgetLabel(formData.projectDetails.budget)}</span>
            </div>
            <div className="border-t border-line pt-3 sm:pt-4">
              <span className="mb-2 block text-sm text-steel sm:text-base">Contact</span>
              <div className="text-sm text-bone sm:text-base">{formData.companyInfo.contactName}</div>
              <div className="break-all text-xs text-steel sm:text-sm">{formData.companyInfo.email}</div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2 border border-line bg-ink-800/50 p-3 sm:gap-3 sm:p-4">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              agreedToTerms: e.target.checked
            }))}
            className="mt-0.5 h-4 w-4 flex-shrink-0 border-line text-signal focus:ring-0 focus:ring-offset-0 sm:mt-1 sm:h-5 sm:w-5"
          />
          <span className="text-xs text-steel sm:text-sm">
            I agree to the{' '}
            <Link href="/terms" className="text-signal hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-signal hover:underline">Privacy Policy</Link>.
            This is a quote request, not a binding contract.
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-amber sm:text-sm">{errors.terms}</p>
        )}

        {/* What Happens Next */}
        <div className="border border-line bg-ink-800/50 p-4 sm:p-5">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-bone sm:mb-3 sm:text-base">
            <span className="text-base sm:text-lg">{'✨'}</span> What happens next?
          </h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-steel sm:gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-signal/40 font-mono text-[10px] text-signal sm:h-6 sm:w-6 sm:text-xs">1</div>
              <span>Our AI analyzes your requirements (instant)</span>
            </div>
            <div className="flex items-center gap-2 text-steel sm:gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-signal/40 font-mono text-[10px] text-signal sm:h-6 sm:w-6 sm:text-xs">2</div>
              <span>You receive a detailed quote (within 24 hours)</span>
            </div>
            <div className="flex items-center gap-2 text-steel sm:gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-signal/40 font-mono text-[10px] text-signal sm:h-6 sm:w-6 sm:text-xs">3</div>
              <span>Free consultation call (optional)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
