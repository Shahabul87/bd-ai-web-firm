import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Solutions & Machine Learning Services',
  description: 'Enterprise AI model development, machine learning training, NLP, computer vision, and predictive analytics. Get custom AI solutions 10x faster with autonomous coding.',
  keywords: [
    'AI solutions',
    'machine learning services',
    'AI model development',
    'NLP services',
    'computer vision',
    'predictive analytics',
    'deep learning',
    'AI consulting',
    'ML training',
    'AI development company'
  ],
  openGraph: {
    title: 'AI Solutions & Machine Learning Services | Cognivat',
    description: 'Enterprise AI model development, machine learning training, NLP, computer vision, and predictive analytics. Get custom AI solutions 10x faster.',
    url: 'https://cognivat.com/ai-solutions',
    siteName: 'Cognivat',
    type: 'website',
    images: [{
      url: '/og-ai-solutions.jpg',
      width: 1200,
      height: 630,
      alt: 'Cognivat AI Solutions'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Solutions & Machine Learning Services | Cognivat',
    description: 'Enterprise AI model development and ML services. Build 10x faster with autonomous coding.',
  },
  alternates: {
    canonical: 'https://cognivat.com/ai-solutions'
  }
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return children;
}
