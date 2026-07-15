'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Step {
  index: string;
  title: string;
  detail: string;
}

/* A real sequence — numbering here encodes order the reader needs. */
const STEPS: Step[] = [
  { index: '01', title: 'Discover', detail: 'Free consultation to scope the problem.' },
  { index: '02', title: 'Plan', detail: 'Written scope, estimate, and timeline.' },
  { index: '03', title: 'Build', detail: 'Agents write; engineers review.' },
  { index: '04', title: 'Test', detail: 'Automated checks plus human QA.' },
  { index: '05', title: 'Launch', detail: 'Deploy, then ongoing support.' },
];

export default function ProcessStrip() {
  return (
    <section className="border-t border-line bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader index="fig. 06" eyebrow="How we work" title="Five steps, start to ship." />
          <Link
            href="/process"
            className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
          >
            The full process →
          </Link>
        </div>

        <motion.ol
          className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-5"
          variants={riseStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {STEPS.map((step) => (
            <motion.li key={step.index} variants={rise} className="bg-ink-950 p-6">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                {step.index}
              </span>
              <h3 className="mt-4 font-display text-lg font-medium text-bone">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{step.detail}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
