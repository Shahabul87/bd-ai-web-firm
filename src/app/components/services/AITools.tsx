'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

const tools = [
  {
    name: 'Semantic Analysis Engine',
    description: 'Advanced NLP tool that understands context and sentiment in user interactions',
    category: 'Natural Language Processing',
    useCases: ['Customer Support', 'Market Research', 'Content Moderation']
  },
  {
    name: 'Visual Recognition Suite',
    description: 'AI-powered image and video analysis tools for object detection and classification',
    category: 'Computer Vision',
    useCases: ['Product Identification', 'Quality Control', 'Security Monitoring']
  },
  {
    name: 'Predictive Analytics Platform',
    description: 'Machine learning system that identifies patterns and predicts future trends',
    category: 'Data Science',
    useCases: ['Demand Forecasting', 'Risk Assessment', 'Resource Planning']
  },
  {
    name: 'Autonomous Agent Framework',
    description: 'Build and deploy AI agents that perform complex tasks without human intervention',
    category: 'Agent Systems',
    useCases: ['Process Automation', 'Interactive Assistants', 'Autonomous Decision Making']
  },
  {
    name: 'Neural Code Generator',
    description: 'AI that writes, reviews, and optimizes code across multiple programming languages',
    category: 'Development',
    useCases: ['Rapid Prototyping', 'Code Refactoring', 'System Integration']
  },
  {
    name: 'Adaptive Learning System',
    description: 'Education platform that customizes content based on individual learning patterns',
    category: 'Education',
    useCases: ['Corporate Training', 'Skill Development', 'Knowledge Assessment']
  }
];

export default function AITools() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section 
      ref={ref}
      className="py-24 px-4 md:px-8 bg-slate-950 relative overflow-hidden"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI Tools & Technologies
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our proprietary suite of AI tools that power our services and can be customized for your specific needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
              }}
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block text-xs font-semibold py-1 px-2 rounded-full bg-blue-500/10 text-blue-400 mb-3">
                    {tool.category}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    {tool.name}
                  </h3>
                </div>
                
                <p className="text-slate-400 mb-6">
                  {tool.description}
                </p>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Common Use Cases:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.useCases.map((useCase, idx) => (
                      <span 
                        key={idx}
                        className="text-xs py-1 px-2 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700/30">
                <button className="w-full py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
            Explore All AI Tools
          </button>
        </div>
      </div>
    </section>
  );
} 