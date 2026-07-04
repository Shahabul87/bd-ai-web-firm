'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import Pipeline from '../../design/ui/Pipeline';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Pillar {
  index: string;
  title: string;
  blurb: string;
  stages: string[];
  href: string;
  flagship?: boolean;
}

/* The four service pillars. hrefs use the stage-1 fallback routes from nav.ts
   until the dedicated pillar pages ship. */
const PILLARS: Pillar[] = [
  {
    index: '01',
    title: 'AI Agents',
    blurb:
      'Custom agents that plan, write, and ship software — supervised by a senior engineer at every step.',
    stages: ['Brief', 'Plan', 'Build', 'Review', 'Ship'],
    href: '/services',
    flagship: true,
  },
  {
    index: '02',
    title: 'Web Development',
    blurb:
      'Production web apps built by our agents and shipped fast, from marketing sites to full platforms.',
    stages: ['Design', 'Build', 'Test', 'Deploy'],
    href: '/services/web-development',
  },
  {
    index: '03',
    title: 'Mobile Apps',
    blurb:
      'Native iOS and Android apps from one agent workflow — one brief, both platforms.',
    stages: ['Spec', 'Build', 'QA', 'Release'],
    href: '/services/ios-development',
  },
  {
    index: '04',
    title: 'Agent Integration',
    blurb:
      'Wire agents into the tools you already run — CRM, ERP, WhatsApp, and your internal systems.',
    stages: ['Audit', 'Connect', 'Automate', 'Monitor'],
    href: '/services',
  },
];

export default function PillarsGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <SectionHeader
        index="fig. 02"
        eyebrow="What we build"
        title="Four ways we put agents to work."
        description="Every engagement runs on the same idea: agents do the heavy lifting, engineers own the outcome."
      />

      <motion.div
        className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {PILLARS.map((pillar) => (
          <motion.div key={pillar.index} variants={rise}>
            <Link
              href={pillar.href}
              className="group flex h-full flex-col bg-ink-950 p-8 transition-colors duration-150 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                  {pillar.index}
                </span>
                {pillar.flagship ? (
                  <span className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    Flagship
                  </span>
                ) : null}
              </div>

              <h3 className="mt-5 font-display text-2xl font-medium text-bone">
                {pillar.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                {pillar.blurb}
              </p>

              <div className="mt-7 opacity-80 transition-opacity duration-150 group-hover:opacity-100">
                <Pipeline stages={pillar.stages} />
              </div>

              <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                Explore
                <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
