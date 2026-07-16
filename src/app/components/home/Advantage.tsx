'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

const BLUE = '#0D2038';
const CHALK = '#EDEDE3';
const AMBER = '#FFB347';

interface Row {
  label: string;
  traditional: string;
  crafts: string;
}

/* The Drafting Room signature band — a blueprint comparison sheet. The one
   place on the page (besides the hero) that uses the drafting-blue surface. */
export default function Advantage() {
  const t = useTranslations('Home.advantage');
  const ROWS = t.raw('rows') as Row[];

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: BLUE, color: CHALK }}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(237,237,227,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(237,237,227,0.055) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Drafting ornament: stays English/Latin in both locales by design.
            `lang="en"` keeps the Latin-tuned tracking on Bengali pages. */}
        <motion.p lang="en" variants={rise} className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>
          fig. 04 — comparison sheet
        </motion.p>
        <motion.h2
          variants={rise}
          className="mt-4 max-w-2xl font-display text-3xl font-medium sm:text-4xl md:text-5xl"
        >
          {t('title')}
        </motion.h2>

        <motion.div variants={rise} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(237,237,227,0.25)' }}>
                <th className="py-3 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.18em]" style={{ color: 'rgba(237,237,227,0.55)' }}>
                  {t('colSpec')}
                </th>
                <th className="py-3 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.18em]" style={{ color: 'rgba(237,237,227,0.55)' }}>
                  {t('colTraditional')}
                </th>
                <th className="py-3 font-mono text-[10px] font-normal uppercase tracking-[0.18em]" style={{ color: AMBER }}>
                  {t('colCrafts')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b" style={{ borderColor: 'rgba(237,237,227,0.12)' }}>
                  <td className="py-4 pr-4 font-mono text-xs uppercase tracking-[0.14em]" style={{ color: 'rgba(237,237,227,0.7)' }}>
                    {row.label}
                  </td>
                  <td className="py-4 pr-4 text-sm" style={{ color: 'rgba(237,237,227,0.6)' }}>
                    {row.traditional}
                  </td>
                  <td className="py-4 text-sm font-medium" style={{ color: AMBER }}>
                    {row.crafts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p variants={rise} className="mt-8 max-w-xl text-sm leading-relaxed" style={{ color: 'rgba(237,237,227,0.65)' }}>
          {t('footnote')}
        </motion.p>
      </motion.div>
    </section>
  );
}
