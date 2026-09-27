'use client';

import { Fragment, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import type { HeroData } from './attention/schema';
import { createHeroController } from './attention/heroController';

interface AttentionHeroProps {
  data: HeroData;
  hint: string;
  lede: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

/**
 * The hero renders the COMPLETE headline, lede and buttons on the server. The
 * generation sequence is layered on by the controller after hydration; CSS
 * keeps the words hidden only while scripting is available (see
 * home-attention.css), so crawlers, no-JS and reduced-motion visitors always
 * get the finished hero.
 */
export default function AttentionHero({ data, hint, lede, ctaPrimary, ctaSecondary }: AttentionHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const arcsRef = useRef<SVGSVGElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const candidatesRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const headline = headlineRef.current;
    const arcs = arcsRef.current;
    const caret = caretRef.current;
    const candidates = candidatesRef.current;
    const ledeEl = ledeRef.current;
    const actions = actionsRef.current;
    const hintEl = hintRef.current;
    if (!root || !stage || !headline || !arcs || !caret || !candidates || !ledeEl || !actions || !hintEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controller = createHeroController(
      {
        root,
        stage,
        headline,
        tokens: Array.from(headline.querySelectorAll<HTMLElement>('.tok')),
        arcs,
        caret,
        candidates,
        ledeWords: Array.from(ledeEl.querySelectorAll<HTMLElement>('.lw')),
        actions,
        hint: hintEl,
      },
      data,
      reducedMotion,
    );
    return () => controller.dispose();
  }, [data]);

  const ledeWords = lede.trim().split(/\s+/);

  return (
    <section ref={rootRef} className="attn-hero" id="top" aria-labelledby="attn-headline">
      <div className="attn-wrap">
        <div ref={stageRef} className="attn-stage">
          <svg ref={arcsRef} className="attn-arcs" aria-hidden="true" />
          <h1 ref={headlineRef} id="attn-headline" className="attn-headline" aria-describedby="attn-hint">
            {data.tokens.map((token, i) => (
              <Fragment key={`${token.text}-${i}`}>
                <span className="tok" role="button" tabIndex={0} aria-pressed="false">
                  {token.text}
                </span>
                {i < data.tokens.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </h1>
          <span ref={caretRef} className="attn-caret" aria-hidden="true" />
          <div ref={candidatesRef} className="attn-cands" aria-hidden="true" />
        </div>
        <p ref={hintRef} id="attn-hint" className="attn-hint">
          {hint}
        </p>
        <div className="attn-hero-foot">
          <p ref={ledeRef} className="attn-lede">
            {ledeWords.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                <span className="lw">{word}</span>
                {i < ledeWords.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </p>
          <div ref={actionsRef} className="attn-actions">
            <Link className="attn-btn attn-btn-primary" href="/contact">
              {ctaPrimary}
            </Link>
            <a className="attn-btn attn-btn-secondary" href="#work">
              {ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
