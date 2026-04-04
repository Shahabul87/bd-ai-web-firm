import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'CraftsAI offers AI-powered web development, Android development, iOS development, and ongoing support.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
