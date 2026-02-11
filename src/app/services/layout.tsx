import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Development Services - Web, Mobile & ML Solutions',
  description: 'Professional AI-powered development services: web applications, mobile apps, machine learning models, and automation. Enterprise quality at startup-friendly prices.',
  keywords: [
    'AI development services',
    'web development',
    'mobile app development',
    'machine learning development',
    'automation services',
    'React development',
    'Next.js development',
    'AI agents',
    'software development',
    'custom software'
  ],
  openGraph: {
    title: 'AI Development Services | CraftsAI',
    description: 'Professional AI-powered development services. Web, mobile, ML solutions at startup-friendly prices.',
    url: 'https://www.craftsai.org/services',
    siteName: 'CraftsAI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Development Services | CraftsAI',
    description: 'Web, mobile & ML development powered by AI agents.',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/services'
  }
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
