import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import MobileMenu from '../MobileMenu';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    locale,
    ...rest
  }: React.PropsWithChildren<{ href: string; locale?: string }>) => (
    <a href={locale === 'bn' ? `/bn${href}` : href} {...rest}>
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

function renderMenu(onClose: () => void) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MobileMenu open onClose={onClose} />
    </NextIntlClientProvider>
  );
}

describe('MobileMenu', () => {
  it('closes the overlay when the visitor switches locale', () => {
    // The overlay is full-screen. Header closes it from a [pathname] effect,
    // but @/i18n/navigation's pathname is locale-stripped and so is unchanged
    // across a switch — the effect never re-fires and App Router keeps layout
    // state across the param change. Without an explicit close, the visitor
    // taps BN and the overlay stays covering the now-Bengali page.
    const onClose = jest.fn();
    renderMenu(onClose);

    fireEvent.click(screen.getByRole('link', { name: /Switch to Bengali/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the overlay when the visitor follows a nav link', () => {
    // Guards the idiom the locale toggle is matching.
    const onClose = jest.fn();
    renderMenu(onClose);

    fireEvent.click(screen.getByRole('link', { name: 'Products' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
