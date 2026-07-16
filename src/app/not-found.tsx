import Link from 'next/link';
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import MonoLabel from '@/app/design/ui/MonoLabel';

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
// That injected <html> carries no font-variable classes, so the next/font
// variables are declared on the wrapper below instead of on <body>; CSS custom
// properties cascade to descendants, which is all --font-display needs. The
// `.dark` class is likewise absent, but nothing here uses a `dark:` utility —
// the ink/signal tokens are dark-by-default at :root.
//
// Deliberately NOT using design/ui/Button: it imports Link from
// '@/i18n/navigation', which needs a NextIntlClientProvider that this tree has
// no locale context to supply. Plain next/link is correct here.

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['Menlo', 'Monaco', 'monospace'],
});

export const metadata = {
  title: '404: This page could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-24 text-bone">
        <div className="text-center">
          <MonoLabel className="text-signal">404 / Not found</MonoLabel>
          <h1 className="mt-6 font-display text-5xl font-medium text-bone sm:text-6xl">
            This page went off the blueprint.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-steel">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-signal px-7 py-3.5 font-mono text-sm uppercase tracking-[0.15em] text-ink-950 transition-colors duration-150 hover:bg-signal-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Back to home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-line px-7 py-3.5 font-mono text-sm uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Contact support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
