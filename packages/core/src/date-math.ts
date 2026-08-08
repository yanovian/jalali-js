import type { CalendarDateFields } from './calendar-engine.js';
import type { CalendarSystem } from './convert.js';
import { getCalendarEngine } from './convert.js';

/**
 * Adds `days` (negative to subtract) whole days to `date`, in `system`. Works by moving along
 * the date's Julian Day Number, so it is correct across a month or year boundary for any
 * calendar system with no extra per-system logic.
 */
export function addDays(
  date: CalendarDateFields,
  days: number,
  system: CalendarSystem,
): CalendarDateFields {
  const engine = getCalendarEngine(system);
  return engine.fromJulianDayNumber(engine.toJulianDayNumber(date) + days);
}

/**
 * Compares `a` and `b` chronologically within the same calendar system: negative when `a` is
 * earlier, positive when `a` is later, zero when they name the same day. Plain (year, month,
 * day) comparison, not a Julian Day Number round trip: year dominates month dominates day for
 * any calendar system this project supports, so lexicographic comparison is already correct
 * and does not need a conversion (verified against Julian Day Number ordering directly; see
 * date-math.test.ts).
 */
export function compareDates(a: CalendarDateFields, b: CalendarDateFields): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}
