import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import CareersHero from '../CareersHero';
import { HowWeWork, LookFor, OpenRoles } from '../CareersSections';
import { cardFieldsSchema, stringListSchema, titledItemsSchema, titleText, titleWordsSchema } from '../schema';
import { cookieTypesSchema, stringListSchema as legalList, termDetailSchema } from '../../legal/schema';
import LegalToc from '../../legal/LegalToc';
import enMessages from '../../../../../../messages/en.json';
import bnMessages from '../../../../../../messages/bn.json';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const cases = [
  ['en', enMessages],
  ['bn', bnMessages],
] as const;

describe('Careers and Legal messages', () => {
  it.each(cases)('%s data passes the schemas', (_l, m) => {
    expect(() => titleWordsSchema.parse(m.Careers.hero.title)).not.toThrow();
    expect(() => cardFieldsSchema.parse(m.Careers.hero.card.fields)).not.toThrow();
    expect(() => titledItemsSchema.parse(m.Careers.work.items)).not.toThrow();
    expect(() => titledItemsSchema.parse(m.Careers.look.items)).not.toThrow();
    expect(() => stringListSchema.parse(m.Careers.roles.include)).not.toThrow();
    expect(() => termDetailSchema.parse(m.Legal.privacy.sections.informationWeCollect.items)).not.toThrow();
    expect(() => termDetailSchema.parse(m.Legal.privacy.sections.serviceProviders.items)).not.toThrow();
    expect(() => legalList.parse(m.Legal.privacy.sections.howWeUse.items)).not.toThrow();
    expect(() => cookieTypesSchema.parse(m.Legal.cookies.cookieTypes)).not.toThrow();
  });
});

describe('Careers page', () => {
  it.each(cases)('%s renders one h1 with the whole sentence, and a mailto with the Careers subject', (locale, m) => {
    const { container } = render(
      <NextIntlClientProvider locale={locale} messages={m}>
        <div className="attn pg-careers">
          <CareersHero />
          <HowWeWork />
          <LookFor />
          <OpenRoles />
        </div>
      </NextIntlClientProvider>,
    );
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      titleText(titleWordsSchema.parse(m.Careers.hero.title)),
    );
    const mail = container.querySelector('a[href^="mailto:"]');
    expect(mail?.getAttribute('href')).toBe('mailto:hello@craftsai.org?subject=Careers');

    const toggle = screen.getByRole('button', { name: m.Careers.hero.tokens.show });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.ca-title')?.getAttribute('data-mode')).toBe('tokens');
  });
});

describe('LegalToc', () => {
  it('lists every section and toggles on mobile', () => {
    const items = [
      { id: 'a', n: '01', title: 'First' },
      { id: 'b', n: '02', title: 'Second' },
    ];
    render(<LegalToc items={items} label="On this page" />);
    expect(screen.getAllByRole('link')).toHaveLength(2);
    const toggle = screen.getByRole('button');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
