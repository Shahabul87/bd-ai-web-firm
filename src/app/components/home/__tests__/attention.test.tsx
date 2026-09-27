import { render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import HomePage from '../../HomePage';
import {
  arcBetween,
  assignLines,
  boxFromOffsets,
  dimmedOpacity,
  restingPairs,
  symmetricWeight,
} from '../attention/geometry';
import { artifactCopySchema, heroDataSchema } from '../attention/schema';
// The real message files, so these tests cannot drift from the shipped copy.
import enMessages from '../../../../../messages/en.json';
import bnMessages from '../../../../../messages/bn.json';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeAll(() => {
  // jsdom has no matchMedia; the hero and process read prefers-reduced-motion.
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

describe('hero message data', () => {
  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s passes the hero schema (rows sum to 1, first candidate is the token)', (_locale, messages) => {
    expect(() => heroDataSchema.parse(messages.Home.hero)).not.toThrow();
  });

  it('rejects a weights row that no longer sums to 1', () => {
    const broken = JSON.parse(JSON.stringify(enMessages.Home.hero)) as typeof enMessages.Home.hero;
    broken.weights[0][1] += 0.2;
    expect(() => heroDataSchema.parse(broken)).toThrow(/sums to/);
  });

  it('rejects a token whose first candidate is not the token itself', () => {
    const broken = JSON.parse(JSON.stringify(enMessages.Home.hero)) as typeof enMessages.Home.hero;
    broken.tokens[0].candidates[0].word = 'Quit';
    expect(() => heroDataSchema.parse(broken)).toThrow(/first candidate/);
  });

  it('uses the founder-approved English headline', () => {
    const words = enMessages.Home.hero.tokens.map((t) => t.text).join(' ');
    expect(words).toBe('Stop demoing AI. Start profiting from it.');
  });

  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s process artifacts pass their schema', (_locale, messages) => {
    const p = messages.Home.process;
    expect(() =>
      artifactCopySchema.parse({
        research: p.research.artifact,
        plan: p.plan.artifact,
        design: p.design.artifact,
        build: p.build.artifact,
        test: p.test.artifact,
      }),
    ).not.toThrow();
  });
});

describe('attention geometry', () => {
  const fs = 100;
  const m = { fontSize: fs, padTop: 200, padBottom: 40 };

  it('groups words into lines by their row top', () => {
    const boxes = [boxFromOffsets(0, 0, 50, fs), boxFromOffsets(60, 2, 50, fs), boxFromOffsets(0, 108, 50, fs)];
    const { boxes: placed, lines } = assignLines(boxes, fs);
    expect(lines).toBe(2);
    expect(placed.map((b) => b.line)).toEqual([0, 0, 1]);
  });

  it('arches above words on the first line and below words on the last line', () => {
    const { boxes, lines } = assignLines(
      [boxFromOffsets(0, 0, 50, fs), boxFromOffsets(100, 0, 50, fs), boxFromOffsets(0, 108, 50, fs), boxFromOffsets(100, 108, 50, fs)],
      fs,
    );
    const top = arcBetween(boxes[0], boxes[1], lines, m);
    const bottom = arcBetween(boxes[2], boxes[3], lines, m);
    expect(top.my).toBeLessThan(boxes[0].capTop);
    expect(bottom.my).toBeGreaterThan(boxes[2].base);
    expect(arcBetween(boxes[0], boxes[3], lines, m).cross).toBe(true);
  });

  it('draws resting arcs only for pairs above the threshold, using the mean of both directions', () => {
    const w = [
      [0, 0.3, 0.7],
      [0.05, 0, 0.95],
      [0.5, 0.5, 0],
    ];
    expect(symmetricWeight(w, 0, 1)).toBeCloseTo(0.175);
    expect(restingPairs(w, 0.2).map(({ i, j }) => `${i}-${j}`)).toEqual(['0-2', '1-2']);
  });

  it('never fades a word below a readable floor', () => {
    expect(dimmedOpacity(0)).toBeCloseTo(0.22);
    expect(dimmedOpacity(1)).toBe(1);
  });
});

describe('HomePage render', () => {
  it.each([
    ['en', enMessages, 'Stop demoing AI. Start profiting from it.'],
    ['bn', bnMessages, 'ডেমো আর নয়। AI থেকে লাভ তুলুন।'],
  ])('renders the full %s page with the headline in the HTML', (locale, messages, headline) => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HomePage />
      </NextIntlClientProvider>,
    );
    // The complete headline is server-rendered, so crawlers and no-JS visitors get it.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(headline);
    // Six services, five process steps, four examples.
    const services = document.getElementById('services') as HTMLElement;
    expect(within(services).getAllByRole('heading', { level: 3 })).toHaveLength(6);
    const process = document.getElementById('process') as HTMLElement;
    expect(within(process).getAllByRole('button')).toHaveLength(5);
    const work = document.getElementById('work') as HTMLElement;
    expect(within(work).getAllByRole('heading', { level: 3 })).toHaveLength(4);
    expect(screen.getAllByRole('link', { name: messages.Home.hero.ctaPrimary })[0]).toHaveAttribute('href', '/contact');
  });

  it('makes every headline word a keyboard-reachable toggle', () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <HomePage />
      </NextIntlClientProvider>,
    );
    const h1 = screen.getByRole('heading', { level: 1 });
    const words = within(h1).getAllByRole('button');
    expect(words).toHaveLength(7);
    words.forEach((w) => {
      expect(w).toHaveAttribute('tabindex', '0');
      expect(w).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
