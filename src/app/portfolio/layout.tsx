import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio - AI & Web Development Projects',
  description: 'Explore our portfolio of successful AI model development, machine learning, and web development projects. See real results from clients in fintech, healthcare, retail, and more.',
  keywords: [
    'AI projects portfolio',
    'machine learning case studies',
    'web development portfolio',
    'AI development examples',
    'ML project showcase',
    'software development work',
    'client success stories'
  ],
  openGraph: {
    title: 'Portfolio | CraftsAI AI Development',
    description: 'Explore our successful AI & web development projects across industries.',
    url: 'https://www.craftsai.org/portfolio',
    siteName: 'CraftsAI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | CraftsAI',
    description: 'AI & web development project showcase.',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/portfolio'
  }
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
