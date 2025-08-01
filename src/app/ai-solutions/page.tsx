'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';
import MLTrainingDemo from '../components/demos/MLTrainingDemo';
import NLPAnalysisDemo from '../components/demos/NLPAnalysisDemo';
import ComputerVisionDemo from '../components/demos/ComputerVisionDemo';

export default function AISolutions() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  
  // Floating AI-themed particles animation
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  const handleCTAClick = (action: string) => {
    console.log('CTA clicked:', action);
  };

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          {/* Floating AI-themed Background Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  y: [0, -200, 0],
                  x: [0, 40, -40, 0],
                  opacity: [0.1, 0.7, 0.1],
                  scale: [1, 1.8, 1]
                }}
                transition={{
                  duration: 15 + particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay
                }}
              />
            ))}
          </div>

          {/* Floating AI Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {['🧠', '🤖', '⚡', '🔬', '📊', '🎯', '💡', '🚀'].map((ai, index) => (
              <motion.div
                key={index}
                className="absolute text-cyan-400/8 text-2xl"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.05, 0.2, 0.05],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 18 + index * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 3
                }}
              >
                {ai}
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
                    Intelligent Solutions
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-slate-400 max-w-3xl mx-auto mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Transform your business with cutting-edge AI solutions. From machine learning models to intelligent automation, we deliver custom AI systems that drive growth and innovation.
                </motion.p>
              </div>
            </div>
          </section>

          {/* AI Solutions Grid */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Machine Learning */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Machine Learning</h3>
                  <p className="text-slate-400 mb-6">
                    Custom ML models for predictive analytics, pattern recognition, and intelligent decision-making systems.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Predictive Analytics</li>
                    <li>• Classification & Clustering</li>
                    <li>• Recommendation Systems</li>
                    <li>• Anomaly Detection</li>
                  </ul>
                </div>

                {/* Natural Language Processing */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Natural Language Processing</h3>
                  <p className="text-slate-400 mb-6">
                    Advanced NLP solutions for text analysis, chatbots, and language understanding applications.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Sentiment Analysis</li>
                    <li>• Text Classification</li>
                    <li>• Chatbots & Virtual Assistants</li>
                    <li>• Document Processing</li>
                  </ul>
                </div>

                {/* Computer Vision */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Computer Vision</h3>
                  <p className="text-slate-400 mb-6">
                    Visual intelligence solutions for image recognition, object detection, and automated visual analysis.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Image Classification</li>
                    <li>• Object Detection</li>
                    <li>• Facial Recognition</li>
                    <li>• Quality Control Systems</li>
                  </ul>
                </div>

                {/* Process Automation */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Intelligent Automation</h3>
                  <p className="text-slate-400 mb-6">
                    Streamline business processes with AI-powered automation and workflow optimization.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Workflow Automation</li>
                    <li>• Document Processing</li>
                    <li>• Data Pipeline Automation</li>
                    <li>• Business Process Optimization</li>
                  </ul>
                </div>

                {/* Predictive Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Predictive Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Forecast trends, predict outcomes, and make data-driven decisions with advanced analytics.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Sales Forecasting</li>
                    <li>• Risk Assessment</li>
                    <li>• Market Analysis</li>
                    <li>• Customer Behavior Prediction</li>
                  </ul>
                </div>

                {/* AI Consulting */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">AI Strategy & Consulting</h3>
                  <p className="text-slate-400 mb-6">
                    Expert guidance on AI implementation, strategy development, and technology roadmaps.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• AI Readiness Assessment</li>
                    <li>• Technology Stack Planning</li>
                    <li>• Implementation Roadmaps</li>
                    <li>• ROI Analysis & Optimization</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* Interactive Demos Section */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Try Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI Solutions</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Experience the power of our AI technologies with interactive demonstrations.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 20px 40px -10px rgba(34, 211, 238, 0.2)'
                  }}
                >
                  <MLTrainingDemo />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.2)'
                  }}
                >
                  <NLPAnalysisDemo />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 20px 40px -10px rgba(251, 146, 60, 0.2)'
                  }}
                >
                  <ComputerVisionDemo />
                </motion.div>
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
                Ready to Transform Your Business with AI?
              </motion.h2>
              <motion.p 
                className="text-xl text-slate-400 mb-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Let&apos;s discuss how our AI solutions can drive innovation and growth for your organization.
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
                    Get Started Today
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