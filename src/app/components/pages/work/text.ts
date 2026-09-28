/**
 * Product front matter was written for an MDX context and carries a few HTML
 * entities (`Bloom&apos;s`). Rendered as plain strings React would print them
 * literally, so decode the handful that occur.
 */
const ENTITIES: Record<string, string> = {
  '&apos;': '’',
  '&#39;': '’',
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(?:apos|#39|quot|amp|lt|gt);/g, (m) => ENTITIES[m] ?? m);
}
