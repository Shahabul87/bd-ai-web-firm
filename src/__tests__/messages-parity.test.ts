import en from '../../messages/en.json';
import bn from '../../messages/bn.json';

type Json = { [k: string]: unknown };

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
});
