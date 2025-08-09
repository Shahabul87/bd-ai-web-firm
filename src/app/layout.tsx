import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIChatbot from "./components/AIChatbot";
import CrossPlatformWrapper from "./components/CrossPlatformWrapper";
import BrowserCompatibilityFallback from "./components/BrowserCompatibilityFallback";
import ErrorBoundary from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cognivat | AI-Autonomous Development Studio",
  description: "AI model development, training, validation, testing and deployments. Data preprocessing pipelines, web development, and business analysis. AI-autonomous coding for low-cost solutions.",
  keywords: "AI model development, machine learning training, data pipelines, autonomous coding, web development, fintech analysis, healthcare analytics, customer analysis",
  authors: [{ name: "Cognivat" }],
  creator: "Cognivat",
  publisher: "Cognivat",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cognivat.com",
    title: "Cognivat | AI-Autonomous Development Studio",
    description: "AI model development, data pipelines, web development, and business analysis. Low-cost solutions through autonomous coding.",
    siteName: "Cognivat"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognivat | AI-Autonomous Development Studio",
    description: "AI model development, data pipelines, web development, and business analysis. Low-cost solutions through autonomous coding.",
    creator: "@cognivat"
  }
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
            {children}
            <AIChatbot />
          </CrossPlatformWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
