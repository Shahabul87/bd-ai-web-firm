'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

const portfolioItems = [
  {
    id: 1,
    title: "E-Commerce AI Recommendation Engine",
    category: "E-Commerce & AI",
    client: "RetailMax Inc.",
    description: "Built an intelligent product recommendation system that increased sales by 47% and improved customer engagement by 65%.",
    technologies: ["React", "Node.js", "TensorFlow", "PostgreSQL", "Redis"],
    results: [
      { metric: "Sales Increase", value: "47%" },
      { metric: "User Engagement", value: "65%" },
      { metric: "Cart Abandonment Reduction", value: "32%" }
    ],
    featured: true
  },
  {
    id: 2,
    title: "Healthcare Data Analytics Platform",
    category: "Healthcare & Data Viz",
    client: "MedTech Solutions",
    description: "Developed a comprehensive analytics platform for patient data visualization and predictive health monitoring.",
    technologies: ["Next.js", "Python", "FastAPI", "D3.js", "MongoDB"],
    results: [
      { metric: "Processing Speed", value: "3x Faster" },
      { metric: "Data Accuracy", value: "99.2%" },
      { metric: "Cost Reduction", value: "40%" }
    ],
    featured: true
  },
  {
    id: 3,
    title: "Financial Trading Dashboard",
    category: "FinTech & Analytics",
    client: "InvestPro Capital",
    description: "Created a real-time trading dashboard with AI-powered market analysis and automated trading alerts.",
    technologies: ["Vue.js", "Python", "WebSocket", "PostgreSQL", "Docker"],
    results: [
      { metric: "Trade Execution Speed", value: "200ms" },
      { metric: "Prediction Accuracy", value: "87%" },
      { metric: "Risk Reduction", value: "23%" }
    ],
    featured: false
  },
  {
    id: 4,
    title: "Manufacturing Quality Control AI",
    category: "Manufacturing & Computer Vision",
    client: "AutoParts Manufacturing",
    description: "Implemented computer vision system for automated quality control, reducing defects and production costs.",
    technologies: ["React", "OpenCV", "TensorFlow", "Flask", "AWS"],
    results: [
      { metric: "Defect Detection", value: "99.7%" },
      { metric: "Quality Improvement", value: "85%" },
      { metric: "Cost Savings", value: "$2.1M/year" }
    ],
    featured: false
  },
  {
    id: 5,
    title: "Smart City Traffic Management",
    category: "IoT & Predictive Analytics",
    client: "City of Springfield",
    description: "Developed an intelligent traffic management system using IoT sensors and predictive analytics.",
    technologies: ["Angular", "Python", "IoT", "Machine Learning", "Azure"],
    results: [
      { metric: "Traffic Flow Improvement", value: "35%" },
      { metric: "Fuel Consumption Reduction", value: "18%" },
      { metric: "Emergency Response Time", value: "-25%" }
    ],
    featured: false
  },
  {
    id: 6,
    title: "Educational AI Tutoring Platform",
    category: "EdTech & Natural Language Processing",
    client: "EduTech Innovations",
    description: "Built an AI-powered tutoring platform with personalized learning paths and natural language interaction.",
    technologies: ["React", "NLP", "Python", "GPT Integration", "Firebase"],
    results: [
      { metric: "Learning Efficiency", value: "60%" },
      { metric: "Student Satisfaction", value: "92%" },
      { metric: "Completion Rate", value: "78%" }
    ],
    featured: false
  }
];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [filteredItems, setFilteredItems] = useState(portfolioItems);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const featuredItems = filteredItems.filter(item => item.featured);
  const otherItems = filteredItems.filter(item => !item.featured);
  
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  
  const filters = ["All Projects", "E-Commerce", "Healthcare", "FinTech", "Manufacturing", "IoT"];
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'All Projects') {
      setFilteredItems(portfolioItems);
    } else {
      setFilteredItems(portfolioItems.filter(item => 
        item.category.toLowerCase().includes(filter.toLowerCase())
      ));
    }
  };
  
  const handleCTAClick = (action: string) => {
    console.log('CTA clicked:', action);
  };
  
  // Floating particles animation
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <PageBackground>
      <div className="min-h-screen text-slate-900 dark:text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          {/* Floating Background Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, 50, 0],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                  duration: 8 + particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay
                }}
              />
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
                    className="block text-slate-900 dark:text-white"
                    initial={{ opacity: 0, x: -50 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >Our</motion.span>
                  <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500"
                    initial={{ opacity: 0, x: 50 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    Portfolio
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 lg:mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Discover how we&apos;ve helped businesses transform their operations with cutting-edge AI solutions and intelligent web applications.
                </motion.p>
                <motion.div 
                  className="flex flex-wrap justify-center gap-2 sm:gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  {filters.map((filter, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleFilterClick(filter)}
                      className={`px-3 sm:px-4 lg:px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm sm:text-base relative overflow-hidden group ${
                        activeFilter === filter
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-400/25'
                          : 'border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-400/10'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                      <span className="relative z-10">{filter}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Featured Projects */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Projects</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Our most impactful projects that showcase the power of AI-driven solutions.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                <AnimatePresence mode="wait">
                  {featuredItems.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      className="group"
                      layout
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.9 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      onHoverStart={() => setHoveredCard(item.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <motion.div 
                        className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 overflow-hidden transition-all duration-500 relative"
                        whileHover={{ 
                          scale: 1.02,
                          borderColor: 'rgba(34, 211, 238, 0.4)',
                          boxShadow: '0 20px 40px -10px rgba(34, 211, 238, 0.2)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {/* Animated background glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-500/5 to-orange-500/5 opacity-0"
                          animate={{ opacity: hoveredCard === item.id ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Project Image */}
                        <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-orange-500/20"
                            animate={{ 
                              opacity: hoveredCard === item.id ? 0.8 : 0.3,
                              scale: hoveredCard === item.id ? 1.1 : 1
                            }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ 
                              rotate: hoveredCard === item.id ? 360 : 0,
                              scale: hoveredCard === item.id ? 1.2 : 1
                            }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                          >
                            <div className="text-6xl opacity-20">🚀</div>
                          </motion.div>
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="px-2 sm:px-3 py-1 bg-slate-200/80 dark:bg-slate-900/80 rounded-full text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="p-4 sm:p-6 lg:p-8">
                          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base">Client: {item.client}</p>
                          <p className="text-slate-700 dark:text-slate-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                            {item.description}
                          </p>

                          {/* Technologies */}
                          <div className="mb-4 sm:mb-6">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">Technologies Used</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {item.technologies.map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 sm:px-3 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-400/30 dark:border-slate-600/30"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Results */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {item.results.map((result, index) => (
                              <div key={index} className="text-center p-2 sm:p-0">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400 mb-1">
                                  {result.value}
                                </div>
                                <div className="text-xs sm:text-xs text-slate-600 dark:text-slate-400 leading-tight">
                                  {result.metric}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Other Projects */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  More <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Projects</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence mode="wait">
                  {otherItems.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      className="group"
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                    >
                      <motion.div 
                        className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 overflow-hidden transition-all duration-300 h-full relative"
                        whileHover={{ 
                          borderColor: 'rgba(168, 85, 247, 0.4)',
                          boxShadow: '0 15px 30px -10px rgba(168, 85, 247, 0.2)'
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-orange-500/5 to-green-400/5 opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Project Image */}
                        <div className="relative h-40 sm:h-44 lg:h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-orange-500/20 to-green-400/20"
                            whileHover={{ scale: 1.1, opacity: 0.8 }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            whileHover={{ 
                              rotate: [0, -10, 10, -10, 0],
                              scale: 1.1
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="text-4xl opacity-20">🎯</div>
                          </motion.div>
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="px-2 sm:px-3 py-1 bg-slate-200/80 dark:bg-slate-900/80 rounded-full text-xs text-purple-600 dark:text-purple-400">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="p-4 sm:p-6 flex flex-col h-full">
                          <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 text-xs sm:text-sm">Client: {item.client}</p>
                          <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed text-xs sm:text-sm flex-grow">
                            {item.description}
                          </p>

                          {/* Key Results */}
                          <div className="grid grid-cols-3 gap-2 mt-auto">
                            {item.results.slice(0, 3).map((result, index) => (
                              <div key={index} className="text-center">
                                <div className="text-lg font-bold text-purple-400 mb-1">
                                  {result.value}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  {result.metric}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Our Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Methodology</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Every successful project follows our proven methodology for AI implementation and web development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Discovery & Analysis",
                    description: "Deep dive into your business requirements, data analysis, and technical assessment.",
                    icon: "🔍"
                  },
                  {
                    step: "02",
                    title: "Strategy & Design",
                    description: "Create comprehensive project roadmap, architecture design, and user experience planning.",
                    icon: "🎨"
                  },
                  {
                    step: "03",
                    title: "Development & Testing",
                    description: "Agile development process with continuous integration, testing, and quality assurance.",
                    icon: "⚙️"
                  },
                  {
                    step: "04",
                    title: "Deployment & Optimization",
                    description: "Launch your solution with monitoring, optimization, and ongoing support.",
                    icon: "🚀"
                  }
                ].map((phase, index) => (
                  <PhaseItem key={index} phase={phase} index={index} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Animated background shapes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-orange-400/10 to-pink-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </div>
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-8 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Ready to Start Your Next Project?
              </motion.h2>
              <motion.p 
                className="text-xl text-slate-600 dark:text-slate-400 mb-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Let&apos;s discuss how we can help you achieve similar results with our AI and web development expertise.
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
                    Start Your Project
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
                  onClick={() => handleCTAClick('view-cases')}
                  className="px-8 py-4 border-2 border-slate-400 dark:border-slate-600 rounded-full text-slate-900 dark:text-white font-semibold transition-all duration-300 relative overflow-hidden"
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
                  <span className="relative z-10">View Case Studies</span>
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

function PhaseItem({ phase, index }: { phase: { title: string; description: string; icon: string }; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <motion.div 
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center border border-slate-600/50 transition-all duration-300 group relative overflow-hidden"
        whileHover={{ 
          scale: 1.1,
          borderColor: 'rgba(34, 211, 238, 0.4)',
          boxShadow: '0 15px 25px -5px rgba(34, 211, 238, 0.2)'
        }}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            delay: index * 0.5
          }
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div 
          className="text-3xl relative z-10"
          whileHover={{ 
            scale: 1.2,
            rotate: [0, -10, 10, 0]
          }}
          transition={{ duration: 0.3 }}
        >
          {phase.icon}
        </motion.div>
      </motion.div>
      <motion.h3 
        className="text-xl font-bold mb-4 text-slate-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
      >
        {phase.title}
      </motion.h3>
      <motion.p 
        className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
      >
        {phase.description}
      </motion.p>
    </motion.div>
  );
}