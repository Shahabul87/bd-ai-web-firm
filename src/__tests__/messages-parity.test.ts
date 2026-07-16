import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import en from '../../messages/en.json';
import bn from '../../messages/bn.json';

type Json = { [k: string]: unknown };

const LOCALE_FILES = ['en.json', 'bn.json'] as const;
const messagesDir = join(process.cwd(), 'messages');
const rawOf = (file: string) => readFileSync(join(messagesDir, file), 'utf8');

/** Recursively collect dotted key paths. Arrays are leaves: their SHAPE is
 *  checked, but per-index divergence inside an array of strings is not a
 *  missing-key bug, so we compare lengths at the array node. */
function keyPaths(obj: Json, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) return [`${path}[]:${v.length}`];
    if (v && typeof v === 'object') return keyPaths(v as Json, path);
    return [path];
  });
}

describe('messages en/bn parity', () => {
  it('has identical key sets in both locales', () => {
    const enKeys = keyPaths(en as Json).sort();
    const bnKeys = keyPaths(bn as Json).sort();
    const missingInBn = enKeys.filter((k) => !bnKeys.includes(k));
    const extraInBn = bnKeys.filter((k) => !enKeys.includes(k));
    expect({ missingInBn, extraInBn }).toEqual({ missingInBn: [], extraInBn: [] });
  });

  it('has no empty string values', () => {
    const empties: string[] = [];
    const walk = (o: Json, p = '') => {
      Object.entries(o).forEach(([k, v]) => {
        const path = p ? `${p}.${k}` : k;
        if (typeof v === 'string' && v.trim() === '') empties.push(path);
        else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v as Json, path);
      });
    };
    walk(en as Json);
    walk(bn as Json);
    expect(empties).toEqual([]);
  });

  /* Added after a real near-miss in stage 2: a generator spliced a SECOND top-level
   * "Services" key into both files. JSON.parse silently keeps the LAST duplicate, so
   * lint, type-check, the whole suite, this file's parity check, a 275-string copy
   * comparison AND a cold 110/110 build all went green while 442 lines of stale copy
   * sat above it. Every gate in this repo is blind to duplicate keys, because they all
   * read the PARSED object — by which point the duplicate is already gone. This test
   * reads the RAW TEXT instead, which is the only way to see it.
   *
   * Scope, honestly: this catches a duplicated TOP-LEVEL namespace, which is the
   * observed failure mode (a spliced-in block). It relies on this file's 2-space
   * top-level indentation. It would not catch a duplicate nested deeper; doing that
   * properly needs a real streaming parser, which is not worth a dependency here. */
  it.each(LOCALE_FILES)('has no duplicate top-level namespace in %s', (file) => {
    const raw = rawOf(file);
    const rawTopLevelKeys = [...raw.matchAll(/^ {2}"([^"]+)":/gm)].map((m) => m[1]);
    const parsedKeys = Object.keys(JSON.parse(raw) as Json);

    const duplicates = rawTopLevelKeys.filter((k, i) => rawTopLevelKeys.indexOf(k) !== i);
    expect({ file, duplicates }).toEqual({ file, duplicates: [] });
    // Belt and braces: a duplicate makes the raw count exceed the parsed count.
    expect(rawTopLevelKeys.length).toBe(parsedKeys.length);
  });

  /* The spec (docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md:248) states the
   * mono "drafting" labels stay English/Latin in BOTH locales — they are brand ornament,
   * not prose. Stage 2 task 4 extracted them into the messages anyway, making them
   * translator-editable; nothing caught it because it violates no type and breaks no
   * render. It was reverted, but nothing stopped it recurring. This does. */
  it('keeps the fig. drafting ornament out of the message files', () => {
    const offenders: string[] = [];
    const walk = (o: Json, p = '') => {
      Object.entries(o).forEach(([k, v]) => {
        const path = p ? `${p}.${k}` : k;
        if (typeof v === 'string' && /^fig\.\s*\d/i.test(v.trim())) offenders.push(`${path} = "${v}"`);
        else if (v && typeof v === 'object') walk(v as Json, path);
      });
    };
    walk(en as Json);
    walk(bn as Json);
    expect(offenders).toEqual([]);
  });
});
