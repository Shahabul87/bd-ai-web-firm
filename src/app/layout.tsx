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
import { ThemeProvider } from "./context/ThemeContext";

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
    default: "CraftsAI | AI-Autonomous Development Studio",
    template: "%s | CraftsAI"
  },
  description: "Leading AI-autonomous development studio specializing in machine learning model development, data preprocessing pipelines, web development, and business intelligence. Get low-cost, high-quality AI solutions through autonomous coding.",
  keywords: [
    "AI model development",
    "machine learning training", 
    "data pipelines",
    "autonomous coding",
    "web development",
    "fintech analysis",
    "healthcare analytics",
    "business intelligence",
    "MLOps",
    "AI consulting",
    "neural networks",
    "deep learning",
    "computer vision",
    "natural language processing",
    "predictive analytics"
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
    title: "CraftsAI | AI-Autonomous Development Studio",
    description: "Leading AI-autonomous development studio. Get professional machine learning models, data pipelines, and web development solutions at unbeatable prices through autonomous coding.",
    siteName: "CraftsAI",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "CraftsAI - AI Autonomous Development Studio"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftsAI | AI-Autonomous Development Studio",
    description: "Leading AI-autonomous development studio. Professional ML models, data pipelines & web development through autonomous coding.",
    creator: "@craftsai",
    images: ["/og-image.jpg"]
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; background: #0A0C10; color: #EDEEE8; }
          .min-h-screen { min-height: 100vh; }
        ` }} />
        
        {/* Google Search Console Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="abcdef1234567890abcdef1234567890abcdef12" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} antialiased bg-ink-950 text-bone`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ErrorBoundary>
            <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
              <StructuredData />
              <Analytics />
              {children}
              <WhatsAppButton />
              <AIChatbot />
            </CrossPlatformWrapper>
          </ErrorBoundary>
        </ThemeProvider>
        
        {/* Google Analytics - loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
