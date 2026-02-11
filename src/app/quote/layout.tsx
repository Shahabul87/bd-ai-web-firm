import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Free Quote - AI & Web Development',
  description: 'Request a free quote for AI development, machine learning, web development, or mobile app projects. Transparent pricing, fast delivery, enterprise quality.',
  keywords: [
    'AI development quote',
    'web development pricing',
    'machine learning cost',
    'software development quote',
    'AI project estimate',
    'custom software pricing',
    'development services quote'
  ],
  openGraph: {
    title: 'Get a Free Quote | CraftsAI AI Development',
    description: 'Request a free quote for AI and web development projects. Transparent pricing, fast delivery.',
    url: 'https://www.craftsai.org/quote',
    siteName: 'CraftsAI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get a Free Quote | CraftsAI',
    description: 'Free quotes for AI & web development projects.',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/quote'
  }
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
