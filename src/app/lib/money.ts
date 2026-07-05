/**
 * Pure money helpers. All monetary amounts are INTEGER minor units (cents /
 * poisha); tax rates are basis points (1500 = 15.00%). Never use floats for
 * money arithmetic — only these functions.
 */

const SYMBOLS: Record<string, string> = { USD: '$', BDT: '৳' };

export function lineTotalMinor(quantity: number, unitPriceMinor: number): number {
  return Math.round(quantity) * Math.round(unitPriceMinor);
}

export function computeTotals(
  lines: { quantity: number; unitPriceMinor: number }[],
  taxRateBps: number,
): { subtotalMinor: number; taxMinor: number; totalMinor: number } {
  const subtotalMinor = lines.reduce((s, l) => s + lineTotalMinor(l.quantity, l.unitPriceMinor), 0);
  const taxMinor = Math.round((subtotalMinor * taxRateBps) / 10000);
  return { subtotalMinor, taxMinor, totalMinor: subtotalMinor + taxMinor };
}

export function formatMoney(minor: number, currency: string): string {
  const neg = minor < 0;
  const major = (Math.abs(minor) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sym = SYMBOLS[currency];
  const body = sym ? `${sym}${major}` : `${currency} ${major}`;
  return neg ? `-${body}` : body;
}

/** "1,500.50" -> 150050. Returns null for non-numeric or >2 decimal input. */
export function parseMoneyToMinor(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ''] = cleaned.split('.');
  const paddedFrac = (frac + '00').slice(0, 2);
  return Number(whole) * 100 + Number(paddedFrac);
}
