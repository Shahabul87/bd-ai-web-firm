import type { Variants } from 'framer-motion';

/**
 * The complete motion vocabulary (spec §6). Personality: mechanical precision —
 * snap, type, pulse. Never float, bounce, or bloom.
 *
 * Rules:
 * - Only transform/opacity animate.
 * - Infinite loops live in CSS (tokens.css), never here.
 * - Every viewport trigger uses `viewportOnce` — nothing re-triggers on scroll-up.
 * - Reduced motion: framer-motion's `useReducedMotion()` in client components;
 *   components with playback (Terminal, TypeOn) must render their final frame.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Section/child entry: 12px rise + fade, 400ms. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Parent orchestrator: staggers `rise` children by 60ms. */
export const riseStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/** Shared viewport config — fire once, slightly before fully in view. */
export const viewportOnce = { once: true, margin: '-80px' } as const;
