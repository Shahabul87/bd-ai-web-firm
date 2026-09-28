import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Instrument_Serif, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';

// Global 404 for URLs matching NO route group. Only reachable for paths the
// i18n middleware matcher deliberately skips (anything containing a dot, e.g.
// /foo.txt) plus misses under /portal and /api. Bare and locale-prefixed
// marketing 404s never reach here: `localePrefix: 'as-needed'` rewrites them
// into [locale], so they render (site)/[locale]/not-found.tsx instead.
//
// Deliberately does NOT render its own <html>/<body>, unlike global-error.tsx.
// With no app/layout.tsx, Next injects its own bare root layout for /_not-found
// (next/dist/client/components/builtin/layout.js → <html><body>{children}</body></html>).
// Verified against the build output: adding an AppShell here produced a second,
// NESTED <html>/<body> inside Next's, which the browser parser discards along
// with its classes and font variables. So the shell comes from Next and this
// file supplies only the contents.
//
// That injected <html>/<body> carries no font-variable classes, so the
// next/font variables are declared on the wrapper below instead of on <body>,
// and page-system.css re-points --attn-serif / --attn-sans at them on that
// wrapper (`.sy-root`) — body's own copies resolved against nothing. CSS custom
// properties cascade to descendants, which is all the design system needs.
//
// No locale context exists here (no NextIntlClientProvider), so the copy is
// English and the links are plain next/link, not '@/i18n/navigation'. No
// client island either: the token flicker is CSS only.

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: '--font-schibsted',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata = {
  title: '404: This page is out of distribution.',
  robots: { index: false, follow: false },
};

const TOKENS = ['this', 'page', 'is', 'not', 'here'];
const SUGGESTIONS = [
  { href: '/', label: 'Home', note: 'Start from the top' },
  { href: '/services', label: 'Services', note: 'What we build for clients' },
  { href: '/products', label: 'Work', note: 'Products we build and run' },
  { href: '/contact', label: 'Contact', note: 'Ask us directly' },
];

export default function NotFound() {
  return (
    <div className={`${instrumentSerif.variable} ${schibstedGrotesk.variable} attn pg-system sy-root`}>
      <main className="sy-main" aria-labelledby="sy-404-h">
        <div className="attn-wrap sy-grid">
          <div className="sy-copy">
            <p className="pg-kicker sy-kicker">404</p>
            <h1 id="sy-404-h" className="pg-h1 sy-h1">
              This page is out of distribution.
            </h1>
            <p className="pg-lede">
              Nothing we&apos;ve built lives at this address. It may have moved, or the link may be off
              by a token or two.
            </p>
          </div>
          <div className="sy-fig">
            <div className="sy-ood sy-ood-css pg-panel">
              <p className="sy-ood-h pg-cap">The address, read token by token</p>
              <p className="sy-addr">
                {TOKENS.map((w, i) => (
                  <span key={w}>
                    <span className="sy-sep">/</span>
                    <span className="sy-tok" style={{ '--w': i } as CSSProperties}>
                      <span className="sy-tok-t">{w}</span>
                    </span>
                  </span>
                ))}
                <span className="sy-caret" aria-hidden="true" />
              </p>
              <p className="sy-ood-note">
                <span className="sy-flag">Rejected</span>
                Illustrative: no page on this site matches this address.
              </p>
            </div>
            <nav className="sy-suggest" aria-labelledby="sy-suggest-h">
              <p id="sy-suggest-h" className="sy-suggest-h pg-cap">
                Closest pages we do have
              </p>
              <ul>
                {SUGGESTIONS.map((s, i) => (
                  <li key={s.href}>
                    <Link href={s.href} className="sy-sug">
                      <span className="sy-sug-t">{s.label}</span>
                      <span className="sy-sug-n">{s.note}</span>
                      <span className="sy-sug-bar" aria-hidden="true">
                        <i style={{ '--p': 0.9 - i * 0.1 } as CSSProperties} />
                      </span>
                      <span className="sy-sug-arr" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
