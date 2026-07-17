import { useTranslations } from 'next-intl';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const t = useTranslations('Chrome');
  return (
    <>
      {/* Skip link: the first focusable element, visually hidden until focused,
          so a keyboard user can jump past the nav to the page content. */}
      <a
        href="#main-content"
        className="sr-only rounded-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.15em] focus:text-ink-950"
      >
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-16 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
