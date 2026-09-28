import { fireEvent, render, screen, within } from '@testing-library/react';
import FaqExplorer, { type FaqLabels } from '../FaqExplorer';
import { faqSchema, loadFaq } from '../data';
import { highlight, queryTerms, rank } from '../search';
import faqData from '@content/faq/faq.json';
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
  Element.prototype.scrollIntoView = jest.fn();
});

const labels = (m: typeof enMessages) => m.Faq.search as unknown as FaqLabels;

describe('faq.json', () => {
  it('passes the schema and has unique ids', () => {
    const data = faqSchema.parse(faqData);
    const ids = data.flatMap((c) => c.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the shape StructuredData reads, and no location or unmeasured claims', () => {
    const text = JSON.stringify(faqData);
    expect(text).not.toMatch(/Bangladesh|বাংলাদেশ|Dhaka|ঢাকা|10x|\$\d/);
    for (const c of faqData) {
      expect(c.category.en && c.category.bn).toBeTruthy();
      for (const q of c.questions) expect(q.question.en && q.question.bn && q.answer.en && q.answer.bn).toBeTruthy();
    }
  });
});

describe('search', () => {
  const { items } = loadFaq('en');

  it('drops stopwords and punctuation', () => {
    expect(queryTerms('Who owns the “code”?')).toEqual(['who', 'owns', 'code']);
    expect(queryTerms('the')).toEqual(['the']);
  });

  it('requires every term and ranks question hits first', () => {
    const r = rank(items, queryTerms('who owns the code'));
    expect(r[0].item.id).toBe('who-owns');
    expect(rank(items, queryTerms('zzzz'))).toHaveLength(0);
  });

  it('highlights case-insensitively', () => {
    expect(highlight('Data and data', ['data'])).toEqual([
      { text: 'Data', hit: true },
      { text: ' and ', hit: false },
      { text: 'data', hit: true },
    ]);
  });
});

describe('FaqExplorer', () => {
  // Opening an answer writes its #id to the URL, which the next render would honour.
  beforeEach(() => window.history.replaceState(null, '', '/'));

  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ] as const)('%s: filters live, highlights, counts and toggles', (locale, m) => {
    const { items, categories } = loadFaq(locale);
    const { container } = render(
      <FaqExplorer
        items={items}
        categories={categories}
        labels={labels(m as typeof enMessages)}
        bengaliDigits={locale === 'bn'}
        contactHref="/contact"
      />,
    );
    const buttons = container.querySelectorAll('.fq-q button');
    expect(buttons).toHaveLength(items.length);
    // Hydrated: answers are folded.
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: items[1].question.split(' ').slice(-2).join(' ') } });
    expect(container.querySelectorAll('.fq-item').length).toBeLessThan(items.length);
    expect(container.querySelector('mark.fq-hit')).not.toBeNull();

    fireEvent.change(input, { target: { value: 'qqqqzzzz' } });
    expect(container.querySelector('.fq-empty')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(locale === 'bn' ? /০/ : /0/);
  });

  it('filters by topic chip', () => {
    const { items, categories } = loadFaq('en');
    const { container } = render(
      <FaqExplorer items={items} categories={categories} labels={labels(enMessages)} bengaliDigits={false} contactHref="/contact" />,
    );
    const group = screen.getByRole('group');
    fireEvent.click(within(group).getByRole('button', { name: new RegExp(categories[2].label) }));
    const shown = container.querySelectorAll('.fq-item');
    expect(shown.length).toBe(items.filter((it) => it.categoryId === categories[2].id).length);
  });

  it('opens the answer named in the URL hash', () => {
    window.location.hash = '#nda';
    const { items, categories } = loadFaq('en');
    render(<FaqExplorer items={items} categories={categories} labels={labels(enMessages)} bengaliDigits={false} contactHref="/contact" />);
    expect(document.getElementById('nda-q')?.getAttribute('aria-expanded')).toBe('true');
    window.location.hash = '';
  });
});
