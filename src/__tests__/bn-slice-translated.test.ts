import bn from '../../messages/bn.json';

const BENGALI = /[ঀ-৿]/;

type Json = { [k: string]: unknown };
function hasBengali(v: unknown): boolean {
  if (typeof v === 'string') return BENGALI.test(v);
  if (Array.isArray(v)) return v.some(hasBengali);
  if (v && typeof v === 'object') return Object.values(v as Json).some(hasBengali);
  return false;
}

// The stage-3a calibration slice is translated to Bengali (the founder's corrected
// voice). These must STAY Bengali through stage 3b so a later bulk edit or a bad
// merge cannot silently revert them to the English placeholder. A whole namespace
// reverting to English fails here.
const SLICE = ['Nav', 'Header', 'Footer', 'CTABand', 'PillarCards', 'Home'] as const;

describe('bn calibration slice stays translated', () => {
  it.each(SLICE)('%s contains Bengali', (ns) => {
    expect(hasBengali((bn as Json)[ns])).toBe(true);
  });

  it('Services.web contains Bengali', () => {
    expect(hasBengali((bn as { Services: { web: unknown } }).Services.web)).toBe(true);
  });
});
