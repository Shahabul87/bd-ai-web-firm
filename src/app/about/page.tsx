'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function AboutPage() {
  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        <main className="pt-16 sm:pt-18 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <SimpleTeamSection />
          <SimpleStorySection />
          <TechnologyStack />
          <ValuesSection />
          <ClientsSection />
        </main>
        <Footer />
      </div>
    </PageBackground>
  );
}

function HeroSection() {
  const phrases = [
    "Driven by intelligence",
    "Crafted with passion",
    "Built for tomorrow",
    "Designed with purpose"
  ];
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  
  useEffect(() => {
    let isActive = true;
    let currentTimeout: NodeJS.Timeout;
    
    const nextPhrase = () => {
      if (!isActive) return;
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      currentTimeout = setTimeout(nextPhrase, 3000);
    };
    
    currentTimeout = setTimeout(nextPhrase, 3000);
    
    return () => {
      isActive = false;
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [phrases.length]);
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          We Are Inshyra
        </motion.h1>
        
        <div className="h-16 sm:h-20 mb-4 sm:mb-6">
          <motion.p
            key={currentPhraseIndex}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {phrases[currentPhraseIndex]}
          </motion.p>
        </div>
        
        <motion.p 
          className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          We combine cutting-edge AI with expert web development to create digital experiences that transform businesses. Our team of innovators, developers, and designers work together to build solutions that stand out in today&apos;s digital landscape.
        </motion.p>
      </div>
      
        <div className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0">
          <div className="perspective-1000">
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80 animate-spin-slow transform-style-3d">
              <div className="cube-face front bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                Innovation
              </div>
              <div className="cube-face back bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                Excellence
              </div>
              <div className="cube-face right bg-gradient-to-br from-purple-700 to-pink-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                Future
              </div>
              <div className="cube-face left bg-gradient-to-br from-cyan-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                AI
              </div>
              <div className="cube-face top bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                Web
              </div>
              <div className="cube-face bottom bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl shadow-2xl">
                Tech
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SimpleTeamSection() {
  const team = [
    { name: "Alex Morgan", role: "Founder & CEO", initial: "A" },
    { name: "Jamie Chen", role: "CTO", initial: "J" },
    { name: "Sam Wilson", role: "Creative Director", initial: "S" },
    { name: "Robin Taylor", role: "AI Lead", initial: "R" }
  ];
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Our Team
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {team.map((member) => (
          <div key={member.name} className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl font-bold">{member.initial}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{member.name}</h3>
            <p className="text-sm sm:text-base text-purple-300">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimpleStorySection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Our Story
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center hover:bg-slate-800/70 transition-colors duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">2021</div>
          <h3 className="text-base sm:text-lg font-bold mb-2">Founded</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Inshyra started with a vision to bridge AI and web development</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center hover:bg-slate-800/70 transition-colors duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">2022</div>
          <h3 className="text-base sm:text-lg font-bold mb-2">First Client</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Secured partnership with Fortune 500 company</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center hover:bg-slate-800/70 transition-colors duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-2">2023</div>
          <h3 className="text-base sm:text-lg font-bold mb-2">Team Growth</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Expanded to 20+ specialists across 3 continents</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl text-center hover:bg-slate-800/70 transition-colors duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">2024</div>
          <h3 className="text-base sm:text-lg font-bold mb-2">Innovation Award</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Recognized for AI-powered web development</p>
        </div>
      </div>
    </section>
  );
}

function TechnologyStack() {
  const technologies = [
    { name: "React & Next.js", category: "Frontend" },
    { name: "TensorFlow & PyTorch", category: "AI/ML" },
    { name: "Node.js & Express", category: "Backend" },
    { name: "MongoDB & PostgreSQL", category: "Database" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "AWS & Google Cloud", category: "Infrastructure" },
    { name: "Docker & Kubernetes", category: "DevOps" },
    { name: "OpenAI & Hugging Face", category: "AI Services" }
  ];
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Technology Stack
      </motion.h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            className="perspective-1000"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="transform-style-3d h-32 sm:h-36 lg:h-40 w-full transition-all duration-700 hover:rotate-y-180">
              <div className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center shadow-lg">
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-center leading-tight">{tech.name}</h3>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-indigo-800 to-purple-900 p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center shadow-lg">
                <span className="text-xs sm:text-sm text-purple-300 mb-1 sm:mb-2">Category</span>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-center">{tech.category}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    {
      title: "Innovation",
      description: "We push boundaries and explore new technologies to create cutting-edge solutions."
    },
    {
      title: "Quality",
      description: "We're committed to excellence in every line of code and pixel of design."
    },
    {
      title: "Collaboration",
      description: "We believe the best solutions come from diverse teams working together."
    },
    {
      title: "Impact",
      description: "We measure our success by the positive difference we make for our clients."
    }
  ];
  
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  
  useEffect(() => {
    let isActive = true;
    let currentTimeout: NodeJS.Timeout;
    
    const nextValue = () => {
      if (!isActive) return;
      setCurrentValueIndex((prevIndex) => (prevIndex + 1) % values.length);
      currentTimeout = setTimeout(nextValue, 4000);
    };
    
    currentTimeout = setTimeout(nextValue, 4000);
    
    return () => {
      isActive = false;
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [values.length]);
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Core Values
      </motion.h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="h-32 sm:h-36 lg:h-40 overflow-hidden relative">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="absolute w-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: currentValueIndex === index ? 1 : 0,
                y: currentValueIndex === index ? 0 : 50
              }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center text-purple-300">{value.title}</h3>
              <p className="text-sm sm:text-base lg:text-lg text-center text-gray-300 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          {values.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-1 sm:mx-2 transition-colors duration-300 ${
                currentValueIndex === index ? 'bg-purple-500' : 'bg-purple-900'
              }`}
              onClick={() => setCurrentValueIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientsSection() {
  const clients = [
    "TechCorp", "Innovate Inc", "Digital Solutions", "Future Systems", 
    "AI Enterprise", "Smart Solutions", "WebWizards", "CloudNine"
  ];
  
  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Trusted By
      </motion.h2>
      
      <div className="overflow-hidden">
        <div className="flex items-center client-scroll">
          {[...clients, ...clients].map((client, index) => (
            <div 
              key={`${client}-${index}`}
              className="flex-shrink-0 px-8"
            >
              <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg p-3 sm:p-4 lg:p-6 w-32 h-16 sm:w-36 sm:h-18 lg:w-40 lg:h-20 flex items-center justify-center shadow-lg">
                <p className="font-medium text-xs sm:text-sm lg:text-base text-center">{client}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
