import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Header from '../Header';

// `usePathname` from @/i18n/navigation is locale-STRIPPED: it returns '/services'
// for a visitor on /bn/services just as it does for one on /services. Mocking it
// that way is what lets these tests stand in for a Bengali page. next/navigation's
// usePathname would return the full '/bn/services' — the bug this guards.
jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    locale,
    ...rest
  }: React.PropsWithChildren<{ href: string; locale?: string }>) => (
    <a
      href={locale === 'bn' ? `/bn${href}` : href}
      // Tags anchors that routed through the locale-aware Link. A next/link
      // import would bypass this mock entirely and drop the attribute.
      data-locale-aware="true"
      {...rest}
    >
      {children}
    </a>
  ),
  usePathname: () => '/services',
}));

const messages = {
  LocaleToggle: {
    label: 'Language',
    switchToEnglish: 'Switch to English',
    switchToBengali: 'Switch to Bengali',
  },
};

function renderAt(locale: string) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
    </NextIntlClientProvider>
  );
}

describe('Header on Bengali pages', () => {
  it('highlights the active nav link on Bengali pages', () => {
    renderAt('bn');
    // A visitor on /bn/services must see the same active state as one on
    // /services: pathname.startsWith('/services') has to hold on both.
    expect(screen.getByRole('button', { name: /Services/i })).toHaveClass('text-signal');
  });

  it('routes primary nav links through the locale-aware Link', () => {
    renderAt('bn');
    // Without this, an unprefixed href like /products sends a Bengali visitor
    // to the English page and silently loses their language.
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'data-locale-aware',
      'true'
    );
  });

  it('offers English to a visitor reading Bengali', () => {
    renderAt('bn');
    expect(screen.getByRole('link', { name: /Switch to English/i })).toBeInTheDocument();
  });
});
