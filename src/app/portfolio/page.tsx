'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Portfolio items showcasing the 4 AI Agents' work
const portfolioItems = [
  {
    id: 1,
    title: "SaaS Dashboard Platform",
    category: "Web Development",
    agent: "WebForge",
    agentIcon: "🌐",
    description: "Full-stack SaaS platform with real-time analytics, user management, and subscription billing. Built with Next.js and deployed in just 2 weeks.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "PostgreSQL"],
    results: [
      { metric: "Development Time", value: "2 weeks" },
      { metric: "Cost Savings", value: "85%" },
      { metric: "Performance Score", value: "98/100" }
    ],
    gradient: "from-emerald-500 to-cyan-500",
    featured: true
  },
  {
    id: 2,
    title: "Fitness Tracking App",
    category: "Android Development",
    agent: "DroidMaster",
    agentIcon: "📱",
    description: "Native Android app with workout tracking, progress charts, and social features. Material Design 3 with smooth animations and offline support.",
    technologies: ["Kotlin", "Jetpack Compose", "Room DB", "Firebase", "Health Connect"],
    results: [
      { metric: "App Rating", value: "4.8★" },
      { metric: "Downloads", value: "10K+" },
      { metric: "Crash Rate", value: "<0.1%" }
    ],
    gradient: "from-cyan-500 to-blue-500",
    featured: true
  },
  {
    id: 3,
    title: "E-Commerce Analytics Suite",
    category: "Data Analysis",
    agent: "DataMind",
    agentIcon: "📊",
    description: "Comprehensive data pipeline processing 1M+ daily transactions. Automated reporting, customer segmentation, and predictive inventory management.",
    technologies: ["Python", "Pandas", "Apache Airflow", "BigQuery", "dbt"],
    results: [
      { metric: "Processing Speed", value: "10x faster" },
      { metric: "Data Accuracy", value: "99.9%" },
      { metric: "Cost Reduction", value: "60%" }
    ],
    gradient: "from-violet-500 to-purple-500",
    featured: true
  },
  {
    id: 4,
    title: "Real-Time Sales Dashboard",
    category: "Data Visualization",
    agent: "VizCraft",
    agentIcon: "📈",
    description: "Interactive executive dashboard with live KPIs, drill-down reports, and automated PDF exports. Beautiful charts that tell compelling data stories.",
    technologies: ["React", "D3.js", "Chart.js", "WebSocket", "Node.js"],
    results: [
      { metric: "Decision Speed", value: "3x faster" },
      { metric: "User Adoption", value: "95%" },
      { metric: "Report Time", value: "-80%" }
    ],
    gradient: "from-amber-500 to-orange-500",
    featured: true
  },
  {
    id: 5,
    title: "Restaurant Ordering System",
    category: "Web Development",
    agent: "WebForge",
    agentIcon: "🌐",
    description: "Complete online ordering platform with menu management, order tracking, and kitchen display system. Integrated with POS and delivery services.",
    technologies: ["Next.js", "Node.js", "MongoDB", "Stripe", "Twilio"],
    results: [
      { metric: "Orders/Day", value: "500+" },
      { metric: "Revenue Boost", value: "45%" },
      { metric: "Load Time", value: "<1s" }
    ],
    gradient: "from-emerald-500 to-cyan-500",
    featured: false
  },
  {
    id: 6,
    title: "Property Management App",
    category: "Android Development",
    agent: "DroidMaster",
    agentIcon: "📱",
    description: "Android app for landlords to manage properties, track rent payments, handle maintenance requests, and communicate with tenants.",
    technologies: ["Kotlin", "Jetpack Compose", "Firebase", "Google Maps", "Stripe"],
    results: [
      { metric: "Active Users", value: "2K+" },
      { metric: "Time Saved", value: "15hrs/wk" },
      { metric: "Support Tickets", value: "-70%" }
    ],
    gradient: "from-cyan-500 to-blue-500",
    featured: false
  },
  {
    id: 7,
    title: "Supply Chain Intelligence",
    category: "Data Analysis",
    agent: "DataMind",
    agentIcon: "📊",
    description: "ML-powered supply chain optimization analyzing supplier performance, demand forecasting, and inventory levels across 50+ warehouses.",
    technologies: ["Python", "Scikit-learn", "Snowflake", "Apache Kafka", "Tableau"],
    results: [
      { metric: "Inventory Costs", value: "-35%" },
      { metric: "Stockouts", value: "-90%" },
      { metric: "Forecast Accuracy", value: "94%" }
    ],
    gradient: "from-violet-500 to-purple-500",
    featured: false
  },
  {
    id: 8,
    title: "Marketing Performance Hub",
    category: "Data Visualization",
    agent: "VizCraft",
    agentIcon: "📈",
    description: "Unified marketing dashboard consolidating data from 12 platforms. Attribution modeling, campaign performance, and ROI visualization.",
    technologies: ["React", "Plotly", "Python", "Google Analytics API", "Meta API"],
    results: [
      { metric: "ROAS Improvement", value: "+40%" },
      { metric: "Reporting Time", value: "-85%" },
      { metric: "Data Sources", value: "12+" }
    ],
    gradient: "from-amber-500 to-orange-500",
    featured: false
  }
];

