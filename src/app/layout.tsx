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
  title: "Inshyra | AI-Powered Web Development Solutions",
  description: "Transform your business with AI-powered web applications, machine learning solutions, and intelligent automation. Inshyra's expert development team delivers cutting-edge technology solutions.",
  keywords: "AI development, machine learning, web development, artificial intelligence, automation, data visualization, predictive analytics",
  authors: [{ name: "Inshyra" }],
  creator: "Inshyra",
  publisher: "Inshyra",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inshyra.com",
    title: "Inshyra | AI-Powered Web Development Solutions",
    description: "Transform your business with AI-powered web applications, machine learning solutions, and intelligent automation.",
    siteName: "Inshyra"
  },
  twitter: {
    card: "summary_large_image",
    title: "Inshyra | AI-Powered Web Development Solutions",
    description: "Transform your business with AI-powered web applications, machine learning solutions, and intelligent automation.",
    creator: "@inshyra"
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
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
