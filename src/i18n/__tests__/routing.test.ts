import { routing } from '@/i18n/routing';

describe('routing config', () => {
  it('declares exactly en and bn', () => {
    expect(routing.locales).toEqual(['en', 'bn']);
  });

  it('defaults to English', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('omits the prefix for the default locale so existing URLs never change', () => {
    expect(routing.localePrefix).toBe('as-needed');
  });
});
