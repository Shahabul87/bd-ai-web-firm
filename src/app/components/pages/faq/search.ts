/**
 * Client-side FAQ search: split a query into terms, keep the items that
 * contain every term, rank them (a hit in the question counts more than one in
 * the answer), and cut text into highlighted / plain segments. Pure functions,
 * so they are unit-tested and render identically on server and client.
 */

export interface FaqItem {
  id: string;
  categoryId: string;
  category: string;
  question: string;
  answer: string;
}

export interface Ranked {
  item: FaqItem;
  score: number;
  /** Every term was found in the answer but none in the question. */
  answerOnly: boolean;
}

/** Words too common to search on their own; ignored unless the query is only these. */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'do', 'does', 'for', 'i', 'in', 'is', 'it',
  'of', 'on', 'or', 'our', 'the', 'to', 'we', 'with', 'you', 'your',
]);

const PUNCTUATION = /[“”"'‘’?,.!:;()।—–]/g;

export function queryTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(PUNCTUATION, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const unique = Array.from(new Set(words));
  const meaningful = unique.filter((w) => !STOPWORDS.has(w));
  return meaningful.length > 0 ? meaningful : unique;
}

function count(haystack: string, needle: string): number {
  let n = 0;
  let at = haystack.indexOf(needle);
  while (at !== -1) {
    n++;
    at = haystack.indexOf(needle, at + needle.length);
  }
  return n;
}

export function rank(items: FaqItem[], terms: string[]): Ranked[] {
  if (terms.length === 0) return items.map((item) => ({ item, score: 0, answerOnly: false }));
  const out: Ranked[] = [];
  items.forEach((item) => {
    const q = item.question.toLowerCase();
    const a = item.answer.toLowerCase();
    const c = item.category.toLowerCase();
    let score = 0;
    let inQuestion = false;
    for (const term of terms) {
      const hq = count(q, term);
      const ha = count(a, term);
      const hc = count(c, term);
      if (hq + ha + hc === 0) return; // every term must appear somewhere
      if (hq > 0) inQuestion = true;
      score += hq * 3 + hc * 2 + ha;
    }
    out.push({ item, score, answerOnly: !inQuestion });
  });
  // Stable: equal scores keep page order.
  return out.sort((x, y) => y.score - x.score);
}

export interface Segment {
  text: string;
  hit: boolean;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Cut `text` into plain and matched segments (case-insensitive). */
export function highlight(text: string, terms: string[]): Segment[] {
  if (terms.length === 0) return [{ text, hit: false }];
  // Longest first, so "model" does not pre-empt "models".
  const pattern = new RegExp(`(${[...terms].sort((a, b) => b.length - a.length).map(escape).join('|')})`, 'gi');
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, hit: terms.includes(part.toLowerCase()) }));
}
