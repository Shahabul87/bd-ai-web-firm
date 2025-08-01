'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function WebDevelopment() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  
  // Floating particles animation
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  const handleCTAClick = (action: string) => {
    console.log('CTA clicked:', action);
  };

  const services = [
    {
      id: 1,
      icon: '🎨',
      title: 'AI-Enhanced UX/UI',
      description: 'User interfaces that adapt and personalize based on user behavior and preferences using machine learning.',
      features: ['Adaptive User Interfaces', 'Personalized Content Delivery', 'Intelligent Form Validation', 'Behavioral Analytics Integration'],
      gradient: 'from-cyan-400 to-purple-500',
      hoverColor: 'cyan-400'
    },
    {
      id: 2,
      icon: '🧠',
      title: 'Intelligent Web Applications',
      description: 'Full-stack applications with built-in AI capabilities for automation, prediction, and intelligent decision-making.',
      features: ['AI-Powered Dashboards', 'Predictive Analytics Integration', 'Automated Workflow Systems', 'Smart Recommendation Engines'],
      gradient: 'from-purple-500 to-orange-500',
      hoverColor: 'purple-400'
    },
    {
      id: 3,
      icon: '🛒',
      title: 'AI-Powered E-commerce',
      description: 'Online stores with intelligent product recommendations, dynamic pricing, and automated customer service.',
      features: ['Smart Product Recommendations', 'Dynamic Pricing Algorithms', 'Chatbot Customer Support', 'Inventory Optimization'],
      gradient: 'from-orange-500 to-green-400',
      hoverColor: 'orange-400'
    },
    {
      id: 4,
      icon: '📊',
      title: 'Data Visualization Platforms',
      description: 'Interactive dashboards and reporting systems that transform complex data into actionable insights.',
      features: ['Real-time Data Dashboards', 'Interactive Charts & Graphs', 'Custom Report Generation', 'Data Export & Integration'],
      gradient: 'from-green-400 to-cyan-400',
      hoverColor: 'green-400'
    },
    {
      id: 5,
      icon: '⚡',
      title: 'AI-Ready API Development',
      description: 'Scalable APIs designed to integrate with AI services and handle intelligent data processing workflows.',
      features: ['RESTful & GraphQL APIs', 'AI Service Integration', 'Real-time Data Processing', 'Secure Authentication Systems'],
      gradient: 'from-cyan-400 to-purple-500',
      hoverColor: 'cyan-400'
    },
    {
      id: 6,
      icon: '🚀',
      title: 'Performance Optimization',
      description: 'AI-driven performance monitoring and optimization to ensure your applications run at peak efficiency.',
      features: ['Automated Performance Monitoring', 'Code Optimization Suggestions', 'CDN & Caching Strategies', 'Load Balancing Solutions'],
      gradient: 'from-purple-500 to-orange-500',
      hoverColor: 'purple-400'
    }
  ];

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          {/* Floating Background Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-3 h-3 bg-gradient-to-r from-cyan-400/15 to-purple-500/15 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  y: [0, -150, 0],
                  x: [0, 30, -30, 0],
                  opacity: [0.1, 0.6, 0.1],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 12 + particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay
                }}
              />
            ))}
          </div>

          {/* Floating Code Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {['</>', '{}', '[]', '()', 'AI', 'JS', 'TS', 'CSS'].map((code, index) => (
              <motion.div
                key={index}
                className="absolute text-cyan-400/10 font-mono text-sm"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 15 + index,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 2
                }}
              >
                {code}
              </motion.div>
            ))}
          </div>

          {/* Hero Section */}
          <section ref={heroRef} className="relative overflow-hidden py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8"
                  initial={{ opacity: 0, y: 50 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <motion.span 
                    className="block text-white"
                    initial={{ opacity: 0, x: -50 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    AI-Powered
                  </motion.span>
                  <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500"
                    initial={{ opacity: 0, x: 50 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    Web Development
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-slate-400 max-w-3xl mx-auto mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  We create intelligent, scalable web applications that leverage AI to deliver exceptional user experiences and drive business growth.
                </motion.p>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  <motion.button 
                    onClick={() => handleCTAClick('view-work')}
                    className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold transition-all duration-300 relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: '0 20px 40px -10px rgba(34, 211, 238, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="flex items-center gap-2 relative z-10">
                      View Our Work
                      <motion.svg 
                        className="w-5 h-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </motion.svg>
                    </span>
                  </motion.button>
                  <motion.button 
                    onClick={() => handleCTAClick('start-project')}
                    className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold transition-all duration-300 relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05,
                      borderColor: 'rgba(34, 211, 238, 0.8)',
                      boxShadow: '0 10px 25px -5px rgba(34, 211, 238, 0.2)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Start Your Project</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Services Grid */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Development Services</span>
                </motion.h2>
                <motion.p 
                  className="text-slate-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  From AI-enhanced user interfaces to intelligent backend systems, we deliver complete web solutions.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const ref = useRef(null);
                  const inView = useInView(ref, { once: true });
                  
                  return (
                    <motion.div
                      key={service.id}
                      ref={ref}
                      className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 transition-all duration-500 group relative overflow-hidden"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      onHoverStart={() => setHoveredCard(service.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      whileHover={{
                        scale: 1.02,
                        borderColor: `rgba(34, 211, 238, 0.4)`,
                        boxShadow: `0 20px 40px -10px rgba(34, 211, 238, 0.2)`
                      }}
                    >
                      {/* Animated background glow */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-orange-500/5 opacity-0"
                        animate={{ opacity: hoveredCard === service.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <motion.div 
                        className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 relative z-10`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                          boxShadow: '0 15px 30px -5px rgba(34, 211, 238, 0.3)'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.span 
                          className="text-2xl"
                          animate={hoveredCard === service.id ? { 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {service.icon}
                        </motion.span>
                      </motion.div>
                      <motion.h3 
                        className="text-2xl font-bold mb-4 relative z-10"
                        animate={{ 
                          color: hoveredCard === service.id ? '#22d3ee' : '#ffffff'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {service.title}
                      </motion.h3>
                      <motion.p 
                        className="text-slate-400 mb-6 relative z-10"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: hoveredCard === service.id ? 1 : 0.7 }}
                        transition={{ duration: 0.3 }}
                      >
                        {service.description}
                      </motion.p>
                      <motion.ul 
                        className="space-y-2 text-sm text-slate-300 relative z-10"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: hoveredCard === service.id ? 1 : 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {service.features.map((feature, featureIndex) => (
                          <motion.li 
                            key={featureIndex}
                            className="flex items-center gap-2"
                            initial={{ x: 0 }}
                            animate={{ x: hoveredCard === service.id ? 5 : 0 }}
                            transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                          >
                            <motion.div 
                              className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0"
                              animate={{ 
                                scale: hoveredCard === service.id ? [1, 1.5, 1] : 1,
                                opacity: hoveredCard === service.id ? [0.7, 1, 0.7] : 0.7
                              }}
                              transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                            />
                            {feature}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Technology Stack</span>
                </motion.h2>
                <motion.p 
                  className="text-slate-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  We use cutting-edge technologies to build scalable, maintainable, and intelligent web applications.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Frontend Technologies',
                    color: 'cyan-400',
                    techs: [
                      { name: 'React & Next.js', desc: 'Modern React framework with SSR/SSG' },
                      { name: 'TypeScript', desc: 'Type-safe JavaScript development' },
                      { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
                      { name: 'Framer Motion', desc: 'Advanced animations and interactions' }
                    ]
                  },
                  {
                    title: 'Backend Technologies',
                    color: 'purple-400',
                    techs: [
                      { name: 'Node.js & Python', desc: 'Scalable server-side development' },
                      { name: 'FastAPI & Express', desc: 'High-performance API frameworks' },
                      { name: 'PostgreSQL & MongoDB', desc: 'Relational and NoSQL databases' },
                      { name: 'Redis & ElasticSearch', desc: 'Caching and search solutions' }
                    ]
                  },
                  {
                    title: 'AI & Cloud',
                    color: 'orange-400',
                    techs: [
                      { name: 'TensorFlow & PyTorch', desc: 'Machine learning frameworks' },
                      { name: 'OpenAI & Hugging Face', desc: 'AI model integration' },
                      { name: 'AWS & Google Cloud', desc: 'Cloud infrastructure & services' },
                      { name: 'Docker & Kubernetes', desc: 'Containerization & orchestration' }
                    ]
                  }
                ].map((stack, index) => {
                  const ref = useRef(null);
                  const inView = useInView(ref, { once: true });
                  
                  return (
                    <motion.div 
                      key={index}
                      ref={ref}
                      className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50"
                      initial={{ opacity: 0, y: 50 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      whileHover={{
                        scale: 1.02,
                        borderColor: `rgba(34, 211, 238, 0.3)`,
                        boxShadow: '0 15px 30px -10px rgba(34, 211, 238, 0.1)'
                      }}
                    >
                      <motion.h3 
                        className={`text-xl font-bold mb-6 text-${stack.color}`}
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      >
                        {stack.title}
                      </motion.h3>
                      <div className="space-y-4">
                        {stack.techs.map((tech, techIndex) => (
                          <motion.div 
                            key={techIndex} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, delay: index * 0.2 + 0.4 + techIndex * 0.1 }}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div 
                              className={`w-2 h-2 bg-${stack.color} rounded-full mt-2 flex-shrink-0`}
                              whileHover={{ 
                                scale: 1.5,
                                boxShadow: `0 0 10px rgba(34, 211, 238, 0.5)`
                              }}
                            />
                            <div>
                              <div className="text-white font-medium">{tech.name}</div>
                              <div className="text-sm text-slate-400">{tech.desc}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  Our Development <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Process</span>
                </motion.h2>
                <motion.p 
                  className="text-slate-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  We follow a structured approach to ensure your project is delivered on time, on budget, and exceeds expectations.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Discovery & Planning',
                    description: 'We analyze your requirements, define project scope, and create a detailed roadmap.',
                    color: 'from-cyan-400 to-purple-500'
                  },
                  {
                    step: '02',
                    title: 'Design & Prototyping',
                    description: 'Create wireframes, mockups, and interactive prototypes to visualize the solution.',
                    color: 'from-purple-500 to-orange-500'
                  },
                  {
                    step: '03',
                    title: 'Development & Testing',
                    description: 'Build your application using agile methodology with continuous testing and integration.',
                    color: 'from-orange-500 to-green-400'
                  },
                  {
                    step: '04',
                    title: 'Deployment & Support',
                    description: 'Launch your application and provide ongoing maintenance, updates, and support.',
                    color: 'from-green-400 to-cyan-400'
                  }
                ].map((phase, index) => {
                  const ref = useRef(null);
                  const inView = useInView(ref, { once: true });
                  
                  return (
                    <motion.div 
                      key={index} 
                      ref={ref}
                      className="text-center group"
                      initial={{ opacity: 0, y: 50 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                      <motion.div 
                        className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${phase.color} flex items-center justify-center transition-all duration-300 relative overflow-hidden`}
                        whileHover={{ 
                          scale: 1.1,
                          boxShadow: '0 15px 25px -5px rgba(34, 211, 238, 0.3)'
                        }}
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          y: {
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.7
                          }
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.span 
                          className="text-xl font-bold text-white relative z-10"
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -5, 5, 0]
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {phase.step}
                        </motion.span>
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-bold mb-4 text-white"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      >
                        {phase.title}
                      </motion.h3>
                      <motion.p 
                        className="text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                      >
                        {phase.description}
                      </motion.p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Animated background shapes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-orange-400/10 to-pink-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.2, 0.5],
                    x: [0, -40, 0],
                    y: [0, 20, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-purple-400/10 to-cyan-400/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.7, 0.3],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 10, repeat: Infinity, delay: 4 }}
                />
              </div>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-8 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Ready to Build Something Amazing?
              </motion.h2>
              <motion.p 
                className="text-xl text-slate-400 mb-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Let&apos;s create an intelligent web application that transforms your business and delights your users.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.button 
                  onClick={() => handleCTAClick('start-project')}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold transition-all duration-300 relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: '0 25px 50px -10px rgba(34, 211, 238, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="flex items-center gap-2 relative z-10">
                    Start Your Project
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      whileHover={{ x: 8, rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </span>
                </motion.button>
                <motion.button 
                  onClick={() => handleCTAClick('consultation')}
                  className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold transition-all duration-300 relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: 'rgba(34, 211, 238, 0.8)',
                    boxShadow: '0 15px 30px -5px rgba(34, 211, 238, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Schedule Consultation</span>
                </motion.button>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}