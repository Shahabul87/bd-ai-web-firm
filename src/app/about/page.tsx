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
        <main className="pt-16 md:pt-20">
        <HeroSection />
        <TeamSection />
        <StoryTimeline />
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
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [phrases.length]);
  
  return (
    <section className="py-20 flex flex-col md:flex-row items-center justify-between">
      <div className="md:w-1/2 mb-10 md:mb-0">
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          We Are AI Web Dev Firm
        </motion.h1>
        
        <div className="h-20">
          <motion.p
            key={currentPhraseIndex}
            className="text-2xl md:text-3xl text-purple-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {phrases[currentPhraseIndex]}
          </motion.p>
        </div>
        
        <motion.p 
          className="text-lg text-gray-300 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          We combine cutting-edge AI with expert web development to create digital experiences that transform businesses. Our team of innovators, developers, and designers work together to build solutions that stand out in today&apos;s digital landscape.
        </motion.p>
      </div>
      
      <div className="md:w-1/2 flex justify-center">
        <div className="cube-container">
          <div className="cube">
            <div className="face front bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Innovation</div>
            <div className="face back bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Excellence</div>
            <div className="face right bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Intelligence</div>
            <div className="face left bg-gradient-to-br from-cyan-600 to-teal-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Creativity</div>
            <div className="face top bg-gradient-to-br from-teal-600 to-green-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Passion</div>
            <div className="face bottom bg-gradient-to-br from-green-600 to-lime-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">Growth</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const team = [
    {
      name: "Alex Morgan",
      role: "Founder & CEO",
      image: "/team/alex.jpg",
      bio: "Former AI researcher at MIT with 15+ years of experience in tech leadership.",
      specialty: "AI Strategy & Business Development"
    },
    {
      name: "Jamie Chen",
      role: "CTO",
      image: "/team/jamie.jpg",
      bio: "Full-stack architect who previously led engineering teams at Google and Amazon.",
      specialty: "System Architecture & Performance"
    },
    {
      name: "Sam Wilson",
      role: "Creative Director",
      image: "/team/sam.jpg",
      bio: "Award-winning designer with a background in human-centered design principles.",
      specialty: "UX/UI & Design Systems"
    },
    {
      name: "Robin Taylor",
      role: "AI Lead",
      image: "/team/robin.jpg",
      bio: "PhD in Machine Learning with specialization in generative models.",
      specialty: "Neural Networks & NLP"
    }
  ];
  
  return (
    <section className="py-20">
      <motion.h2 
        className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        The Minds Behind Our Magic
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {team.map((member, index) => (
          <div 
            key={member.name} 
            className="perspective-1000"
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 h-full shadow-lg transform-style-3d duration-500 hover:rotate-y-180"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-center backface-hidden">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 bg-purple-700">
                  {/* Replace with real images when available */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-3xl">{member.name[0]}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-purple-300">{member.role}</p>
              </div>
              
              <div className="text-center absolute inset-0 p-6 rotate-y-180 backface-hidden">
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-sm text-purple-300 mb-4">{member.specialty}</p>
                <p className="text-sm">{member.bio}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoryTimeline() {
  const milestones = [
    {
      year: "2021",
      title: "The Beginning",
      description: "Founded with a vision to bridge the gap between AI innovation and web development."
    },
    {
      year: "2022",
      title: "First Major Client",
      description: "Secured partnership with a Fortune 500 company to build their next-gen web platform."
    },
    {
      year: "2023",
      title: "Team Expansion",
      description: "Grew to a team of 20 developers, designers, and AI specialists across three continents."
    },
    {
      year: "2024",
      title: "Innovation Award",
      description: "Recognized with the Tech Innovator Award for our contributions to AI-powered web development."
    }
  ];
  
  return (
    <section className="py-20">
      <motion.h2 
        className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Journey
      </motion.h2>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-indigo-600"></div>
        
        {milestones.map((milestone, index) => (
          <motion.div 
            key={milestone.year}
            className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className={`w-1/2 px-8 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-bold mb-2 text-purple-300">{milestone.title}</h3>
              <p className="text-gray-300">{milestone.description}</p>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-purple-700 z-10 flex items-center justify-center">
              <span className="text-xl font-bold">{milestone.year}</span>
            </div>
            
            <div className="w-1/2"></div>
          </motion.div>
        ))}
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
    <section className="py-20">
      <motion.h2 
        className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Technology Stack
      </motion.h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            className="perspective-1000"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="transform-style-3d h-40 w-full duration-500 hover:rotate-y-180">
              <div className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 p-6 flex flex-col items-center justify-center shadow-lg">
                <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-indigo-800 to-purple-900 p-6 flex flex-col items-center justify-center shadow-lg">
                <span className="text-sm text-purple-300 mb-2">Category</span>
                <p className="text-lg font-bold">{tech.category}</p>
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
    const interval = setInterval(() => {
      setCurrentValueIndex((prevIndex) => (prevIndex + 1) % values.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [values.length]);
  
  return (
    <section className="py-20">
      <motion.h2 
        className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Our Core Values
      </motion.h2>
      
      <div className="max-w-3xl mx-auto">
        <div className="h-40 overflow-hidden relative">
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
              <h3 className="text-2xl font-bold mb-4 text-center text-purple-300">{value.title}</h3>
              <p className="text-lg text-center text-gray-300">{value.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          {values.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full mx-2 ${
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
    <section className="py-20">
      <motion.h2 
        className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
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
              <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg p-6 w-40 h-20 flex items-center justify-center shadow-lg">
                <p className="font-medium">{client}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
