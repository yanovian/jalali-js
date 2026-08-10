import type { AnyCalendarDate } from 'jalali-js';
import { dayOfWeek } from 'jalali-js';
import type { LocalePack } from './locale.js';
import { formatNumber, type NumeralStyle } from './numerals.js';
import { formatTemplate } from './template.js';

export interface FormatOptions {
  /** Long month/weekday names ("Mordad", "Monday") or short ones ("Mor", "Mon"). Default: 'long'. */
  style?: 'long' | 'short';
  /** Prefix the formatted date with its weekday name. Default: false. */
  weekday?: boolean;
  /** Latin digits or the locale's own native digits. Default: the locale's `defaultNumerals`. */
  numerals?: NumeralStyle;
  /** A token template, e.g. `'YYYY/MM/DD'`. When set, `style` and `weekday` are ignored. */
  template?: string;
}

/**
 * Formats `date` for display, in `locale`'s language, using `date.system`'s own month names.
 * This is a display-only concern (see architecture.md's "Display value against storage
 * value"): it never affects what `toStorageValue()` in `jalali-js` returns.
 */
export function format(
  date: AnyCalendarDate,
  locale: LocalePack,
  options: FormatOptions = {},
): string {
  const style = options.style ?? 'long';
  const numerals = options.numerals ?? locale.defaultNumerals;
  if (options.template) return formatTemplate(date, locale, options.template, numerals);

  const monthNames = locale.monthNames[date.system][style];
  const monthName = monthNames[date.month - 1] ?? '';
  const day = formatNumber(date.day, numerals, locale.digits);
  const year = formatNumber(date.year, numerals, locale.digits);
  const datePart = `${day} ${monthName} ${year}`;

  if (!options.weekday) return datePart;
  const weekdayNames = locale.weekdayNames[style];
  const weekdayName = weekdayNames[dayOfWeek(date, date.system)] ?? '';
  return `${weekdayName}${locale.weekdaySeparator}${datePart}`;
}
