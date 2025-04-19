'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

// Add CubeAnimation component
const CubeAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cubeRef.current || !isHovered) return;
      
      const rect = cubeRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      setRotation({
        x: y / 10,
        y: -x / 10
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  const services = [
    { name: 'AI Web Dev', color: 'from-blue-500 to-cyan-300' },
    { name: 'Data Analytics', color: 'from-purple-500 to-pink-300' },
    { name: 'AI Agents', color: 'from-green-500 to-emerald-300' },
    { name: 'Marketing', color: 'from-orange-500 to-yellow-300' },
    { name: 'Branding', color: 'from-red-500 to-rose-300' },
    { name: 'Automation', color: 'from-indigo-500 to-violet-300' }
  ];

  return (
    <div 
      className="w-72 h-72 md:w-96 md:h-96 perspective-1000 relative"
      ref={cubeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
    >
      <div 
        className="cube transform-style-3d w-full h-full"
        style={{ 
          transform: isHovered 
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
            : 'rotateX(15deg) rotateY(15deg)',
          transition: isHovered ? 'none' : 'transform 0.5s ease-out'
        }}
      >
        {services.map((service, index) => {
          const faceClass = [
            'front', 'back', 'right', 'left', 'top', 'bottom'
          ][index];
          
          return (
            <div 
              key={index}
              className={`cube-face ${faceClass} bg-gradient-to-br ${service.color} rounded-xl shadow-lg border border-white/20 flex items-center justify-center`}
            >
              <div className="text-center p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{service.name}</h3>
                <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">AI</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-xl opacity-70 animate-pulse"></div>
    </div>
  );
};

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);
  
  return (
    <section ref={ref} className="relative min-h-[calc(100vh-80px)] flex items-center py-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      {/* Abstract shape in background */}
      <div className="absolute -left-60 -top-60 w-[30rem] h-[30rem] bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full filter blur-3xl z-0"></div>
      <div className="absolute -right-40 -bottom-40 w-[30rem] h-[30rem] bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 rounded-full filter blur-3xl z-0"></div>
      
      <FloatingParticles />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 20 
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 relative"
                style={{
                  textShadow: '0 5px 10px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.3)',
                  transform: isVisible ? 'translateZ(0px)' : 'translateZ(-50px)',
                  transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  animation: isVisible ? 'textFloat 5s ease-in-out infinite' : 'none'
                }}
              >
                <span className="inline-block hover:animate-pulse transition-all duration-300 hover:text-blue-300">AI-Powered</span> <span className="inline-block hover:animate-pulse transition-all duration-300 hover:text-cyan-300">Services</span> <span className="inline-block hover:animate-pulse transition-all duration-300 hover:text-purple-300">for</span> <span className="inline-block hover:animate-pulse transition-all duration-300 hover:text-indigo-300">Your</span> <span className="inline-block hover:animate-pulse transition-all duration-300 hover:text-blue-300">Business</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 20 
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Our comprehensive suite of AI solutions is designed to transform your business operations, enhance user experiences, and drive innovation. Discover how our cutting-edge AI services can take your business to the next level.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 20 
              }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/services#explore" 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition transform hover:scale-105 shadow-lg">
                Explore Services
              </Link>
              <Link href="/contact" 
                className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition transform hover:scale-105 shadow-lg">
                Schedule Consultation
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              scale: isVisible ? 1 : 0.9 
            }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex justify-center"
          >
            <CubeAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 