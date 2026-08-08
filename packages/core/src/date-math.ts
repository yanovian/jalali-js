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
