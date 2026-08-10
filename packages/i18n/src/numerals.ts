const LATIN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export type NumeralStyle = 'latin' | 'native';

/**
 * Renders `value` (a non-negative integer) using either Latin digits or a locale's own native
 * digit characters (for example Persian ۰-۹). `minWidth` zero-pads the result, in the chosen
 * digit style.
 */
export function formatNumber(
  value: number,
  style: NumeralStyle,
  digits: readonly string[],
  minWidth = 0,
): string {
  const latin = String(Math.trunc(value)).padStart(minWidth, '0');
  if (style === 'latin') return latin;
  return latin.replace(
    /[0-9]/g,
    (digit) => digits[LATIN_DIGITS.indexOf(digit as (typeof LATIN_DIGITS)[number])] as string,
  );
}
