'use client';

import { useEffect, useRef } from 'react';

interface ReadingProgressProps {
  /** id of the element whose reading progress is shown (the article body). */
  targetId: string;
}

/**
 * A thin gold line across the top of the viewport that fills as the article
 * body is read. Driven by scroll (one rAF per scroll burst), written straight
 * to the element's transform so React never re-renders for it. Decorative:
 * the table of contents carries the same information for assistive tech.
 */
export default function ReadingProgress({ targetId }: ReadingProgressProps) {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const target = document.getElementById(targetId);
    if (!bar || !target) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the body's top reaches the upper third, 1 when its end is in view.
      const start = rect.top - vh * 0.3;
      const span = Math.max(1, rect.height - vh * 0.7);
      const p = Math.min(1, Math.max(0, -start / span));
      bar.style.transform = `scaleX(${p})`;
      bar.parentElement?.setAttribute('data-state', p > 0 ? 'on' : 'off');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div className="rs-progress" aria-hidden="true" data-state="off">
      <span ref={barRef} />
    </div>
  );
}
