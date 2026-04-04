import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CraftsAI',
  description:
    'Get in touch with CraftsAI. Send us a message about your web, Android, or iOS project and receive a free quote within 24 hours.',
  openGraph: {
    title: 'Contact Us | CraftsAI',
    description:
      'Send us a message and get a free quote within 24 hours.',
    url: 'https://www.craftsai.org/contact',
  },
  alternates: { canonical: 'https://www.craftsai.org/contact' },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
