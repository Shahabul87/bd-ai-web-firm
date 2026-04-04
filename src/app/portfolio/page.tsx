'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { caseStudies } from '#content';
import type { CaseStudy } from '#content';
import { FilterBar } from '../components/ui';

const filterTags = ['Web', 'Android', 'iOS'];

const industryGradients: Record<string, string> = {
  EdTech: 'from-indigo-500 to-cyan-500',
  FinTech: 'from-emerald-500 to-teal-500',
  Healthcare: 'from-rose-500 to-pink-500',
  default: 'from-purple-500 to-violet-500',
};

function getGradient(industry: string): string {
  return industryGradients[industry] ?? industryGradients.default;
}

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const filteredStudies = activeFilter
    ? caseStudies.filter((cs: CaseStudy) =>
        cs.services.some(
          (s: string) => s.toLowerCase() === activeFilter.toLowerCase()
        )
      )
    : caseStudies;

  const featuredStudies = filteredStudies.filter(
    (cs: CaseStudy) => cs.featured
  );
  const otherStudies = filteredStudies.filter(
    (cs: CaseStudy) => !cs.featured
  );

  return (
    <PageLayout>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 50%, var(--background) 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[150px] opacity-20"
            style={{ background: 'var(--brand-primary)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full blur-[120px] opacity-15"
            style={{ background: 'var(--brand-secondary)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full border backdrop-blur-sm mb-6 sm:mb-8"
              style={{
                borderColor: 'var(--brand-primary)',
                background: 'var(--brand-primary)' + '08',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                  style={{ background: 'var(--brand-primary)' }}
                />
                <div
                  className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-ping"
                  style={{ background: 'var(--brand-primary)' }}
                />
              </div>
              <span
                className="text-xs sm:text-sm font-medium"
                style={{ color: 'var(--brand-primary)' }}
              >
                Case Studies
              </span>
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
              Real projects built by our team. From web apps to Android -
              see what&apos;s possible when AI does the coding.
            </motion.p>

            {/* Filter Bar */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <FilterBar
                tags={filterTags}
                activeTag={activeFilter}
                onTagSelect={setActiveFilter}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredStudies.length > 0 && (
        <section
          className="py-12 sm:py-16 md:py-20 relative"
          style={{
            background:
              'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 50%, var(--background) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border mb-4 sm:mb-6"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--brand-success)' }}
                />
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Featured Work
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
                <span style={{ color: 'var(--foreground)' }}>Flagship </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                  Projects
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <AnimatePresence mode="wait">
                {featuredStudies.map((cs: CaseStudy, index: number) => (
                  <CaseStudyCard
                    key={cs.slug}
                    caseStudy={cs}
                    index={index}
                    featured
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherStudies.length > 0 && (
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
                {otherStudies.map((cs: CaseStudy, index: number) => (
                  <CaseStudyCard
                    key={cs.slug}
                    caseStudy={cs}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      <StatsSection />
      <CTASection />
    </PageLayout>
  );
}

function CaseStudyCard({
  caseStudy,
  index,
  featured = false,
}: {
  caseStudy: CaseStudy;
  index: number;
  featured?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const gradient = getGradient(caseStudy.industry);

  return (
    <motion.div
      ref={ref}
      className="group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/portfolio/${caseStudy.slug}`}>
        <div
          className="relative rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-500 hover:shadow-lg h-full"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {/* Gradient header */}
          <div
            className={`relative bg-gradient-to-br ${gradient} ${
              featured ? 'h-40 sm:h-44 md:h-48' : 'h-28 sm:h-32 md:h-36'
            } p-4 sm:p-5 md:p-6`}
          >
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
              <span className="text-[10px] sm:text-xs font-medium text-white">
                {caseStudy.industry}
              </span>
            </div>
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5">
              {caseStudy.services.map((s: string) => (
                <span
                  key={s}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs text-white/90 capitalize"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className={featured ? 'p-4 sm:p-5 md:p-6' : 'p-4 sm:p-5'}>
            <h3
              className={`${
                featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              } font-bold mb-2 sm:mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`}
              style={{ color: 'var(--foreground)' }}
            >
              {caseStudy.title}
            </h3>
            <p
              className={`${
                featured
                  ? 'text-sm sm:text-base mb-4 sm:mb-6'
                  : 'text-xs sm:text-sm mb-3 sm:mb-4'
              } leading-relaxed`}
              style={{ color: 'var(--text-secondary)' }}
            >
              {caseStudy.excerpt}
            </p>

            {/* Tags */}
            {featured && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {caseStudy.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border text-[10px] sm:text-xs"
                    style={{
                      background: 'var(--surface-elevated)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Results */}
            <div
              className={`grid grid-cols-3 ${
                featured
                  ? 'gap-3 sm:gap-4 pt-4 sm:pt-6 border-t'
                  : 'gap-2 sm:gap-2'
              }`}
              style={
                featured
                  ? { borderColor: 'var(--card-border)' }
                  : undefined
              }
            >
              {caseStudy.results.map(
                (result: { metric: string; value: string }) => (
                  <div key={result.metric} className="text-center">
                    <div
                      className={`${
                        featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                      } font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
                    >
                      {result.value}
                    </div>
                    <div
                      className={`${
                        featured
                          ? 'text-[10px] sm:text-xs'
                          : 'text-[9px] sm:text-[10px]'
                      } leading-tight mt-0.5`}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {result.metric}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Link hint */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500 dark:text-indigo-400 group-hover:gap-2 transition-all">
                View case study
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    { value: '50+', label: 'Projects Delivered', icon: '📦' },
    { value: '10x', label: 'Faster Development', icon: '⚡' },
    { value: '80%', label: 'Cost Savings', icon: '💰' },
    { value: '99%', label: 'Client Satisfaction', icon: '❤️' },
  ];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 relative"
      style={{
        background:
          'linear-gradient(180deg, var(--background) 0%, var(--surface-elevated) 100%)',
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
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">
                {stat.icon}
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div
                className="text-xs sm:text-sm px-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </div>
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
        background:
          'linear-gradient(180deg, var(--surface-elevated) 0%, var(--background) 100%)',
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
          <p
            className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join the growing list of businesses leveraging AI-powered
            development. Let&apos;s build something amazing together.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/quote"
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg sm:rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                Start Your Project
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl border font-medium transition-all duration-300 hover:shadow-md min-h-[44px] flex items-center justify-center text-sm sm:text-base"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              View Our Services
            </Link>
          </div>

          <div
            className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 text-xs sm:text-sm px-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--brand-primary)' }}
              />
              <span>No-Risk Consultation</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--brand-accent)' }}
              />
              <span>Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--brand-secondary)' }}
              />
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
