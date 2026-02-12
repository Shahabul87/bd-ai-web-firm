'use client';

import Link from 'next/link';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const FEATURES = [
  { label: 'AI Code Generator', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' },
  { label: 'AI Code Reviewer', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30' },
  { label: 'AI Code Tester', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
  { label: 'AI Security Checker', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
];

export default function HeroContent() {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`flex flex-col justify-center space-y-6 lg:space-y-8 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Status badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-default)] w-fit">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          AI-Powered Development
        </span>
      </div>

      {/* Headline */}
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
          <span className="text-[var(--foreground)]">Build Software</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            With AI Intelligence
          </span>
        </h1>
        <p className="mt-4 lg:mt-6 text-base lg:text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed">
          Four autonomous AI agents that generate, review, test, and secure your code.
          Ship production-ready software faster than ever.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {FEATURES.map((feature) => (
          <span
            key={feature.label}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${feature.color} transition-colors duration-200`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {feature.label}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <Link
          href="/quote"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          Start Your Project
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[var(--border-default)] text-[var(--foreground)] font-semibold text-sm sm:text-base hover:bg-[var(--surface-elevated)] transition-all duration-300 hover:-translate-y-0.5"
        >
          View Our Work
        </Link>
      </div>
    </div>
  );
}
