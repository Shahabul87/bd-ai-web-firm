import { localeAlternates, localeOpenGraph } from '../seo';

const BASE = 'https://www.craftsai.org';

describe('localeAlternates', () => {
  it('en canonical is the unprefixed URL', () => {
    expect(localeAlternates('/about', 'en').canonical).toBe(`${BASE}/about`);
  });

  it('bn canonical is the /bn-prefixed URL (points at itself, not English)', () => {
    expect(localeAlternates('/about', 'bn').canonical).toBe(`${BASE}/bn/about`);
  });

  it('languages carries en / bn / x-default with correct URLs', () => {
    expect(localeAlternates('/about', 'en').languages).toEqual({
      en: `${BASE}/about`,
      bn: `${BASE}/bn/about`,
      'x-default': `${BASE}/about`,
    });
    // languages is locale-independent (same map for en and bn requests)
    expect(localeAlternates('/about', 'bn').languages).toEqual({
      en: `${BASE}/about`,
      bn: `${BASE}/bn/about`,
      'x-default': `${BASE}/about`,
    });
  });

  it('home path "/" produces BASE with no trailing slash', () => {
    expect(localeAlternates('/', 'en').canonical).toBe(BASE);
    expect(localeAlternates('/', 'bn').canonical).toBe(`${BASE}/bn`);
    expect(localeAlternates('/', 'en').languages).toEqual({
      en: BASE,
      bn: `${BASE}/bn`,
      'x-default': BASE,
    });
  });

  it('empty path "" also produces BASE with no trailing slash', () => {
    expect(localeAlternates('', 'en').canonical).toBe(BASE);
    expect(localeAlternates('', 'bn').canonical).toBe(`${BASE}/bn`);
  });

  it('nested slug paths are preserved', () => {
    expect(localeAlternates('/products/banglu', 'bn').canonical).toBe(
      `${BASE}/bn/products/banglu`,
    );
  });
});

describe('localeOpenGraph', () => {
  it('en yields en_US locale and unprefixed url', () => {
    expect(localeOpenGraph('/about', 'en')).toEqual({
      locale: 'en_US',
      url: `${BASE}/about`,
    });
  });

  it('bn yields bn_BD locale and /bn url', () => {
    expect(localeOpenGraph('/about', 'bn')).toEqual({
      locale: 'bn_BD',
      url: `${BASE}/bn/about`,
    });
  });

  it('home path "/" yields BASE with no trailing slash', () => {
    expect(localeOpenGraph('/', 'en').url).toBe(BASE);
    expect(localeOpenGraph('/', 'bn').url).toBe(`${BASE}/bn`);
  });
});
