'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import { rise, riseStagger, viewportOnce } from '../../design/motion';
import type { CaseStudy } from '#content';

const FILTER_TAGS = ['Web', 'Android', 'iOS'];

/** Client filter + grid. Receives Velite case studies as a prop from the
   server page (Velite content can't be imported into a client component). */
export default function PortfolioGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? caseStudies.filter((cs) =>
        cs.services.some((s) => s.toLowerCase() === activeFilter.toLowerCase())
      )
    : caseStudies;

  const featured = filtered.filter((cs) => cs.featured);
  const others = filtered.filter((cs) => !cs.featured);

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-14">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill label="All" active={activeFilter === null} onClick={() => setActiveFilter(null)} />
          {FILTER_TAGS.map((tag) => (
            <FilterPill
              key={tag}
              label={tag}
              active={activeFilter === tag}
              onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
            />
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <SectionHeader index="fig. 01" eyebrow="Featured work" title="Flagship projects." />
          <motion.div
            className="mt-14 grid gap-6 md:grid-cols-2"
            variants={riseStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {featured.map((cs) => (
              <CaseStudyCard key={cs.slug} caseStudy={cs} featured />
            ))}
          </motion.div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="border-t border-line bg-ink-900">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
            <SectionHeader index="fig. 02" eyebrow="More work" title="Other projects." />
            <motion.div
              className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={riseStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {others.map((cs) => (
                <CaseStudyCard key={cs.slug} caseStudy={cs} />
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            No projects match that filter yet.
          </p>
        </section>
      ) : null}
    </>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 ${
        active
          ? 'border-signal bg-signal text-ink-950'
          : 'border-line text-steel hover:border-signal hover:text-signal'
      }`}
    >
      {label}
    </button>
  );
}

function CaseStudyCard({ caseStudy, featured = false }: { caseStudy: CaseStudy; featured?: boolean }) {
  return (
    <motion.div variants={rise}>
      <Link href={`/portfolio/${caseStudy.slug}`} className="block h-full focus-visible:outline-none">
        <Card interactive className="flex h-full flex-col">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
            <span>{caseStudy.industry}</span>
            <span className="flex gap-2 text-signal">
              {caseStudy.services.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </span>
          </div>

          <h3 className={`mt-6 font-display font-medium text-bone ${featured ? 'text-2xl' : 'text-xl'}`}>
            {caseStudy.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{caseStudy.excerpt}</p>

          {featured ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6">
            {caseStudy.results.map((result) => (
              <div key={result.metric} className="text-center">
                <div className="font-display text-lg font-medium text-signal">{result.value}</div>
                <div className="mt-1 font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-steel">
                  {result.metric}
                </div>
              </div>
            ))}
          </div>

          <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
            Read case study
            <span aria-hidden>→</span>
          </span>
        </Card>
      </Link>
    </motion.div>
  );
}
