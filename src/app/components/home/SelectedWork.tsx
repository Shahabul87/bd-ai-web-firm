'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Project {
  sector: string;
  platform: string;
  name: string;
  outcome: string;
  href: string;
}

const PROJECTS: Project[] = [
  {
    sector: 'EdTech',
    platform: 'Web',
    name: 'TaxoMind',
    outcome: "An AI learning platform built on Bloom's Taxonomy for personalized education.",
    href: '/portfolio/taxomind',
  },
  {
    sector: 'FinTech',
    platform: 'Android',
    name: 'FinCoach AI',
    outcome: 'An AI financial coach that helps people build better money habits, day by day.',
    href: '/portfolio/fincoach-ai',
  },
  {
    sector: 'EdTech',
    platform: 'Android',
    name: 'MathPhysics',
    outcome: 'Interactive math and physics practice for grade 9–12 students.',
    href: '/portfolio/mathphysics',
  },
];

export default function SelectedWork() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          index="fig. 05"
          eyebrow="Selected work"
          title="Software our agents have shipped."
        />
        <Link
          href="/portfolio"
          className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
        >
          All work →
        </Link>
      </div>

      <motion.div
        className="mt-14 grid gap-6 md:grid-cols-3"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {PROJECTS.map((project) => (
          <motion.div key={project.name} variants={rise}>
            <Link href={project.href} className="block h-full focus-visible:outline-none">
              <Card interactive className="flex h-full flex-col">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                  <span>{project.sector}</span>
                  <span className="text-signal">{project.platform}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-medium text-bone">
                  {project.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {project.outcome}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                  Read case study
                  <span aria-hidden>→</span>
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
