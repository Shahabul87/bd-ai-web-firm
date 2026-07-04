import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AIChatbot from "./components/AIChatbot";
import WhatsAppButton from "./components/WhatsAppButton";
import CrossPlatformWrapper from "./components/CrossPlatformWrapper";
import BrowserCompatibilityFallback from "./components/BrowserCompatibilityFallback";
import ErrorBoundary from "./components/ErrorBoundary";
import StructuredData from "./components/StructuredData";
import Analytics from "./analytics";
import CookieConsent from "./components/CookieConsent";
import MarketingChrome from "./components/MarketingChrome";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["Menlo", "Monaco", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.craftsai.org'),
  title: {
    default: "CraftsAI | AI Agent Development Studio",
    template: "%s | CraftsAI"
  },
  description: "CraftsAI is an AI agent development studio in Dhaka serving clients worldwide. We build custom AI agents, ship websites and mobile apps built by AI agents, and integrate agents into your existing systems.",
  keywords: [
    "AI agent development",
    "custom AI agents",
    "AI agent integration",
    "AI web development",
    "mobile app development",
    "AI automation",
    "autonomous coding",
    "AI software studio",
    "Bangladesh software company",
    "AI development agency"
  ],
  authors: [{ name: "CraftsAI", url: "https://www.craftsai.org" }],
  creator: "CraftsAI",
  publisher: "CraftsAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.craftsai.org",
    title: "CraftsAI | AI Agent Development Studio",
    description: "We build AI agents. Our agents build your software — websites, mobile apps, and integrations, shipped fast with human review.",
    siteName: "CraftsAI"
    // OG image is generated dynamically by src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftsAI | AI Agent Development Studio",
    description: "We build AI agents. Our agents build your software — websites, mobile apps, and integrations.",
    creator: "@craftsai"
    // Twitter image is generated dynamically by src/app/opengraph-image.tsx
  },
  alternates: {
    canonical: "https://www.craftsai.org"
  },
  category: "Technology"
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A0C10'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CraftsAI" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="canonical" href="https://www.craftsai.org" />
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
        className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} antialiased bg-ink-950 text-bone`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
            <StructuredData />
            <Analytics />
            {children}
            <MarketingChrome>
              <WhatsAppButton />
              <AIChatbot />
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
            </MarketingChrome>
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
