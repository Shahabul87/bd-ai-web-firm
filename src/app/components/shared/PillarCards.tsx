'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Pipeline from '../../design/ui/Pipeline';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

export interface Pillar {
  index: string;
  /** Group key within the `PillarCards` namespace; holds title, blurb and stages. */
  key: string;
  /** Stage keys within this pillar's group, in render order. */
  stageKeys: string[];
  href: string;
  flagship?: boolean;
}

/* The four service pillars. hrefs use the stage-1 fallback routes from nav.ts
   until dedicated pillar pages ship. Single source of truth for homepage +
   /services. Copy lives in the `PillarCards` namespace. */
export const PILLARS: Pillar[] = [
  {
    index: '01',
    key: 'aiAgents',
    stageKeys: ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'],
    href: '/services',
    flagship: true,
  },
  {
    index: '02',
    key: 'webDevelopment',
    stageKeys: ['stage1', 'stage2', 'stage3', 'stage4'],
    href: '/services/web-development',
  },
  {
    index: '03',
    key: 'mobileApps',
    stageKeys: ['stage1', 'stage2', 'stage3', 'stage4'],
    href: '/services/ios-development',
  },
  {
    index: '04',
    key: 'agentIntegration',
    stageKeys: ['stage1', 'stage2', 'stage3', 'stage4'],
    href: '/services',
  },
];

export default function PillarCards() {
  const t = useTranslations('PillarCards');

  return (
    <motion.div
      className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2"
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
                  {t('flagship')}
                </span>
              ) : null}
            </div>

            <h3 className="mt-5 font-display text-2xl font-medium text-bone">
              {t(`${pillar.key}.title`)}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {t(`${pillar.key}.blurb`)}
            </p>

            <div className="mt-7 opacity-80 transition-opacity duration-150 group-hover:opacity-100">
              <Pipeline stages={pillar.stageKeys.map((s) => t(`${pillar.key}.${s}`))} />
            </div>

            <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
              {t('explore')}
              <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
