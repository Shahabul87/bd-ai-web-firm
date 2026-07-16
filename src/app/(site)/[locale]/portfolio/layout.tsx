import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Explore CraftsAI projects — web apps, Android apps, and iOS apps built with AI-powered development.',
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
