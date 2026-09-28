import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import WorkMap, { type MapProduct, type WorkMapCopy } from '../WorkMap';
import {
  CLUSTER_KEYS,
  CONCEPT_POINTS,
  PARKED,
  PRODUCT_PLACES,
  idlePath,
  nearest,
  placeOf,
  similarity,
  vectorBars,
  type ClusterKey,
} from '../geometry';
import { decodeEntities } from '../text';
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

const productsDir = join(process.cwd(), 'content', 'products');
const contentSlugs = readdirSync(productsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => /^slug:\s*"([^"]+)"/m.exec(readFileSync(join(productsDir, f), 'utf8'))?.[1])
  .filter((s): s is string => Boolean(s));

describe('work map geometry', () => {
  it('has a hand-placed position for every product in content/', () => {
    expect(contentSlugs.length).toBeGreaterThan(0);
    for (const slug of contentSlugs) expect(PRODUCT_PLACES[slug]).toBeDefined();
  });

  it('keeps every point inside the map', () => {
    const pts = [...Object.values(PRODUCT_PLACES), ...CLUSTER_KEYS.flatMap((k) => CONCEPT_POINTS[k])];
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(100);
    }
  });

  it('scores 1 at the point and falls off with distance', () => {
    expect(similarity(PARKED, PARKED)).toBe(1);
    expect(similarity(PARKED, { x: 45, y: 40 })).toBeGreaterThan(similarity(PARKED, { x: 65, y: 40 }));
  });

  it('parks the query inside the learning cluster', () => {
    const slugs = Object.keys(PRODUCT_PLACES);
    const places = slugs.map((s, i) => placeOf(s, i));
    const top = nearest(PARKED, places, places.map((_, i) => i), 3).map((n) => places[n.index].cluster);
    expect(top).toEqual(['learn', 'learn', 'learn']);
  });

  it('is deterministic (no randomness in paths or glyphs)', () => {
    expect(idlePath(12.5)).toEqual(idlePath(12.5));
    expect(vectorBars('banglu')).toEqual(vectorBars('banglu'));
    expect(vectorBars('banglu')).not.toEqual(vectorBars('taxomind'));
  });

  it('decodes the entities the front matter carries', () => {
    expect(decodeEntities('Bloom&apos;s Taxonomy')).toBe('Bloom’s Taxonomy');
  });
});

describe('work map messages', () => {
  it.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s has one concept word per concept point', (_locale, messages) => {
    const concepts = messages.Products.map.concepts as Record<ClusterKey, string[]>;
    for (const key of CLUSTER_KEYS) expect(concepts[key]).toHaveLength(CONCEPT_POINTS[key].length);
  });
});

const PRODUCTS: MapProduct[] = [
  { slug: 'book-ai', title: 'Book-AI', tagline: 'Learn AI', platforms: ['web'], live: { href: 'https://book-ai.org', kind: 'site' } },
  { slug: 'fincoach-ai', title: 'FinCoach AI', tagline: 'Coach', platforms: ['android'], live: { href: 'https://play.google.com/store', kind: 'store' } },
  { slug: 'banglu', title: 'Banglu', tagline: 'Type Bangla', platforms: ['web', 'desktop'], live: null },
];

function renderMap() {
  const m = enMessages.Products;
  const copy: WorkMapCopy = {
    mapLabel: m.map.label,
    note: m.map.note,
    hintFine: m.map.hint.fine,
    hintCoarse: m.map.hint.coarse,
    filterLabel: m.map.filterLabel,
    all: m.map.all,
    showing: m.map.showing,
    query: m.map.query,
    nearest: m.map.nearest,
    close: m.map.card.close,
    closest: m.map.card.closest,
    openSite: m.map.card.openSite,
    openStore: m.map.card.openStore,
    readMore: m.map.card.readMore,
  };
  return render(
    <div className="pg-work">
      <WorkMap
        products={PRODUCTS}
        filters={[
          { key: 'web', label: 'Web' },
          { key: 'android', label: 'Android' },
          { key: 'desktop', label: 'Desktop' },
        ]}
        platformLabels={m.platformLabels}
        concepts={m.map.concepts as Record<ClusterKey, string[]>}
        clusters={m.map.clusters as Record<ClusterKey, string>}
        copy={copy}
        bn={false}
      />
    </div>,
  );
}

describe('<WorkMap>', () => {
  it('renders every product as a button, with the parked query already scored', () => {
    const { container } = renderMap();
    const map = screen.getByRole('group', { name: enMessages.Products.map.label });
    for (const p of PRODUCTS) expect(within(map).getByRole('button', { name: p.title })).toBeInTheDocument();
    const scores = Array.from(container.querySelectorAll('.wk-score')).map((s) => s.textContent);
    expect(scores.filter(Boolean)).toHaveLength(3);
    for (const s of scores) expect(s).toMatch(/^[01]\.\d\d$/);
  });

  it('filters by platform and tells the page root', () => {
    const { container } = renderMap();
    const android = screen.getByRole('button', { name: 'Android' });
    fireEvent.click(android);
    expect(android).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Book-AI' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'FinCoach AI' })).toBeEnabled();
    expect(screen.getByText('Showing 1 of 3')).toBeInTheDocument();
    expect(container.querySelector('.pg-work')).toHaveAttribute('data-wk-filter', 'android');
  });

  it('opens a detail card for a product and closes it with Escape', () => {
    renderMap();
    const btn = screen.getByRole('button', { name: 'Book-AI' });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const card = screen.getByRole('group', { name: 'Book-AI' });
    expect(within(card).getByRole('link', { name: /Read more/ })).toHaveAttribute('href', '/products/book-ai');
    expect(within(card).getByRole('link', { name: /Open live site/ })).toHaveAttribute('href', 'https://book-ai.org');
    fireEvent.keyDown(btn, { key: 'Escape' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group', { name: 'Book-AI' })).not.toBeInTheDocument();
  });
});
