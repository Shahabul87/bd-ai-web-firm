import { lineTotalMinor, computeTotals, formatMoney, parseMoneyToMinor } from '../money';

describe('money', () => {
  it('line total', () => expect(lineTotalMinor(3, 5000)).toBe(15000));

  it('computeTotals with 15% tax', () => {
    expect(
      computeTotals(
        [
          { quantity: 2, unitPriceMinor: 50000 },
          { quantity: 1, unitPriceMinor: 20000 },
        ],
        1500,
      ),
    ).toEqual({ subtotalMinor: 120000, taxMinor: 18000, totalMinor: 138000 });
  });

  it('computeTotals rounds tax', () => {
    // subtotal 100003, 15% = 15000.45 -> 15000
    expect(computeTotals([{ quantity: 1, unitPriceMinor: 100003 }], 1500).taxMinor).toBe(15000);
  });

  it('zero tax', () =>
    expect(computeTotals([{ quantity: 1, unitPriceMinor: 999 }], 0)).toEqual({
      subtotalMinor: 999,
      taxMinor: 0,
      totalMinor: 999,
    }));

  it('formats USD', () => expect(formatMoney(150000, 'USD')).toBe('$1,500.00'));
  it('formats BDT', () => expect(formatMoney(150000, 'BDT')).toBe('৳1,500.00'));
  it('formats unknown currency with ISO prefix', () => expect(formatMoney(100000, 'EUR')).toBe('EUR 1,000.00'));
  it('formats negative', () => expect(formatMoney(-2550, 'USD')).toBe('-$25.50'));

  it('parses money to minor', () => {
    expect(parseMoneyToMinor('1,500.50')).toBe(150050);
    expect(parseMoneyToMinor('1500')).toBe(150000);
    expect(parseMoneyToMinor('9.9')).toBe(990);
    expect(parseMoneyToMinor('abc')).toBeNull();
    expect(parseMoneyToMinor('')).toBeNull();
    expect(parseMoneyToMinor('1.234')).toBeNull();
  });
});