const filters = [
  { id: "all", label: "All Projects", icon: "✨" },
  { id: "web", label: "Web Development", icon: "🌐", agent: "WebForge" },
  { id: "android", label: "Android Apps", icon: "📱", agent: "DroidMaster" },
  { id: "data", label: "Data Analysis", icon: "📊", agent: "DataMind" },
  { id: "viz", label: "Visualization", icon: "📈", agent: "VizCraft" }
];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('all');
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => {
        const filter = filters.find(f => f.id === activeFilter);
        return filter?.agent === item.agent;
      });

  const featuredItems = filteredItems.filter(item => item.featured);
  const otherItems = filteredItems.filter(item => !item.featured);

  return (
    <div className="min-h-screen text-white bg-[#0a0a0f]">
      <Header />

      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24"
          style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 25%, #0a0f1a 50%, #0d0d14 75%, #0a0a0f 100%)'
          }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[120px] md:blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] bg-violet-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(90deg, #10b981 1px, transparent 1px), linear-gradient(#10b981 1px, transparent 1px)`,
              backgroundSize: '40px 40px sm:50px 50px md:60px 60px'
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <div className="relative">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-emerald-300">Agent-Built Projects</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6 px-2"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="text-white/90">Our </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                  Portfolio
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Real projects built by our AI agents. From web apps to Android, data pipelines to dashboards -
                see what&apos;s possible when AI does the coding.
              </motion.p>

              {/* Filter Tabs */}
              <motion.div
                className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 min-h-[44px] ${
                      activeFilter === filter.id
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 active:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{filter.icon}</span>
                    <span className="whitespace-nowrap">{filter.label}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredItems.length > 0 && (
          <section
            className="py-12 sm:py-16 md:py-20 relative"
            style={{
              background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)'
            }}
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-emerald-500/5 rounded-full blur-[100px] sm:blur-[120px] md:blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 sm:mb-6">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm text-slate-300">Featured Work</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
                  <span className="text-white/90">Flagship </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                    Projects
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
                  Our most impactful work showcasing the full potential of AI-powered development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatePresence mode="wait">
                  {featuredItems.map((item, index) => (
                    <ProjectCard key={item.id} item={item} index={index} featured />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Other Projects */}
        {otherItems.length > 0 && (
          <section
            className="py-12 sm:py-16 md:py-20 relative"
            style={{
              background: 'linear-gradient(180deg, #0a0f1a 0%, #0d1117 50%, #0a0a0f 100%)'
            }}
          >
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-violet-500/5 rounded-full blur-[100px] sm:blur-[120px] md:blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                  <span className="text-white/90">More </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Success Stories
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                <AnimatePresence mode="wait">
                  {otherItems.map((item, index) => (
                    <ProjectCard key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Process Section */}
        <ProcessSection />

        {/* Stats Section */}
        <StatsSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

// Project Card Component
function ProjectCard({
  item,
  index,
  featured = false
}: {
  item: typeof portfolioItems[0];
  index: number;
  featured?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative rounded-xl sm:rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 h-full">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-br ${item.gradient} ${featured ? 'h-40 sm:h-44 md:h-48' : 'h-28 sm:h-32 md:h-36'} p-4 sm:p-5 md:p-6`}>
          {/* Agent Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-base sm:text-lg">{item.agentIcon}</span>
            <span className="text-[10px] sm:text-xs font-medium text-white">{item.agent}</span>
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs text-white/90">
              {item.category}
            </span>
          </div>

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '16px 16px sm:20px 20px'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className={featured ? 'p-4 sm:p-5 md:p-6' : 'p-4 sm:p-5'}>
          <h3 className={`${featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-bold text-white mb-2 sm:mb-3 group-hover:text-emerald-400 transition-colors`}>
            {item.title}
          </h3>

          <p className={`text-slate-400 ${featured ? 'text-sm sm:text-base mb-4 sm:mb-6' : 'text-xs sm:text-sm mb-3 sm:mb-4'} leading-relaxed`}>
            {item.description}
          </p>

          {/* Technologies */}
          {featured && (
            <div className="mb-4 sm:mb-6">
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Tech Stack</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {item.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-700/50 border border-slate-600/50 text-[10px] sm:text-xs text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className={`grid grid-cols-3 ${featured ? 'gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-700/50' : 'gap-2 sm:gap-2'}`}>
            {item.results.map((result) => (
              <div key={result.metric} className="text-center">
                <div className={`${featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.gradient}`}>
                  {result.value}
                </div>
                <div className={`${featured ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-[10px]'} text-slate-500 leading-tight mt-0.5`}>
                  {result.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Process Section
function ProcessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    {
      step: "01",
      icon: "💬",
      title: "Describe Your Vision",
      description: "Tell us what you need. Our AI agents analyze your requirements and create a detailed blueprint.",
      gradient: "from-emerald-500 to-cyan-500"
    },
    {
      step: "02",
      icon: "🤖",
      title: "Agents Get to Work",
      description: "Our specialized AI agents write production-ready code in parallel, testing as they build.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      step: "03",
      icon: "🔄",
      title: "Rapid Iteration",
      description: "Review, request changes, and watch updates happen in hours - not weeks.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      step: "04",
      icon: "🚀",
      title: "Launch & Support",
      description: "Deploy to production with ongoing monitoring and instant updates when needed.",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)'
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] bg-emerald-500/5 rounded-full blur-[150px] sm:blur-[180px] md:blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 sm:mb-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full" />
            <span className="text-xs sm:text-sm text-slate-300">How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            <span className="text-white/90">From Idea to </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Production
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Our streamlined process gets your project built faster than you thought possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent z-0" />
              )}

              <div className="text-center relative z-10">
                {/* Step number */}
                <div className={`absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-lg`}>
                  {step.step}
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.gradient} bg-opacity-10 flex items-center justify-center text-3xl sm:text-4xl shadow-lg`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  {step.icon}
                </motion.div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 px-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed px-2">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    { value: "50+", label: "Projects Delivered", icon: "📦" },
    { value: "10x", label: "Faster Development", icon: "⚡" },
    { value: "80%", label: "Cost Savings", icon: "💰" },
    { value: "99%", label: "Client Satisfaction", icon: "❤️" }
  ];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 relative"
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0f1a 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-slate-800/30 border border-slate-700/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{stat.icon}</span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 px-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0f1a 0%, #0a0a0f 100%)'
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[150px] sm:blur-[180px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] bg-violet-500/10 rounded-full blur-[100px] sm:blur-[120px] md:blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-2">
            <span className="text-white/90">Your Project </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Could Be Next
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Join the growing list of businesses leveraging AI-powered development.
            Let&apos;s build something amazing together.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/quote"
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                Start Your Project
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/services"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl border border-slate-600/50 text-slate-300 font-medium hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300 min-h-[44px] flex items-center justify-center text-sm sm:text-base"
            >
              View Our Services
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 text-xs sm:text-sm text-slate-500 px-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span>No-Risk Consultation</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              <span>Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
