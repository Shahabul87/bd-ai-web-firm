/**
 * The retrieval used on /resources — deliberately simple and honest. A query
 * is a handful of key terms; an item scores 2 for every term found in its
 * title and 1 for a term found only in its description or tags, divided by
 * the best possible score, so 0 means no overlap and 1 means every term is in
 * the title. No model, no randomness: the same content always ranks the same.
 */

export type LibraryType = 'blog' | 'guide' | 'case-study';

export interface LibraryItem {
  /** Stable, unique key: `<type>:<slug>`. */
  key: string;
  type: LibraryType;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  tags: string[];
  /** ISO date string from the content. */
  date: string;
  readTime?: number;
  author?: string;
}

export interface RankedItem {
  key: string;
  score: number;
}

const SUFFIXES = ['ing', 'ed', 'es', 's'] as const;

/** Very light stemming, enough that "measure"/"measured"/"measuring" meet. */
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) return word.slice(0, -suffix.length);
  }
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);
}

function hit(term: string, tokens: readonly string[]): boolean {
  return tokens.some((t) => t === term || (term.length >= 4 && t.startsWith(term)));
}

/** Word-overlap relevance of one item to a set of key terms, in [0, 1]. */
export function score(terms: readonly string[], item: Pick<LibraryItem, 'title' | 'excerpt' | 'tags'>): number {
  if (terms.length === 0) return 0;
  const inTitle = tokenize(item.title);
  const inRest = tokenize(`${item.excerpt} ${item.tags.join(' ')}`);
  let total = 0;
  for (const raw of terms) {
    const term = stem(raw.toLowerCase().trim());
    if (!term) continue;
    if (hit(term, inTitle)) total += 2;
    else if (hit(term, inRest)) total += 1;
  }
  return total / (2 * terms.length);
}

/** All items, best first; ties keep the input order (stable sort). */
export function rank(terms: readonly string[], items: readonly LibraryItem[]): RankedItem[] {
  return items
    .map((item, i) => ({ key: item.key, score: score(terms, item), i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ key, score: s }) => ({ key, score: s }));
}

/**
 * Items related to `current`: its tags plus its title words as the query,
 * the item itself left out, anything with no overlap dropped.
 */
export function related(current: LibraryItem, items: readonly LibraryItem[], limit = 3): RankedItem[] {
  const terms = Array.from(new Set([...current.tags.flatMap((t) => t.split('-')), ...tokenize(current.title).filter((w) => w.length >= 4)]));
  return rank(
    terms,
    items.filter((it) => it.key !== current.key),
  )
    .filter((r) => r.score > 0)
    .slice(0, limit);
}

/** A title split into words and the whitespace between them (join gives the title back). */
export function splitWords(title: string): string[] {
  return title.split(/(\s+)/).filter((s) => s.length > 0);
}

/** Indexes (into `splitWords(title)`) of the words that match one of the terms. */
export function titleHits(terms: readonly string[], title: string): number[] {
  const stems = terms.map((t) => stem(t.toLowerCase().trim())).filter(Boolean);
  const out: number[] = [];
  splitWords(title).forEach((part, i) => {
    if (/^\s+$/.test(part)) return;
    const tokens = tokenize(part);
    if (stems.some((term) => hit(term, tokens))) out.push(i);
  });
  return out;
}
