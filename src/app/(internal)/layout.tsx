import type { Metadata } from 'next';
import '../globals.css';
import AppShell from '../components/AppShell';

export const metadata: Metadata = {
  title: 'CraftsAI',
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0C10',
};

/** Root layout for /admin and /portal. Never localized, never indexed,
 *  no marketing chrome (no chatbot, WhatsApp button, or cookie banner). */
export default function InternalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell lang="en" analytics={false}>
      {children}
    </AppShell>
  );
}
