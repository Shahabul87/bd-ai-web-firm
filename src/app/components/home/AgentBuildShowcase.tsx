'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionHeader from '../../design/ui/SectionHeader';
import MonoLabel from '../../design/ui/MonoLabel';
import Terminal from '../../design/ui/Terminal';
import type { TerminalLine } from '../../design/ui/Terminal';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface Note {
  label: string;
  body: string;
}

export default function AgentBuildShowcase() {
  const t = useTranslations('Home.build');
  const BUILD = t.raw('terminal') as TerminalLine[];
  const NOTES = t.raw('notes') as Note[];

  return (
    <section className="border-y border-line bg-ink-900">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
        <motion.div
          variants={riseStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={rise}>
            {/* `index` is a drafting ornament: it stays English in both locales. */}
            <SectionHeader
              index="fig. 03"
              eyebrow={t('eyebrow')}
              title={t('title')}
              description={t('description')}
            />
          </motion.div>

          <motion.dl variants={rise} className="mt-10 space-y-6">
            {NOTES.map((note) => (
              <div key={note.label}>
                <MonoLabel as="dt" className="text-signal">{note.label}</MonoLabel>
                <dd className="mt-2 max-w-md text-sm leading-relaxed text-steel">
                  {note.body}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <Terminal lines={BUILD} title={t('terminalTitle')} />
        </motion.div>
      </div>
    </section>
  );
}
