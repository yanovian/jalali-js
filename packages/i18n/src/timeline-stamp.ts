import type { CalendarDateFields, CalendarSystem, TimeOfDay } from 'jalali-js';
import type { FormatOptions } from './format.js';
import { format } from './format.js';
import type { LocalePack } from './locale.js';
import { formatNumber } from './numerals.js';

/**
 * Formats a timeline card stamp: optional `HH:mm - ` plus a date. Uses locale
 * digits from `options.numerals` or the locale default.
 */
export function formatTimelineStamp(
  start: CalendarDateFields,
  system: CalendarSystem,
  locale: LocalePack,
  options: FormatOptions = {},
  startTime?: TimeOfDay,
): string {
  const numerals = options.numerals ?? locale.defaultNumerals;
  const dateText = format({ precision: 'date', system, ...start }, locale, {
    ...options,
    template: options.template ?? 'YYYY/MM/DD',
    numerals,
  });
  if (!startTime) return dateText;
  const hour = formatNumber(startTime.hour, numerals, locale.digits, 2);
  const minute = formatNumber(startTime.minute, numerals, locale.digits, 2);
  return `${hour}:${minute} - ${dateText}`;
}
