#!/usr/bin/env node
/**
 * Performance budget gate (Phase 7 Task 7.3).
 *
 * Enforces the `enforced` budgets in perf-budgets.json deterministically from
 * the production build output — no browser required:
 *   1. First-load JS per route  (gzipped sum from .next/app-build-manifest.json)
 *   2. HTML weight per page      (raw + gzipped, from .next/server/app/**.html)
 *   3. Image weight per file     (public/** raster assets)
 *
 * The `runtime` targets (LCP/CLS/INP/Lighthouse a11y) need a real browser and
 * are printed for reference only — they are validated by the manual browser
 * test plan and the throttled-mobile Lighthouse run, not by this script.
 *
 * Usage: npm run build && npm run check:budgets
 * Exit code 1 on any enforced-budget breach, 2 if the build is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEXT = path.join(ROOT, '.next');
const budgets = JSON.parse(fs.readFileSync(path.join(ROOT, 'perf-budgets.json'), 'utf8'));
const KB = 1024;

if (!fs.existsSync(path.join(NEXT, 'app-build-manifest.json'))) {
  console.error('✗ No production build found. Run `npm run build` first.');
  process.exit(2);
}

/** @type {string[]} */
const breaches = [];
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  breaches.push(msg);
  console.log(`  ✗ ${msg}`);
};

function walk(dir, test) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, test);
    return test(e.name) ? [full] : [];
  });
}

// 1. First-load JS per route (gzipped) --------------------------------------
console.log('\nFirst-load JS (gzipped, per route):');
{
  const manifest = JSON.parse(fs.readFileSync(path.join(NEXT, 'app-build-manifest.json'), 'utf8'));
  const budget = budgets.enforced.firstLoadJsKb.perRoute;
  const gzipCache = new Map();
  const gz = (rel) => {
    if (!gzipCache.has(rel)) {
      try {
        gzipCache.set(rel, zlib.gzipSync(fs.readFileSync(path.join(NEXT, rel))).length);
      } catch {
        gzipCache.set(rel, 0);
      }
    }
    return gzipCache.get(rel);
  };
  const routes = Object.keys(manifest.pages).filter(
    (k) => k.endsWith('/page') && !k.startsWith('/api'),
  );
  let worst = { route: '', kb: 0 };
  for (const route of routes) {
    const unique = new Set(manifest.pages[route].filter((f) => f.endsWith('.js')));
    let bytes = 0;
    for (const f of unique) bytes += gz(f);
    const kb = Math.round(bytes / KB);
    if (kb > worst.kb) worst = { route, kb };
    if (kb > budget) fail(`${route}: ${kb} kB > ${budget} kB budget`);
  }
  if (breaches.length === 0) pass(`all ${routes.length} routes ≤ ${budget} kB (worst: ${worst.route} ${worst.kb} kB)`);
}

// 2. HTML weight per page ----------------------------------------------------
console.log('\nHTML weight per page (raw / gzipped):');
{
  const { perPageRaw, perPageGzip } = budgets.enforced.htmlKb;
  const files = walk(path.join(NEXT, 'server', 'app'), (n) => n.endsWith('.html'));
  let worst = { file: '', raw: 0, gz: 0 };
  let breachedHtml = false;
  for (const file of files) {
    const buf = fs.readFileSync(file);
    const raw = Math.round(buf.length / KB);
    const gzk = Math.round(zlib.gzipSync(buf).length / KB);
    const rel = path.relative(path.join(NEXT, 'server', 'app'), file);
    if (raw > worst.raw) worst = { file: rel, raw, gz: gzk };
    if (raw > perPageRaw) {
      fail(`${rel}: ${raw} kB raw > ${perPageRaw} kB budget`);
      breachedHtml = true;
    }
    if (gzk > perPageGzip) {
      fail(`${rel}: ${gzk} kB gzip > ${perPageGzip} kB budget`);
      breachedHtml = true;
    }
  }
  if (!breachedHtml) {
    pass(`all ${files.length} pages ≤ ${perPageRaw} kB raw / ${perPageGzip} kB gzip (worst: ${worst.file} ${worst.raw}/${worst.gz} kB)`);
  }
}

// 3. Image weight per file ---------------------------------------------------
console.log('\nImage weight (public/ raster assets):');
{
  const perFile = budgets.enforced.imageKb.perFile;
  const files = walk(path.join(ROOT, 'public'), (n) => /\.(png|jpe?g|webp|gif|avif)$/i.test(n));
  let worst = { file: '', kb: 0 };
  let breachedImg = false;
  for (const file of files) {
    const kb = Math.round(fs.statSync(file).size / KB);
    const rel = path.relative(ROOT, file);
    if (kb > worst.kb) worst = { file: rel, kb };
    if (kb > perFile) {
      fail(`${rel}: ${kb} kB > ${perFile} kB budget`);
      breachedImg = true;
    }
  }
  if (!breachedImg) {
    pass(files.length ? `all ${files.length} images ≤ ${perFile} kB (largest: ${worst.file} ${worst.kb} kB)` : 'no raster images in public/');
  }
}

// Runtime targets (informational) -------------------------------------------
const rt = budgets.runtime;
console.log('\nRuntime targets (validated via Lighthouse / manual browser test, not here):');
console.log(`  LCP ≤ ${rt.lcpMs} ms · CLS ≤ ${rt.cls} · INP ≤ ${rt.inpMs} ms · Lighthouse a11y ≥ ${rt.lighthouseAccessibility}`);

console.log('');
if (breaches.length) {
  console.error(`✗ ${breaches.length} performance budget breach(es).`);
  process.exit(1);
}
console.log('✓ All enforced performance budgets pass.');
