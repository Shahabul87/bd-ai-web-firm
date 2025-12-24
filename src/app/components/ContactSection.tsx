'use client';

import React, { useState, useEffect } from 'react';
import validator from 'validator';
import { usePerformanceOptimizedAnimation } from '../hooks/useMobileDetection';

export default function ContactSection() {
  const { shouldAnimate } = usePerformanceOptimizedAnimation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // Honeypot field - bots will fill this
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Enhanced input sanitization function using validator
  const sanitizeInput = (input: string, type: 'text' | 'email' | 'message' = 'text'): string => {
    // First escape HTML entities
    let sanitized = validator.escape(input);
    
    switch(type) {
      case 'email':
        // Normalize email format
        const normalizedEmail = validator.normalizeEmail(sanitized, {
          all_lowercase: true,
          gmail_remove_dots: false,
          gmail_remove_subaddress: false
        });
        return normalizedEmail || '';
      
      case 'message':
        // For longer text, strip low ASCII characters
        // Note: validator.stripLow doesn't support options in the current version
        sanitized = validator.stripLow(sanitized);
        return sanitized.slice(0, 1000); // Limit to 1000 chars
      
      case 'text':
      default:
        // For names and short text, strip all low ASCII characters
        sanitized = validator.stripLow(sanitized);
        return sanitized.slice(0, 100); // Limit to 100 chars
    }
  };

  // Enhanced email validation using validator
  const isValidEmail = (email: string): boolean => {
    return validator.isEmail(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Determine the type based on field name
    const fieldType = name === 'email' ? 'email' : 
                     name === 'message' ? 'message' : 'text';
    
    const sanitizedValue = sanitizeInput(value, fieldType);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          message: '',
          website: ''
        });
        setErrors({});
      } else {
        // Handle validation errors from server
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ submit: result.message || 'An error occurred while sending your message.' });
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!mounted) return null;
  
  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Ready to build 10x faster with AI? Let&apos;s discuss how our AI-powered development can transform your project timeline.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-300">info@cognivat.com</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-gray-300">+1 (775) 250-6651</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-gray-300">Reno, Nevada, USA</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Why Choose Our AI Agency?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-300">24/7 Expert Support</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-300">Enterprise-Grade Security</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-300">Rapid Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 mx-auto bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Message Sent Successfully!
                </h3>
                <p className="text-gray-300 mb-8">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-lg ${shouldAnimate() ? 'hover:bg-blue-700 transition-colors duration-300' : ''}`}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="absolute -left-[9999px] opacity-0 h-0 w-0"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-blue-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-all duration-300 ${
                          errors.name 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-blue-400 focus:border-blue-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-purple-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-slate-600 transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-purple-400 focus:border-purple-500'
                        }`}
                        placeholder="your.email@company.com"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-green-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-slate-600 resize-none transition-all duration-300 ${
                        errors.message 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-green-400 focus:border-green-500'
                      }`}
                      placeholder="Describe your project requirements, timeline, and goals..."
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${shouldAnimate() ? 'hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]' : ''}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className={`-ml-1 mr-3 h-5 w-5 text-white ${shouldAnimate() ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 