import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - AI & Machine Learning Insights',
  description: 'Latest articles on AI development, machine learning, autonomous coding, and technology trends. Expert insights from the Cognivat team.',
  keywords: [
    'AI blog',
    'machine learning articles',
    'AI development tips',
    'tech blog',
    'ML insights',
    'autonomous coding',
    'AI trends',
    'software development blog'
  ],
  openGraph: {
    title: 'Blog | Cognivat AI Development',
    description: 'Latest articles on AI, machine learning, and autonomous coding.',
    url: 'https://www.cognivat.com/blog',
    siteName: 'Cognivat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Cognivat',
    description: 'AI & machine learning insights.',
  },
  alternates: {
    canonical: 'https://www.cognivat.com/blog'
  }
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
