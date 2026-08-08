import type { CalendarDateFields } from './calendar-engine.js';
import type { CalendarSystem } from './convert.js';
import { getCalendarEngine } from './convert.js';

/**
 * The day of the week for `date`, as an index 0-6: 0 is Sunday, 6 is Saturday, matching the
 * `Date.prototype.getUTCDay()` convention. Calendar-system-agnostic: derived from the date's
 * Julian Day Number, the same underlying day count regardless of which calendar expresses it.
 * Verified against `Date.prototype.getUTCDay()` across a wide range of random dates (see
 * day-of-week.test.ts).
 */
export function dayOfWeek(date: CalendarDateFields, system: CalendarSystem): number {
  const jdn = getCalendarEngine(system).toJulianDayNumber(date);
  return (((jdn + 1) % 7) + 7) % 7;
}
