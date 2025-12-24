import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Development Services - React, Next.js & Full Stack',
  description: 'Professional web development services using React, Next.js, Node.js. AI-powered autonomous coding delivers enterprise-quality websites 10x faster at lower costs.',
  keywords: [
    'web development services',
    'React development',
    'Next.js development',
    'full stack development',
    'Node.js development',
    'TypeScript development',
    'website development',
    'web application development',
    'frontend development',
    'backend development'
  ],
  openGraph: {
    title: 'Web Development Services | Cognivat',
    description: 'Professional React & Next.js web development. AI-powered coding delivers 10x faster.',
    url: 'https://cognivat.com/web-development',
    siteName: 'Cognivat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Development Services | Cognivat',
    description: 'React & Next.js development powered by AI.',
  },
  alternates: {
    canonical: 'https://cognivat.com/web-development'
  }
};

export default function WebDevLayout({ children }: { children: React.ReactNode }) {
  return children;
}
