import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Request a free quote for your web, Android, or iOS development project from CraftsAI.',
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
