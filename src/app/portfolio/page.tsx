'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    gradient: "from-indigo-500 to-cyan-500",
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
    gradient: "from-cyan-500 to-violet-500",
    featured: true
  },
  {
    id: 3,
    title: "E-Commerce Platform",
    category: "Web Development",
    agent: "WebForge",
    agentIcon: "🌐",
    description: "Modern e-commerce platform with product management, cart system, payment integration, and admin dashboard. Built for scale with server-side rendering.",
    technologies: ["Next.js", "Node.js", "Stripe", "MongoDB", "Cloudinary"],
    results: [
      { metric: "Load Time", value: "<1s" },
      { metric: "Revenue Boost", value: "45%" },
      { metric: "Conversion Rate", value: "+32%" }
    ],
    gradient: "from-indigo-500 to-cyan-500",
    featured: true
  },
  {
    id: 4,
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
    gradient: "from-cyan-500 to-violet-500",
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
    gradient: "from-indigo-500 to-cyan-500",
    featured: false
  },
  {
    id: 6,
    title: "Task Management App",
    category: "Android Development",
    agent: "DroidMaster",
    agentIcon: "📱",
    description: "Productivity app with task boards, team collaboration, push notifications, and offline sync. Clean Material You design with gesture navigation.",
    technologies: ["Kotlin", "Jetpack Compose", "Room DB", "WorkManager", "Firebase"],
    results: [
      { metric: "App Rating", value: "4.7★" },
      { metric: "Daily Active", value: "5K+" },
      { metric: "Retention", value: "68%" }
    ],
    gradient: "from-cyan-500 to-violet-500",
    featured: false
  }
];

const filters = [
  { id: "all", label: "All Projects", icon: "✨" },
  { id: "web", label: "Web Development", icon: "🌐", agent: "WebForge" },
  { id: "android", label: "Android Apps", icon: "📱", agent: "DroidMaster" }
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
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header />

      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24"
          style={{
            background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)'
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[150px] opacity-20" style={{ background: 'var(--brand-primary)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: 'var(--brand-secondary)' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full border backdrop-blur-sm mb-6 sm:mb-8"
                style={{ borderColor: 'var(--brand-primary)', background: 'var(--brand-primary)' + '08' }}
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <div className="relative">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                  <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-ping" style={{ background: 'var(--brand-primary)' }} />
                </div>
                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>Agent-Built Projects</span>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6 px-2"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span style={{ color: 'var(--foreground)' }}>Our </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                  Portfolio
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Real projects built by our AI agents. From web apps to Android -
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
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                        : ''
                    }`}
                    style={activeFilter !== filter.id ? { background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' } : undefined}
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
              background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 50%, var(--background) 100%)'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border mb-4 sm:mb-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ background: 'var(--brand-success)' }} />
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Featured Work</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
                  <span style={{ color: 'var(--foreground)' }}>Flagship </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                    Projects
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
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
          <section className="py-12 sm:py-16 md:py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                  <span style={{ color: 'var(--foreground)' }}>More </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                    Success Stories
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                <AnimatePresence mode="wait">
                  {otherItems.map((item, index) => (
                    <ProjectCard key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        <StatsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

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
      <div className="relative rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-500 hover:shadow-lg h-full" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-br ${item.gradient} ${featured ? 'h-40 sm:h-44 md:h-48' : 'h-28 sm:h-32 md:h-36'} p-4 sm:p-5 md:p-6`}>
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-base sm:text-lg">{item.agentIcon}</span>
            <span className="text-[10px] sm:text-xs font-medium text-white">{item.agent}</span>
          </div>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs text-white/90">
              {item.category}
            </span>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '16px 16px'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className={featured ? 'p-4 sm:p-5 md:p-6' : 'p-4 sm:p-5'}>
          <h3 className={`${featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-bold mb-2 sm:mb-3 transition-colors`} style={{ color: 'var(--foreground)' }}>
            {item.title}
          </h3>
          <p className={`${featured ? 'text-sm sm:text-base mb-4 sm:mb-6' : 'text-xs sm:text-sm mb-3 sm:mb-4'} leading-relaxed`} style={{ color: 'var(--text-secondary)' }}>
            {item.description}
          </p>

          {featured && (
            <div className="mb-4 sm:mb-6">
              <div className="text-[10px] sm:text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Tech Stack</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {item.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border text-[10px] sm:text-xs"
                    style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`grid grid-cols-3 ${featured ? 'gap-3 sm:gap-4 pt-4 sm:pt-6 border-t' : 'gap-2 sm:gap-2'}`} style={featured ? { borderColor: 'var(--card-border)' } : undefined}>
            {item.results.map((result) => (
              <div key={result.metric} className="text-center">
                <div className={`${featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.gradient}`}>
                  {result.value}
                </div>
                <div className={`${featured ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-[10px]'} leading-tight mt-0.5`} style={{ color: 'var(--text-secondary)' }}>
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
        background: 'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 100%)'
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
              className="text-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{stat.icon}</span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm px-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--surface-elevated) 0%, var(--background) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-2">
            <span style={{ color: 'var(--foreground)' }}>Your Project </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              Could Be Next
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Join the growing list of businesses leveraging AI-powered development.
            Let&apos;s build something amazing together.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/quote"
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg sm:rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                Start Your Project
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl border font-medium transition-all duration-300 hover:shadow-md min-h-[44px] flex items-center justify-center text-sm sm:text-base"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              View Our Services
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 text-xs sm:text-sm px-4" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
              <span>No-Risk Consultation</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
              <span>Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-secondary)' }} />
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
