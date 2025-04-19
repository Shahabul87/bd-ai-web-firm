'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px 0px"
  });

  return (
    <section 
      ref={ref}
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black"
      id="contact-section"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl">
          <div className="absolute -top-[40%] left-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-[40%] right-[10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - CTA content */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease'
            }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 mb-5">
              Get Started Today
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to transform your business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI solutions</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-lg">
              Our team of AI experts is ready to build customized solutions that address your unique business challenges and unlock new opportunities.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Free initial consultation and needs assessment",
                "Tailored solutions designed for your specific industry",
                "Dedicated support and continuous optimization",
                "Transparent pricing with no hidden costs"
              ].map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-green-500/10 text-green-400 mr-3 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
              >
                Schedule a Consultation
              </a>
              <a 
                href="/case-studies"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                View Case Studies
              </a>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease 0.2s'
            }}
          >
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">
                Request Information
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>
                
                <div>
                  <label htmlFor="service-interest" className="block text-sm font-medium text-gray-300 mb-1">
                    Service Interest
                  </label>
                  <select
                    id="service-interest"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a service</option>
                    <option value="custom-ai">Custom AI Development</option>
                    <option value="automation">Intelligent Automation</option>
                    <option value="conversational">Conversational AI</option>
                    <option value="data-analytics">AI-Powered Analytics</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    How can we help?
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your project or requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                >
                  Submit Request
                </button>
                
                <p className="text-xs text-gray-500 mt-4">
                  By submitting this form, you agree to our <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a> and consent to being contacted regarding your request.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 