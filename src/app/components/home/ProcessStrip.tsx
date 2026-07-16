'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionHeader from '../../design/ui/SectionHeader';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Step {
  index: string;
  title: string;
  detail: string;
}

export default function ProcessStrip() {
  const t = useTranslations('Home.process');
  /* A real sequence — numbering here encodes order the reader needs. */
  const STEPS = t.raw('steps') as Step[];

  return (
    <section className="border-t border-line bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          {/* `index` is a drafting ornament: it stays English in both locales. */}
          <SectionHeader index="fig. 06" eyebrow={t('eyebrow')} title={t('title')} />
          <Link
            href="/process"
            className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
          >
            {t('fullProcess')}
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
