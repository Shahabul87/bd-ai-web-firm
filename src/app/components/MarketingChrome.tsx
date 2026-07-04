'use client';

import { usePathname } from 'next/navigation';

/** Renders marketing-only chrome (WhatsApp, chatbot, cookie banner) everywhere
 *  except the /admin and /portal areas. */
export default function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) return null;
  return <>{children}</>;
}
