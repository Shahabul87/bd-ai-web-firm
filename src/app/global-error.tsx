'use client';

import { useEffect } from 'react';

// global-error replaces the ROOT layout when an error is thrown in it, so it
// must render its own <html>/<body> and cannot rely on globals.css, next/font
// or the intl provider. Everything below is inline and dependency-free; the
// palette mirrors the design tokens (forest / parchment / sage / gold / rose)
// and the serif falls back to the system's, so it still reads as CraftsAI.
const C = {
  forest: '#0E2621',
  raised: '#143129',
  parchment: '#ECE9E0',
  sage: '#9FB3AA',
  gold: '#F2B33D',
  rose: '#E87A8C',
  rule: 'rgba(236, 233, 224, 0.13)',
  faint: 'rgba(236, 233, 224, 0.28)',
};
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif';

const button = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '52px',
  padding: '0 24px',
  borderRadius: '6px',
  font: `600 16px/1 ${SANS}`,
  textDecoration: 'none',
  cursor: 'pointer',
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: C.forest,
          color: C.parchment,
          fontFamily: SANS,
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <main style={{ maxWidth: '40rem', margin: '0 auto', width: '100%' }}>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0,
              fontSize: '14px',
              fontWeight: 500,
              color: C.sage,
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose, flex: 'none' }}
            />
            Error
          </p>
          <h1
            style={{
              margin: '24px 0 0',
              font: `400 clamp(40px, 7vw, 84px)/1.04 ${SERIF}`,
              letterSpacing: '-0.015em',
            }}
          >
            Something failed its eval.
          </h1>
          <p style={{ margin: '24px 0 0', fontSize: '18px', lineHeight: 1.6, color: C.sage }}>
            A step on our side didn&apos;t pass while loading CraftsAI. It isn&apos;t something you
            did. Try again, or head home and come back in a moment.
          </p>
          {error.digest ? (
            <p style={{ margin: '16px 0 0', fontSize: '12px', color: C.sage }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '36px' }}>
            <button
              type="button"
              onClick={reset}
              style={{ ...button, border: 'none', background: C.gold, color: '#1a1206' }}
            >
              Try again
            </button>
            {/* A full document load is the point: the root layout just crashed, so
                start clean rather than client-navigating inside the broken tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ ...button, color: C.parchment, boxShadow: `inset 0 0 0 1px ${C.faint}` }}>
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
