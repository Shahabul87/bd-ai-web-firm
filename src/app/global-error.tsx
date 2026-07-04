'use client';

import { useEffect } from 'react';

// global-error replaces the ROOT layout when an error is thrown in it, so it
// must render its own <html>/<body> and cannot rely on globals.css/Tailwind.
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
          justifyContent: 'center',
          background: '#0A0C10',
          color: '#EDEEE8',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#D8FF3E',
            }}
          >
            500 / Something broke
          </div>
          <h1 style={{ marginTop: '24px', fontSize: '40px', fontWeight: 500, lineHeight: 1.1 }}>
            Something went wrong.
          </h1>
          <p style={{ marginTop: '16px', color: '#8A919E', lineHeight: 1.6 }}>
            An unexpected error occurred while loading CraftsAI. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '32px',
              padding: '14px 28px',
              background: '#D8FF3E',
              color: '#0A0C10',
              border: 'none',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '14px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
