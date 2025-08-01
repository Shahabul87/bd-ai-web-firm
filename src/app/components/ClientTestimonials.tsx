'use client';

import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  avatar: string;
  rating: number;
  quote: string;
  project: string;
  results: {
    metric: string;
    value: string;
    improvement: string;
  }[];
  featured: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Chief Technology Officer',
    company: 'MedTech Solutions',
    industry: 'Healthcare',
    avatar: '👩‍⚕️',
    rating: 5,
    quote: 'The AI-powered diagnostic system has revolutionized our approach to patient care. We\'re able to identify critical conditions 23% faster than before, and our diagnostic accuracy has improved dramatically. The ROI has exceeded our expectations.',
    project: 'Healthcare Analytics Platform',
    results: [
      { metric: 'Diagnostic Speed', value: '23%', improvement: 'faster' },
      { metric: 'Accuracy Rate', value: '99.2%', improvement: 'improved' },
      { metric: 'Cost Reduction', value: '40%', improvement: 'savings' }
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Head of Digital Innovation',
    company: 'InvestPro Capital',
    industry: 'Finance',
    avatar: '👨‍💼',
    rating: 5,
    quote: 'The AI trading platform has transformed our operations completely. We\'re executing trades 45% faster with 87% fraud detection accuracy. Our clients are seeing better returns while we\'ve significantly reduced operational risks.',
    project: 'Algorithmic Trading System',
    results: [
      { metric: 'Trade Speed', value: '45%', improvement: 'faster' },
      { metric: 'Fraud Detection', value: '87%', improvement: 'accuracy' },
      { metric: 'Risk Reduction', value: '23%', improvement: 'decrease' }
    ],
    featured: true
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    title: 'VP of Digital Commerce',
    company: 'RetailMax Inc.',
    industry: 'Retail',
    avatar: '👩‍💻',
    rating: 5,
    quote: 'The recommendation engine has completely transformed our customer experience. We\'re seeing 47% higher sales and 65% better engagement. Our customers love the personalized shopping experience.',
    project: 'AI Recommendation Engine',
    results: [
      { metric: 'Sales Increase', value: '47%', improvement: 'growth' },
      { metric: 'User Engagement', value: '65%', improvement: 'improved' },
      { metric: 'Cart Abandonment', value: '32%', improvement: 'reduced' }
    ],
    featured: true
  },
  {
    id: '4',
    name: 'David Park',
    title: 'Operations Director',
    company: 'AutoParts Manufacturing',
    industry: 'Manufacturing',
    avatar: '👨‍🔧',
    rating: 5,
    quote: 'The computer vision quality control system has been a game-changer. We\'ve achieved 99.7% defect detection accuracy and reduced production costs by 25%. The system pays for itself.',
    project: 'Quality Control AI',
    results: [
      { metric: 'Defect Detection', value: '99.7%', improvement: 'accuracy' },
      { metric: 'Cost Reduction', value: '25%', improvement: 'savings' },
      { metric: 'Quality Score', value: '85%', improvement: 'improved' }
    ],
    featured: false
  },
  {
    id: '5',
    name: 'Rachel Adams',
    title: 'Head of Analytics',
    company: 'DataFlow Corp',
    industry: 'Technology',
    avatar: '👩‍💼',
    rating: 5,
    quote: 'The data visualization platform has made our complex datasets accessible to everyone in the organization. Decision-making is now 60% faster with real-time insights.',
    project: 'Data Visualization Platform',
    results: [
      { metric: 'Decision Speed', value: '60%', improvement: 'faster' },
      { metric: 'Data Accuracy', value: '94%', improvement: 'improved' },
      { metric: 'User Adoption', value: '85%', improvement: 'increase' }
    ],
    featured: false
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Chief Innovation Officer',
    company: 'SmartLogistics',
    industry: 'Transportation',
    avatar: '👨‍✈️',
    rating: 5,
    quote: 'The AI-powered route optimization has revolutionized our delivery operations. We\'ve cut delivery times by 30% and reduced fuel costs by 18%. Outstanding results.',
    project: 'Route Optimization AI',
    results: [
      { metric: 'Delivery Time', value: '30%', improvement: 'reduced' },
      { metric: 'Fuel Costs', value: '18%', improvement: 'savings' },
      { metric: 'Customer Satisfaction', value: '92%', improvement: 'rating' }
    ],
    featured: false
  }
];

export default function ClientTestimonials() {
  const [activeTab, setActiveTab] = useState<'featured' | 'all' | 'industry'>('featured');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  const industries = ['all', ...Array.from(new Set(testimonials.map(t => t.industry)))];
  
  const getFilteredTestimonials = () => {
    switch (activeTab) {
      case 'featured':
        return testimonials.filter(t => t.featured);
      case 'industry':
        return selectedIndustry === 'all' 
          ? testimonials 
          : testimonials.filter(t => t.industry === selectedIndustry);
      default:
        return testimonials;
    }
  };

  const filteredTestimonials = getFilteredTestimonials();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredTestimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [filteredTestimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-white">Client </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            Testimonials
          </span>
        </h2>
        <p className="text-slate-400">
          Hear from our clients about their AI transformation journey and the results they&apos;ve achieved.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'featured'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setActiveTab('industry')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'industry'
                ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            By Industry
          </button>
        </div>

        {/* Industry Filter */}
        {activeTab === 'industry' && (
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedIndustry === industry
                    ? 'bg-cyan-400 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {industry === 'all' ? 'All Industries' : industry}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Testimonial Slider */}
      {filteredTestimonials.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-600/50">
                    {/* Header */}
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{testimonial.name}</h3>
                          <div className="flex gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-sm">⭐</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{testimonial.title}</p>
                        <p className="text-cyan-400 font-medium">{testimonial.company}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                            {testimonial.industry}
                          </span>
                          <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                            {testimonial.project}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg text-slate-300 mb-6 italic leading-relaxed">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>

                    {/* Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {testimonial.results.map((result, index) => (
                        <div key={index} className="bg-slate-700/50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-400 mb-1">{result.value}</div>
                          <div className="text-sm text-slate-400 mb-1">{result.metric}</div>
                          <div className="text-xs text-slate-500">{result.improvement}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {filteredTestimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentSlide ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 pt-8 border-t border-slate-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
            <div className="text-sm text-slate-400">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">150+</div>
            <div className="text-sm text-slate-400">Projects Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">2.3x</div>
            <div className="text-sm text-slate-400">Average ROI</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">8 weeks</div>
            <div className="text-sm text-slate-400">Avg. Implementation</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-slate-400 mb-4">Ready to join our successful clients?</p>
        <button className="px-6 py-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-green-400/30 transition-all duration-300 transform hover:-translate-y-1">
          Start Your AI Project Today
        </button>
      </div>
    </div>
  );
}