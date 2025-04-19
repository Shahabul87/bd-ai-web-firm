'use client';

import React, { useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const CATEGORIES = [
  {
    name: 'Web Development',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: 'AI-powered websites and applications with seamless user experiences',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Node.js', 'Python']
  },
  {
    name: 'Data Analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: 'Turn data into actionable insights with AI-powered analytics solutions',
    technologies: ['TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn', 'Tableau']
  },
  {
    name: 'AI Services',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    description: 'Custom AI solutions tailored to your business needs and challenges',
    technologies: ['OpenAI', 'GPT-4', 'BERT', 'Computer Vision', 'NLP']
  },
  {
    name: 'Digital Marketing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    description: 'AI-optimized marketing campaigns that drive engagement and conversions',
    technologies: ['SEO', 'Content Marketing', 'Social Media', 'Analytics', 'Email Marketing']
  }
];

export default function ServiceCategories() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px 0px"
  });
  
  const [activeCategory, setActiveCategory] = useState(0);
  
  return (
    <section 
      ref={ref} 
      className="py-24 relative"
    >
      {/* Background gradient that transitions smoothly from HeroSection */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black z-0"></div>
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease'
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Service Categories
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover our comprehensive range of AI-powered services designed to transform your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {CATEGORIES.map((category, index) => (
            <div
              key={category.name}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                activeCategory === index
                  ? 'bg-gradient-to-br from-blue-700/20 to-purple-700/20 border border-blue-500/50'
                  : 'bg-gray-900/40 border border-gray-800 hover:border-blue-500/30'
              }`}
              onClick={() => setActiveCategory(index)}
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.5s ease ${index * 0.1 + 0.2}s`
              }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                activeCategory === index
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-400 text-sm">{category.description}</p>
            </div>
          ))}
        </div>

        <div 
          className="bg-gradient-to-br from-gray-900/70 to-gray-950/70 rounded-xl border border-gray-800 p-8 backdrop-blur-sm"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.5s ease 0.6s'
          }}
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold mb-4">{CATEGORIES[activeCategory].name}</h3>
              <p className="text-gray-300 mb-6">{CATEGORIES[activeCategory].description}</p>
              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES[activeCategory].technologies.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                Learn More
              </button>
            </div>
            <div className="lg:w-1/2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h4 className="text-xl font-semibold mb-4">How We Can Help</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Custom solutions tailored to your specific business needs</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Seamless integration with your existing technology stack</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">End-to-end implementation and ongoing support</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Data-driven insights to measure ROI and performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 