import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// `fs.globSync` only exists in Node 22+'s runtime; @types/node is pinned to v20
// here (pulled in transitively by jest), so its declarations don't expose
// globSync and `npm run type-check` fails even though the call works at
// runtime. A small typed recursive walk avoids depending on an untyped API or
// adding fast-glob as an undeclared (phantom) dependency just for one test.
function listTsxFilesRecursively(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTsxFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// A locale-routed component that imports next/link renders an unprefixed href,
// which silently drops a Bengali visitor back to the English page. Locale-routed
// code must use @/i18n/navigation instead. (internal)/ is exempt: admin and
// portal are never localized. analytics.tsx and StructuredData.tsx are exempt
// per Task 10 scope (analytics needs the real locale-prefixed URL; SEO handling
// of StructuredData is a later stage).
it('has no next/link imports in locale-routed code', () => {
  const appDir = join(process.cwd(), 'src', 'app');
  const files = listTsxFilesRecursively(appDir)
    .filter((f) => !f.includes('(internal)'))
    .filter((f) => !f.includes('__tests__'));

  const offenders = files
    .filter((f) => /from ['"]next\/link['"]/.test(readFileSync(f, 'utf8')))
    .map((f) => f.slice(process.cwd().length + 1));

  expect(offenders).toEqual([]);
});
