'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Archivo } from 'next/font/google';
import { motion, useReducedMotion } from 'framer-motion';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/* Hero-local surface colors (spec: Drafting Room direction). Amber is the
   shared --amber token; blue and chalk exist only on this surface. */
const BLUE = '#0D2038';
const CHALK = '#EDEDE3';
const AMBER = '#FFB347';

const DRAW_DURATION = 1.1;

export default function DraftingRoomHero() {
  const t = useTranslations('Home.hero');
  const reduced = useReducedMotion();
  // SSR and first client render both show the 'hidden' frame; the effect
  // starts the draw after mount (instantly completed under reduced motion).
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(true);
  }, []);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (delay: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: reduced
        ? { duration: 0 }
        : {
            pathLength: { delay, duration: DRAW_DURATION, ease: 'easeInOut' as const },
            opacity: { delay, duration: 0.01 },
          },
    }),
  };

  const fade = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      transition: reduced ? { duration: 0 } : { delay, duration: 0.6 },
    }),
  };

  return (
    <section
      className={`${archivo.variable} relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden`}
      style={{ backgroundColor: BLUE, color: CHALK }}
    >
      {/* Drafting-paper grid */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(237,237,227,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(237,237,227,0.055) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />
      {/* Vignette toward the table edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, transparent 40%, rgba(6,16,32,0.55) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <h1
            className="hero-display font-[750] uppercase leading-[1.04] tracking-[-0.01em]"
            style={{ fontVariationSettings: "'wdth' 125", fontSize: 'clamp(2.5rem, 4.6vw, 4.25rem)' }}
          >
            {t('titleLine1')}
            <br />
            {t.rich('titleLine2', {
              accent: (chunks) => <span style={{ color: AMBER }}>{chunks}</span>,
            })}
          </h1>
          <p className="mt-7 max-w-[44ch] text-[17px] leading-[1.65] text-[#EDEDE3]/70">
            {t('lede')}
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link
              href="/contact"
              className="px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              style={{ backgroundColor: AMBER, color: BLUE }}
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/process"
              className="border border-[#EDEDE3]/45 px-7 py-4 font-mono text-xs uppercase tracking-[0.15em] text-[#EDEDE3] transition-colors duration-150 hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
          {/* Drafting ornament: stays English/Latin in both locales by design.
              `lang="en"` keeps the Latin-tuned tracking on Bengali pages. */}
          <p lang="en" className="mt-14 font-mono text-[10px] uppercase tracking-[0.2em] text-[#EDEDE3]/50">
            fig. 01 — agent schematic · sheet 1 of 4 · scale 1:1 · dhaka / worldwide
          </p>
        </div>

        <motion.svg
          viewBox="0 0 560 420"
          fill="none"
          role="img"
          aria-label={t('schematicLabel')}
          className="w-full max-w-[560px] justify-self-center lg:justify-self-end"
          initial="hidden"
          animate={started ? 'visible' : 'hidden'}
        >
          {/* Brief node */}
          <motion.rect variants={draw} custom={0.1} x="30" y="60" width="120" height="72" stroke={CHALK} strokeWidth="1.5" />
          <motion.text variants={fade} custom={0.5} x="90" y="100" fill={CHALK} fontSize="12" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
            BRIEF
          </motion.text>

          {/* Brief → Agent */}
          <motion.path variants={draw} custom={0.7} d="M150 96 H 230" stroke={CHALK} strokeWidth="1.5" />
          <motion.path variants={draw} custom={0.9} d="M222 90 L 232 96 L 222 102" stroke={CHALK} strokeWidth="1.5" />

          {/* Agent node */}
          <motion.circle variants={draw} custom={1.0} cx="300" cy="96" r="62" stroke={CHALK} strokeWidth="1.5" />
          <motion.circle variants={fade} custom={1.7} cx="300" cy="96" r="40" stroke={CHALK} strokeWidth="1" strokeDasharray="4 5" />
          <motion.text variants={fade} custom={1.5} x="300" y="101" fill={CHALK} fontSize="12" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
            AGENT
          </motion.text>

          {/* Agent → outputs */}
          <motion.path variants={draw} custom={1.6} d="M300 158 V 240" stroke={CHALK} strokeWidth="1.5" />
          <motion.path variants={draw} custom={1.8} d="M294 232 L 300 242 L 306 232" stroke={CHALK} strokeWidth="1.5" />

          {/* Website */}
          <motion.rect variants={draw} custom={2.1} x="120" y="250" width="110" height="92" stroke={CHALK} strokeWidth="1.5" />
          <motion.path variants={draw} custom={2.3} d="M120 274 H 230" stroke={CHALK} strokeWidth="1" />
          <motion.text variants={fade} custom={2.6} x="175" y="316" fill={CHALK} fontSize="11" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
            WEBSITE
          </motion.text>

          {/* App */}
          <motion.rect variants={draw} custom={2.2} x="252" y="250" width="60" height="104" rx="10" stroke={CHALK} strokeWidth="1.5" />
          <motion.text variants={fade} custom={2.7} x="282" y="380" fill={CHALK} fontSize="11" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
            APP
          </motion.text>

          {/* Integration */}
          <motion.path variants={draw} custom={2.3} d="M370 262 l 26 -15 26 15 v 30 l -26 15 -26 -15 z" stroke={CHALK} strokeWidth="1.5" />
          <motion.text variants={fade} custom={2.8} x="396" y="330" fill={CHALK} fontSize="11" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
            INTEGRATION
          </motion.text>
          <motion.path variants={draw} custom={2.4} d="M230 296 H 252 M312 296 H 370" stroke={CHALK} strokeWidth="1" />

          {/* Amber dimension marks — annotated last, like a checked drawing */}
          <motion.g variants={fade} custom={3.1}>
            <path d="M30 40 V 28 M150 40 V 28 M30 34 H 150" stroke={AMBER} strokeWidth="1" />
            <text x="90" y="24" fill={AMBER} fontSize="10" textAnchor="middle" className="font-mono" style={{ letterSpacing: '0.14em' }}>
              SPEC 2.4
            </text>
            <path d="M382 96 H 420 M420 90 V 102" stroke={AMBER} strokeWidth="1" />
            <text x="428" y="100" fill={AMBER} fontSize="10" className="font-mono" style={{ letterSpacing: '0.14em' }}>
              R 62.0
            </text>
            <path d="M470 250 V 354 M464 250 H 476 M464 354 H 476" stroke={AMBER} strokeWidth="1" />
            <text x="482" y="306" fill={AMBER} fontSize="10" className="font-mono" style={{ letterSpacing: '0.14em' }}>
              SHIP
            </text>
          </motion.g>
        </motion.svg>
      </div>
    </section>
  );
}
