import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Cognivat - AI Development Experts',
  description: 'Meet Cognivat, a leading AI-autonomous development studio. Expert team in machine learning, data science, and web development. Based in Reno, Nevada, serving clients worldwide.',
  keywords: [
    'about Cognivat',
    'AI development company',
    'machine learning team',
    'AI experts',
    'development studio',
    'tech company Reno',
    'AI consulting firm',
    'software development team'
  ],
  openGraph: {
    title: 'About Cognivat - AI Development Experts',
    description: 'Meet our expert team in AI development, machine learning, and autonomous coding.',
    url: 'https://www.cognivat.com/about',
    siteName: 'Cognivat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Cognivat | AI Development Studio',
    description: 'Expert AI development team serving clients worldwide.',
  },
  alternates: {
    canonical: 'https://www.cognivat.com/about'
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
