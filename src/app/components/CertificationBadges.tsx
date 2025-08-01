'use client';

import React, { useState } from 'react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  icon: string;
  color: string;
  description: string;
  validUntil?: string;
  credentialId?: string;
  category: 'cloud' | 'ai' | 'development' | 'security';
}

interface Partnership {
  id: string;
  company: string;
  logo: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Partner';
  description: string;
  color: string;
  benefits: string[];
}

const certifications: Certification[] = [
  {
    id: 'aws-certified',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    icon: '☁️',
    color: 'from-orange-400 to-yellow-500',
    description: 'Professional certification for designing distributed systems on AWS',
    validUntil: '2025-12-31',
    credentialId: 'AWS-ASA-2024-001',
    category: 'cloud'
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud Professional ML Engineer',
    issuer: 'Google Cloud',
    icon: '🧠',
    color: 'from-blue-400 to-green-500',
    description: 'Expertise in designing and building ML solutions on Google Cloud Platform',
    validUntil: '2025-08-15',
    credentialId: 'GCP-PMLE-2024-007',
    category: 'ai'
  },
  {
    id: 'microsoft-azure',
    name: 'Azure AI Engineer Associate',
    issuer: 'Microsoft',
    icon: '⚡',
    color: 'from-blue-500 to-purple-600',
    description: 'Certified in implementing AI solutions using Azure Cognitive Services',
    validUntil: '2025-10-20',
    credentialId: 'MS-AI-102-2024',
    category: 'ai'
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow Developer Certificate',
    issuer: 'TensorFlow',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    description: 'Proficiency in building and training neural networks using TensorFlow',
    credentialId: 'TF-DEV-2024-089',
    category: 'ai'
  },
  {
    id: 'kubernetes',
    name: 'Certified Kubernetes Administrator',
    issuer: 'Cloud Native Computing Foundation',
    icon: '⚙️',
    color: 'from-cyan-400 to-blue-500',
    description: 'Expertise in Kubernetes cluster administration and orchestration',
    validUntil: '2025-06-30',
    credentialId: 'CKA-2024-156',
    category: 'cloud'
  },
  {
    id: 'react-advanced',
    name: 'React Advanced Certification',
    issuer: 'Meta',
    icon: '⚛️',
    color: 'from-cyan-500 to-blue-600',
    description: 'Advanced React development patterns and performance optimization',
    credentialId: 'META-REACT-ADV-2024',
    category: 'development'
  },
  {
    id: 'security-plus',
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    icon: '🔒',
    color: 'from-red-500 to-pink-500',
    description: 'Foundational cybersecurity skills and best practices',
    validUntil: '2026-03-15',
    credentialId: 'COMP-SEC-2024-443',
    category: 'security'
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001 Lead Implementer',
    issuer: 'PECB',
    icon: '📋',
    color: 'from-purple-500 to-indigo-600',
    description: 'Information security management system implementation expertise',
    validUntil: '2025-11-12',
    credentialId: 'PECB-ISO27001-2024',
    category: 'security'
  }
];

const partnerships: Partnership[] = [
  {
    id: 'aws-partner',
    company: 'Amazon Web Services',
    logo: '☁️',
    tier: 'Gold',
    description: 'Advanced consulting partner with proven expertise in cloud solutions',
    color: 'from-yellow-400 to-orange-500',
    benefits: ['Priority technical support', 'Co-marketing opportunities', 'Training resources', 'Early access to new services']
  },
  {
    id: 'google-partner',
    company: 'Google Cloud',
    logo: '🌐',
    tier: 'Platinum',
    description: 'Premier partner specializing in AI/ML and data analytics solutions',
    color: 'from-blue-400 to-green-500',
    benefits: ['Dedicated partner manager', 'Joint go-to-market programs', 'Technical training', 'Beta access']
  },
  {
    id: 'microsoft-partner',
    company: 'Microsoft',
    logo: '🪟',
    tier: 'Gold',
    description: 'Certified partner for Azure cloud and AI services implementation',
    color: 'from-blue-500 to-purple-600',
    benefits: ['Partner center access', 'Solution publishing', 'Support benefits', 'Marketing development funds']
  },
  {
    id: 'openai-partner',
    company: 'OpenAI',
    logo: '🤖',
    tier: 'Partner',
    description: 'Approved integration partner for GPT and AI model implementations',
    color: 'from-green-400 to-cyan-500',
    benefits: ['API rate limit increases', 'Priority support', 'Early model access', 'Technical consultations']
  },
  {
    id: 'stripe-partner',
    company: 'Stripe',
    logo: '💳',
    tier: 'Silver',
    description: 'Verified partner for payment processing and financial technology solutions',
    color: 'from-purple-500 to-blue-600',
    benefits: ['Revenue sharing', 'Integration support', 'Partner directory listing', 'Technical resources']
  },
  {
    id: 'vercel-partner',
    company: 'Vercel',
    logo: '▲',
    tier: 'Partner',
    description: 'Integration partner for modern web application deployment and hosting',
    color: 'from-slate-600 to-slate-800',
    benefits: ['Enhanced deployment features', 'Priority support', 'Partner resources', 'Co-marketing opportunities']
  }
];

export default function CertificationBadges() {
  const [activeTab, setActiveTab] = useState<'certifications' | 'partnerships'>('certifications');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(certifications.map(c => c.category)))];
  
  const filteredCertifications = selectedCategory === 'all' 
    ? certifications 
    : certifications.filter(c => c.category === selectedCategory);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-white">Certifications & </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Partnerships
          </span>
        </h2>
        <p className="text-slate-400">
          Our team maintains industry-leading certifications and strategic partnerships with major technology companies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'certifications'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            🏆 Certifications
          </span>
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'partnerships'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            🤝 Partnerships
          </span>
        </button>
      </div>

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-orange-400 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert) => (
              <div key={cert.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${cert.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {cert.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{cert.name}</h3>
                    <p className="text-sm text-slate-400">{cert.issuer}</p>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{cert.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Category:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${cert.color} text-white`}>
                      {cert.category}
                    </span>
                  </div>
                  
                  {cert.validUntil && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Valid Until:</span>
                      <span className="text-green-400">{cert.validUntil}</span>
                    </div>
                  )}
                  
                  {cert.credentialId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Credential ID:</span>
                      <span className="text-cyan-400 font-mono">{cert.credentialId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partnerships Tab */}
      {activeTab === 'partnerships' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${partnership.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {partnership.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{partnership.company}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${partnership.color}`}>
                      {partnership.tier} Partner
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{partnership.description}</p>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Partnership Benefits:</h4>
                  <ul className="space-y-1">
                    {partnership.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="mt-8 pt-8 border-t border-slate-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{certifications.length}+</div>
            <div className="text-sm text-slate-400">Active Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">{partnerships.length}+</div>
            <div className="text-sm text-slate-400">Strategic Partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-sm text-slate-400">Compliance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
            <div className="text-sm text-slate-400">Partner Support</div>
          </div>
        </div>
      </div>

      {/* Verification Statement */}
      <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-600/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Verified & Compliant</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          All certifications are independently verified and regularly renewed. Our partnerships undergo annual reviews to ensure continued compliance with industry standards and best practices. We maintain transparent documentation for all credentials and partnerships.
        </p>
      </div>
    </div>
  );
}