import type { HolidayDateFields } from './types.js';

/** True when two Jalali field bags name the same calendar day. */
export function sameYmd(a: HolidayDateFields, b: HolidayDateFields): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** Append `date` when the list does not already hold that day. */
export function pushUniqueYmd(dates: HolidayDateFields[], date: HolidayDateFields): void {
  if (!dates.some((entry) => sameYmd(entry, date))) dates.push(date);
}
