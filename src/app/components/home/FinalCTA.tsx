'use client';

import { motion } from 'framer-motion';
import Button from '../../design/ui/Button';
import MonoLabel from '../../design/ui/MonoLabel';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

export default function FinalCTA() {
  return (
    <section className="border-t border-line">
      <div className="blueprint-grid relative bg-ink-950">
        <motion.div
          className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32"
          variants={riseStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={rise}>
            <MonoLabel className="text-signal">● accepting projects</MonoLabel>
          </motion.div>
          <motion.h2
            variants={rise}
            className="mx-auto mt-6 max-w-2xl font-display text-4xl font-medium text-bone sm:text-5xl md:text-6xl"
          >
            Have something to build?
          </motion.h2>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-steel">
            Tell us the brief. We&apos;ll come back with a plan, a timeline, and a fixed estimate —
            usually within two business days.
          </motion.p>
          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button variant="signal" size="lg" href="/contact">
              Start a project
            </Button>
            <Button variant="ghost" size="lg" href="/quote">
              Get an estimate
            </Button>
          </motion.div>
          <motion.p variants={rise} className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-steel">
            or email{' '}
            <a href="mailto:hello@craftsai.org" className="text-bone hover:text-signal">
              hello@craftsai.org
            </a>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
