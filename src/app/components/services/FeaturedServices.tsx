'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

const services = [
  {
    title: 'AI Web Development',
    description: 'Build modern, responsive websites powered by AI that adapt to user behavior and preferences.',
    image: '/images/services/webdev.jpg',
    features: ['Custom AI Components', 'Responsive Design', 'Performance Optimization', 'SEO Integration']
  },
  {
    title: 'AI Branding Solutions',
    description: 'Create a unique brand identity with AI-powered logo generation, color palette suggestions, and brand guidelines.',
    image: '/images/services/branding.jpg',
    features: ['Logo Generation', 'Brand Voice Development', 'Color Palette Creation', 'Style Guide Production']
  },
  {
    title: 'Data Visualization',
    description: 'Transform complex data into intuitive, interactive visualizations that tell a compelling story.',
    image: '/images/services/datavis.jpg',
    features: ['Interactive Dashboards', 'Real-time Analytics', 'Custom Chart Creation', 'Trend Analysis']
  }
];

export default function FeaturedServices() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section 
      ref={ref}
      className="py-24 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-950 relative"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 blur-3xl rounded-full" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Featured AI Services
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our specialized AI services deliver tailored solutions to meet your unique business needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease-out ${index * 0.1 + 0.2}s, transform 0.5s ease-out ${index * 0.1 + 0.2}s`
              }}
            >
              {/* Service card image */}
              <div className="h-48 bg-slate-800 overflow-hidden">
                <div 
                  className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center"
                >
                  <span className="text-4xl font-bold text-white/10">{service.title.split(' ')[0]}</span>
                </div>
              </div>
              
              {/* Service card content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{service.title}</h3>
                <p className="text-slate-400 mb-4">{service.description}</p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, i) => (
                      <li 
                        key={i} 
                        className="flex items-center text-sm text-slate-400"
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0)' : 'translateY(10px)',
                          transition: `opacity 0.3s ease-out ${index * 0.1 + i * 0.05 + 0.4}s, transform 0.3s ease-out ${index * 0.1 + i * 0.05 + 0.4}s`
                        }}
                      >
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center">
                    Learn more
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="#contact" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            Request Custom Service
          </a>
        </div>
      </div>
    </section>
  );
} 