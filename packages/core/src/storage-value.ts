import type { AnyCalendarDate } from './calendar-date.js';
import { toGregorian } from './convert.js';
import { getOffsetMinutes, zonedWallClockToInstant } from './timezone.js';

/**
 * How `toStorageValue()` shapes its output. `'gregorian-iso'` is the default: see
 * architecture.md's "Display value against storage value" for why a calendar-agnostic value is
 * the default rather than the display calendar's own representation. The `'jalali-*'` formats
 * are named for their original use case (an application that must persist Jalali dates as
 * such) but work the same way for whatever calendar system the date's own `system` is: they
 * give that system's native fields, unconverted, rather than the Gregorian equivalent.
 */
export type ValueFormat = 'gregorian-iso' | 'date' | 'epoch' | 'jalali-iso' | 'jalali-object';

export interface NativeCalendarObject {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  timeZone?: string;
}

export type StorageValue = string | number | Date | NativeCalendarObject;

function pad(value: number, width = 2): string {
  return String(Math.trunc(value)).padStart(width, '0');
}

function offsetString(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'Z';
  const sign = offsetMinutes > 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  return `${sign}${pad(Math.floor(absMinutes / 60))}:${pad(absMinutes % 60)}`;
}

interface DateFields {
  year: number;
  month: number;
  day: number;
}

interface TimeFields {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

function isoDatePart(date: DateFields): string {
  return `${pad(date.year, 4)}-${pad(date.month)}-${pad(date.day)}`;
}

function isoString(date: DateFields, time?: TimeFields): string {
  if (!time) return isoDatePart(date);
  const timePart = `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}.${pad(time.millisecond, 3)}`;
  return `${isoDatePart(date)}T${timePart}`;
}

// `date`'s own time-of-day fields, or midnight for a date-only precision. Time-of-day does not
// change between calendar systems, only the date part does, so this is reused as-is for both
// the Gregorian and the native representation.
function timeFieldsOf(date: AnyCalendarDate): TimeFields | undefined {
  if (date.precision === 'date') return undefined;
  const { hour, minute, second, millisecond } = date;
  return { hour, minute, second, millisecond };
}

function toInstantMs(date: AnyCalendarDate): number {
  const gregorianDate = toGregorian(date, date.system);
  const time = timeFieldsOf(date) ?? { hour: 0, minute: 0, second: 0, millisecond: 0 };
  if (date.precision !== 'zoned-datetime') {
    // No timezone attached: treat the wall-clock time as UTC. This is a documented convention,
    // not a guess; a value that must round-trip through a specific timezone should use the
    // 'zoned-datetime' precision tier instead.
    return Date.UTC(
      gregorianDate.year,
      gregorianDate.month - 1,
      gregorianDate.day,
      time.hour,
      time.minute,
      time.second,
      time.millisecond,
    );
  }
  return zonedWallClockToInstant({ ...gregorianDate, ...time }, date.timeZone);
}

function toGregorianIso(date: AnyCalendarDate): string {
  const gregorianDate = toGregorian(date, date.system);
  const time = timeFieldsOf(date);
  const iso = isoString(gregorianDate, time);
  if (date.precision !== 'zoned-datetime') return iso;
  const offset = offsetString(getOffsetMinutes(toInstantMs(date), date.timeZone));
  return `${iso}${offset}`;
}

function toNativeObject(date: AnyCalendarDate): NativeCalendarObject {
  const { year, month, day } = date;
  if (date.precision === 'date') return { year, month, day };
  const { hour, minute, second, millisecond } = date;
  if (date.precision === 'datetime') return { year, month, day, hour, minute, second, millisecond };
  return { year, month, day, hour, minute, second, millisecond, timeZone: date.timeZone };
}

/**
 * Converts a calendar date to a plain storage value, defaulting to a Gregorian, calendar-
 * agnostic representation (see architecture.md). The shape follows the date's precision tier;
 * see the `ValueFormat` doc comment for what each format means.
 */
export function toStorageValue(
  date: AnyCalendarDate,
  format: ValueFormat = 'gregorian-iso',
): StorageValue {
  switch (format) {
    case 'gregorian-iso':
      return toGregorianIso(date);
    case 'date':
      return new Date(toInstantMs(date));
    case 'epoch':
      return toInstantMs(date);
    case 'jalali-iso':
      return isoString(date, timeFieldsOf(date));
    case 'jalali-object':
      return toNativeObject(date);
  }
}
