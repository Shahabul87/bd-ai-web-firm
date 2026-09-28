import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import CompanyHero from '../CompanyHero';
import IntendedUse from '../IntendedUse';
import OutOfScope from '../OutOfScope';
import Principles from '../Principles';
import TwoLayers from '../TwoLayers';
import JoinBand from '../JoinBand';
import { cardFieldsSchema, layerRowsSchema, stringListSchema, titledItemsSchema } from '../schema';
// The real message files, so these tests cannot drift from the shipped copy.
import enMessages from '../../../../../../messages/en.json';
import bnMessages from '../../../../../../messages/bn.json';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

const page = (locale: 'en' | 'bn') => (
  <NextIntlClientProvider locale={locale} messages={locale === 'en' ? enMessages : bnMessages}>
    <div className="attn pg-company">
      <CompanyHero />
      <IntendedUse />
      <OutOfScope />
      <Principles />
      <TwoLayers />
      <JoinBand />
    </div>
  </NextIntlClientProvider>
);

describe('Company page messages', () => {
  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s About data passes the schemas', (_locale, m) => {
    expect(() => cardFieldsSchema.parse(m.About.hero.card.fields)).not.toThrow();
    expect(() => titledItemsSchema.parse(m.About.intended.items)).not.toThrow();
    expect(() => titledItemsSchema.parse(m.About.outOfScope.items)).not.toThrow();
    expect(() => stringListSchema.parse(m.About.principles.measured.criteria)).not.toThrow();
    expect(() => layerRowsSchema.parse(m.About.layers.rows)).not.toThrow();
  });

  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s About + Meta.about follow the founder rules (no place, no stats)', (_locale, m) => {
    const copy = JSON.stringify([m.About, m.Meta.about]);
    expect(copy).not.toMatch(/Dhaka|Bangladesh|ঢাকা|বাংলাদেশ|10x|\d+\s?%|Android|iOS/i);
  });
});

describe('Company page render', () => {
  it.each(['en', 'bn'] as const)('%s renders one h1 and a labelled heading per section', (locale) => {
    const { container } = render(page(locale));
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    container.querySelectorAll('section[aria-labelledby]').forEach((section) => {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    });
    // The model card is complete in the markup, every field and value.
    const fields = (locale === 'en' ? enMessages : bnMessages).About.hero.card.fields;
    const card = screen.getByRole('group', { name: (locale === 'en' ? enMessages : bnMessages).About.hero.card.ariaLabel });
    expect(card.querySelectorAll('dt')).toHaveLength(fields.length);
    expect(card.textContent).toContain(fields[fields.length - 1].value);
  });

  it('renders numbers in Bengali digits on /bn', () => {
    const { container } = render(page('bn'));
    expect(container.querySelector('.co-card-rev')?.textContent).toBe('সংস্করণ ২০২৬');
    expect(container.querySelector('.co-label-n')?.textContent).toBe('§ ১');
    expect(container.querySelector('[data-tally]')?.textContent).toBe('৪৮টির মধ্যে ৪৬টি পাস');
  });

  it('exposes both layers as real text and toggles the machine layer with aria-pressed', () => {
    render(page('en'));
    const human = screen.getByRole('list', { name: enMessages.About.layers.human });
    const machine = screen.getByRole('list', { name: enMessages.About.layers.machine });
    expect(within(human).getAllByRole('listitem')).toHaveLength(enMessages.About.layers.rows.length);
    expect(machine.textContent).toContain(enMessages.About.layers.rows[1].machine);

    const toggle = screen.getByRole('button', { name: enMessages.About.layers.toggle });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle.closest('.co-xr')).toHaveAttribute('data-full', 'true');
  });

  it('points the maintainers band at /careers', () => {
    render(page('en'));
    expect(screen.getByRole('link', { name: enMessages.About.join.cta })).toHaveAttribute('href', '/careers');
  });
});
