import { render, screen } from '@testing-library/react';
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
});
