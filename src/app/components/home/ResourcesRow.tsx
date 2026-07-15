'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Resource {
  type: string;
  title: string;
  readTime: string;
  href: string;
}

const RESOURCES: Resource[] = [
  {
    type: 'Blog',
    title: 'How AI agents are changing software development in 2026',
    readTime: '5 min',
    href: '/resources/blog/ai-agents-software-development',
  },
  {
    type: 'Case study',
    title: 'How TaxoMind reached 10× faster content generation',
    readTime: '8 min',
    href: '/resources/case-studies/taxomind',
  },
  {
    type: 'Guide',
    title: 'The complete guide to AI-powered app development',
    readTime: '12 min',
    href: '/resources/guides/ai-powered-development',
  },
];

export default function ResourcesRow() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader index="fig. 07" eyebrow="Field notes" title="What we're writing about." />
        <Link
          href="/resources"
          className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
        >
          All resources →
        </Link>
      </div>

      <motion.div
        className="mt-14 divide-y divide-line border-y border-line"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {RESOURCES.map((resource) => (
          <motion.div key={resource.href} variants={rise}>
            <Link
              href={resource.href}
              className="group grid gap-2 py-6 transition-colors duration-150 hover:bg-ink-900 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6 sm:px-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                {resource.type}
              </span>
              <span className="text-base text-bone transition-colors duration-150 group-hover:text-signal">
                {resource.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                {resource.readTime}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
