'use client';

import { motion } from 'framer-motion';
import Button from '../../design/ui/Button';
import MonoLabel from '../../design/ui/MonoLabel';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface CTABandProps {
  title?: string;
  lede?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/** Reusable closing CTA for inner pages — blueprint grid on ink. */
export default function CTABand({
  title = 'Have something to build?',
  lede = "Tell us the brief. We'll come back with a plan, a timeline, and a fixed estimate — usually within two business days.",
  primaryLabel = 'Start a project',
  primaryHref = '/contact',
  secondaryLabel = 'Get an estimate',
  secondaryHref = '/quote',
}: CTABandProps) {
  return (
    <section className="border-t border-line">
      <div className="blueprint-grid bg-ink-950">
        <motion.div
          className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-28"
          variants={riseStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={rise}>
            <MonoLabel className="text-signal">● accepting projects</MonoLabel>
          </motion.div>
          <motion.h2 variants={rise} className="mx-auto mt-6 max-w-2xl font-display text-3xl font-medium text-bone sm:text-4xl md:text-5xl">
            {title}
          </motion.h2>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-steel">
            {lede}
          </motion.p>
          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button variant="signal" size="lg" href={primaryHref}>
              {primaryLabel}
            </Button>
            <Button variant="ghost" size="lg" href={secondaryHref}>
              {secondaryLabel}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
