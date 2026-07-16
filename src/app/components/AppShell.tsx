import { Suspense } from 'react';
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import CrossPlatformWrapper from './CrossPlatformWrapper';
import BrowserCompatibilityFallback from './BrowserCompatibilityFallback';
import ErrorBoundary from './ErrorBoundary';
import Analytics from '../analytics';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['Menlo', 'Monaco', 'monospace'],
});

interface AppShellProps {
  /** BCP-47 tag for <html lang>. 'en' for internal, locale for marketing. */
  lang: string;
  /** Extra font variable classes appended to <body> (e.g. Bengali font). */
  bodyClassName?: string;
  children: React.ReactNode;
}

export default function AppShell({ lang, bodyClassName = '', children }: AppShellProps) {
  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CraftsAI" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* NOTE: the root <link rel="canonical" href="https://www.craftsai.org" /> that
            lived here is deliberately NOT carried over — see Step 2. */}
        {/* Favicon (icon.svg), apple-touch-icon (apple-icon.png) auto-injected by Next.js
            metadata file conventions; favicon.ico served from /public for legacy crawlers. */}
        <link rel="manifest" href="/manifest.json" />

        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; background: #0A0C10; color: #EDEEE8; }
          .min-h-screen { min-height: 100vh; }
        ` }} />
        {/* Google Search Console is verified via /googlef1eae627fd291eda.html (public/). */}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${bodyClassName} antialiased bg-ink-950 text-bone`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
            {/* Analytics calls useSearchParams(), which opts its subtree out of
                static rendering. It must stay inside its own Suspense boundary so
                the bailout is scoped to Analytics (which renders null) and never
                reaches {children} — without this, prerendering every page fails. */}
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            {children}
          </CrossPlatformWrapper>
        </ErrorBoundary>

        {/* Google Analytics with Consent Mode v2 (default DENIED until the user
            opts in via the CookieConsent banner). Loaded only when configured. */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script id="ga-consent-default" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  wait_for_update: 500
                });
                try {
                  if (localStorage.getItem('cookie-consent') === 'granted') {
                    gtag('consent', 'update', { analytics_storage: 'granted' });
                  }
                } catch (e) {}
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  anonymize_ip: true
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
