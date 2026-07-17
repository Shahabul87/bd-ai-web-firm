const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

/** Map ASCII digits 0-9 in a string to Bengali numerals (০-৯), leaving everything
 *  else untouched. Use for runtime-computed numbers (e.g. the current year) that
 *  should render as Bengali numerals on /bn — the numeral convention keeps prose/
 *  date numbers Bengali while technical tokens (10x, $50K, versions) stay Latin,
 *  so apply this only to plain prose/date numbers, not to technical strings. */
export function toBengaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}
