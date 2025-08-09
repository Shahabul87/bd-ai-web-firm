import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIChatbot from "./components/AIChatbot";
import CrossPlatformWrapper from "./components/CrossPlatformWrapper";
import BrowserCompatibilityFallback from "./components/BrowserCompatibilityFallback";
import ErrorBoundary from "./components/ErrorBoundary";
import StructuredData from "./components/StructuredData";
import Analytics from "./analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cognivat.com'),
  title: {
    default: "Cognivat | AI-Autonomous Development Studio",
    template: "%s | Cognivat"
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
  authors: [{ name: "Cognivat", url: "https://cognivat.com" }],
  creator: "Cognivat",
  publisher: "Cognivat",
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
    url: "https://cognivat.com",
    title: "Cognivat | AI-Autonomous Development Studio",
    description: "Leading AI-autonomous development studio. Get professional machine learning models, data pipelines, and web development solutions at unbeatable prices through autonomous coding.",
    siteName: "Cognivat",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Cognivat - AI Autonomous Development Studio"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognivat | AI-Autonomous Development Studio",
    description: "Leading AI-autonomous development studio. Professional ML models, data pipelines & web development through autonomous coding.",
    creator: "@cognivat",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: "https://cognivat.com"
  },
  category: "Technology"
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cognivat" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="canonical" href="https://cognivat.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
            <StructuredData />
            <Analytics />
            {children}
            <AIChatbot />
          </CrossPlatformWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
