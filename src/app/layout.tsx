import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import AIChatbot from "./components/AIChatbot";
import WhatsAppButton from "./components/WhatsAppButton";
import StructuredData from "./components/StructuredData";
import CookieConsent from "./components/CookieConsent";
import MarketingChrome from "./components/MarketingChrome";

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
    <AppShell lang="en">
      <StructuredData />
      {children}
      <MarketingChrome>
        <WhatsAppButton />
        <AIChatbot />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
      </MarketingChrome>
    </AppShell>
  );
}
