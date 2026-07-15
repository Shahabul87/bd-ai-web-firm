import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LocaleToggle from '../LocaleToggle';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, locale, ...rest }: React.PropsWithChildren<{ href: string; locale?: string }>) => (
    <a href={locale === 'bn' ? `/bn${href}` : href} {...rest}>{children}</a>
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
      <LocaleToggle />
    </NextIntlClientProvider>
  );
}

describe('LocaleToggle', () => {
  it('offers Bengali when the visitor is on English', () => {
    renderAt('en');
    expect(screen.getByRole('link', { name: /Switch to Bengali/i })).toBeInTheDocument();
  });

  it('keeps the visitor on the same page when switching', () => {
    renderAt('en');
    expect(screen.getByRole('link', { name: /Switch to Bengali/i })).toHaveAttribute(
      'href',
      '/bn/services'
    );
  });

  it('marks the active locale for assistive tech', () => {
    renderAt('en');
    expect(screen.getByText('EN')).toHaveAttribute('aria-current', 'true');
  });

  it('notifies its host when the visitor picks the other locale', () => {
    // MobileMenu relies on this to close its overlay: Header's [pathname]
    // effect cannot, because the locale-stripped pathname does not change
    // across a locale switch. Asserted through a jest.fn() rather than markup
    // so dropping the onClick wiring fails on the assertion, not on a crash.
    const onSelect = jest.fn();
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleToggle onSelect={onSelect} />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole('link', { name: /Switch to Bengali/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not require an onSelect host (desktop header passes none)', () => {
    renderAt('en');
    expect(() =>
      fireEvent.click(screen.getByRole('link', { name: /Switch to Bengali/i }))
    ).not.toThrow();
  });
});
