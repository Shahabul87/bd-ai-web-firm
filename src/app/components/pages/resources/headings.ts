export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Pull the h2/h3 headings out of Velite's compiled MDX, so the table of
 * contents is server-rendered (readable without JavaScript). rehype-slug gives
 * every heading an `id` and rehype-autolink-headings wraps its text in a link,
 * which compiles to `x(y.h2,{id:"…",children:x(y.a,{href:"#…",children:"…"})})`.
 * A heading whose text is not a plain string (inline code, emphasis) falls
 * back to its slug, de-hyphenated.
 */
export function extractHeadings(code: string): TocHeading[] {
  const out: TocHeading[] = [];
  const re = /\w+\.(h2|h3),\{id:"([^"]+)",children:([^\n]*?)\}\)(?=,|\])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const level = m[1] === 'h2' ? 2 : 3;
    const id = m[2];
    const text = /children:"((?:[^"\\]|\\.)*)"/.exec(m[3]);
    let label = id.replace(/-/g, ' ');
    if (text) {
      try {
        label = JSON.parse(`"${text[1]}"`) as string;
      } catch {
        /* keep the slug-derived label */
      }
    }
    out.push({ id, text: label, level });
  }
  return out;
}
