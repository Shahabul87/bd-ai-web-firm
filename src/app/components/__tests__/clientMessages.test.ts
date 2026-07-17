/**
 * Guards the client-message allowlist (Phase 7 Task 7.3).
 *
 * The marketing layout serializes ONLY `CLIENT_NAMESPACES` into the browser
 * (see src/i18n/clientMessages.ts). If a Client Component under the marketing
 * layout reads a namespace that is NOT in the allowlist, it renders a
 * MISSING_MESSAGE error at runtime — invisible to a plain build. This test
 * fails the moment that invariant is broken, in either direction:
 *   - a client namespace missing from the allowlist (runtime break), and
 *   - an allowlisted namespace no client component uses (dead payload weight).
 */
import fs from 'fs';
import path from 'path';
import { CLIENT_NAMESPACES } from '@/i18n/clientMessages';
import enMessages from '../../../../messages/en.json';

const SRC = path.join(process.cwd(), 'src', 'app');
// Marketing-layout subtrees. Admin/portal use their own providers and are
// intentionally excluded — their namespaces are not part of this allowlist.
const ROOTS = [path.join(SRC, '(site)'), path.join(SRC, 'components')];
const EXCLUDE = /[/\\](admin|portal)[/\\]/;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (!/\.(tsx?|jsx?)$/.test(entry.name)) return [];
    if (EXCLUDE.test(full)) return [];
    return [full];
  });
}

/** Top-level namespaces read by `'use client'` components under the marketing layout. */
function collectClientNamespaces(): Set<string> {
  const used = new Set<string>();
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const src = fs.readFileSync(file, 'utf8');
      if (!/^['"]use client['"]/m.test(src)) continue;
      for (const m of src.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]/g)) {
        used.add(m[1].split('.')[0]); // top-level namespace
      }
      // Formatter/locale hooks need no messages; only useTranslations matters.
    }
  }
  return used;
}

describe('client message allowlist', () => {
  const used = collectClientNamespaces();

  it('lists every namespace read by a client component', () => {
    const missing = [...used].filter((ns) => !CLIENT_NAMESPACES.includes(ns as never));
    expect(missing).toEqual([]);
  });

  it('does not list dead namespaces no client component uses', () => {
    const dead = CLIENT_NAMESPACES.filter((ns) => !used.has(ns));
    expect(dead).toEqual([]);
  });

  it('every allowlisted namespace exists in the catalog', () => {
    const unknown = CLIENT_NAMESPACES.filter((ns) => !(ns in enMessages));
    expect(unknown).toEqual([]);
  });
});
