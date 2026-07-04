import type { ReactNode } from 'react';

interface PageHeroProps {
  /** Mono breadcrumb / eyebrow, e.g. "Services / 02". */
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional actions (Buttons) rendered under the lede. */
  children?: ReactNode;
}

const BLUE = '#0D2038';
const CHALK = '#EDEDE3';
const AMBER = '#FFB347';

/**
 * The Drafting Room signature band, reused as the hero of every inner page.
 * Mirrors the homepage hero surface (drafting-blue + chalk grid) so the whole
 * site reads as one studio. Headlines use the system display face (Space
 * Grotesk); Archivo Expanded stays reserved for the homepage hero.
 */
export default function PageHero({ eyebrow, title, lede, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line" style={{ backgroundColor: BLUE, color: CHALK }}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(237,237,227,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(237,237,227,0.055) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 75% 30%, transparent 45%, rgba(6,16,32,0.5) 100%)' }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: 'rgba(237,237,227,0.72)' }}>
            {lede}
          </p>
        ) : null}
        {children ? <div className="mt-9 flex flex-wrap gap-3.5">{children}</div> : null}
      </div>
    </section>
  );
}
