import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Anek_Bangla } from 'next/font/google';
import '../../globals.css';
import AppShell from '@/app/components/AppShell';
import StructuredData from '@/app/components/StructuredData';
import CookieConsent from '@/app/components/CookieConsent';
import AIChatbot from '@/app/components/AIChatbot';
import WhatsAppButton from '@/app/components/WhatsAppButton';
import { routing } from '@/i18n/routing';

// Anek Bangla ships subsets [bengali, latin, latin-ext]. `wght` is implicit for
// a variable font and must NOT be listed in `axes` (next/font errors on it), so
// `wdth` is the only extra axis requested. The family has NO italic
// (styles: ['normal']) — Bengali emphasis must not use <em> italics.
// preload:false because this layout serves both locales; preloading would
// download the Bengali face for English visitors who never render a Bengali glyph.
const anekBangla = Anek_Bangla({
  variable: '--font-anek-bangla',
  subsets: ['bengali', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

// Carried across verbatim from the pre-split root layout
// (`git show HEAD:src/app/layout.tsx`) — including openGraph.locale, which stays
// hardcoded "en_US" for now.
//
// Why static and not generateMetadata(): making openGraph.locale reflect the
// real locale requires generateMetadata(), because `export const metadata`
// cannot read runtime params. That belongs in Stage 4 alongside hreflang,
// per-locale canonicals, and the sitemap — all of which need the same helper.
// Stage 1 does not touch SEO output.
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
    // OG image is generated dynamically by src/app/(site)/[locale]/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftsAI | AI Agent Development Studio",
    description: "We build AI agents. Our agents build your software — websites, mobile apps, and integrations.",
    creator: "@craftsai"
    // Twitter image is generated dynamically by src/app/(site)/[locale]/opengraph-image.tsx
  },
  alternates: {
    canonical: "https://www.craftsai.org"
  },
  category: "Technology"
};

// Verbatim from the pre-split root layout.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A0C10'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts these routes into static rendering instead of forcing dynamic.
  setRequestLocale(locale);

  return (
    <AppShell lang={locale} bodyClassName={anekBangla.variable}>
      <NextIntlClientProvider>
        <StructuredData />
        {children}
        <WhatsAppButton />
        <AIChatbot />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
      </NextIntlClientProvider>
    </AppShell>
  );
}
