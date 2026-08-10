import type { CalendarDateFields } from './calendar-engine.js';
import { createCalendar } from './calendar.js';
import type { CalendarSystem } from './convert.js';
import { getCalendarEngine } from './convert.js';
import { dayOfWeek } from './day-of-week.js';

/**
 * The day a week starts on, per calendar system, as a `dayOfWeek()` index (0 = Sunday,
 * 6 = Saturday). Jalali weeks culturally start on Saturday; Gregorian ones on Sunday. This is
 * the default for `startOf()`/`endOf()` (which take an explicit week start too, since
 * Gregorian weeks also commonly start on Monday) and the week start `buildCalendarGrid()`
 * lays rows out by.
 */
export const WEEK_START_DAY: Record<CalendarSystem, number> = {
  jalali: 6,
  gregorian: 0,
};

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

/**
 * Adds `months` (negative to subtract) whole calendar months to `date`, in `system`. When the
 * target month is shorter than `date.day`, the day clamps to the target month's last day
 * (Farvardin 31 plus 6 months gives Mehr 30).
 */
export function addMonths(
  date: CalendarDateFields,
  months: number,
  system: CalendarSystem,
): CalendarDateFields {
  const { monthsInYear, daysInMonth } = getCalendarEngine(system);
  const monthIndex = date.year * monthsInYear + (date.month - 1) + months;
  const year = Math.floor(monthIndex / monthsInYear);
  const month = monthIndex - year * monthsInYear + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/**
 * Adds `years` (negative to subtract) whole calendar years to `date`, in `system`. The day
 * clamps like `addMonths()` (Esfand 30 of a leap year plus one year gives Esfand 29).
 */
export function addYears(
  date: CalendarDateFields,
  years: number,
  system: CalendarSystem,
): CalendarDateFields {
  return addMonths(date, years * getCalendarEngine(system).monthsInYear, system);
}

export type DiffUnit = 'day' | 'week' | 'month' | 'year';

/**
 * The number of whole `unit`s between `a` and `b`, signed like `compareDates()`: positive when
 * `a` is later, negative when `a` is earlier. Truncates toward zero: a unit counts only once
 * it has fully passed, so 6 Mordad to 5 Shahrivar is 0 months and 6 Mordad to 6 Shahrivar
 * is 1. Month and year steps use `addMonths()`/`addYears()`, clamping included, so
 * `diffDates(addMonths(d, n), d, 'month')` is always `n`.
 */
export function diffDates(
  a: CalendarDateFields,
  b: CalendarDateFields,
  unit: DiffUnit,
  system: CalendarSystem,
): number {
  const engine = getCalendarEngine(system);
  if (unit === 'day' || unit === 'week') {
    const days = engine.toJulianDayNumber(a) - engine.toJulianDayNumber(b);
    // The `+ 0` keeps a zero result at plain 0: Math.trunc gives -0 for a small negative
    // fraction, such as -3 days over 7.
    return unit === 'day' ? days : Math.trunc(days / 7) + 0;
  }
  // `0 - x` rather than `-x`, for the same reason: negating a zero diff must not give -0.
  if (compareDates(a, b) < 0) return 0 - diffDates(b, a, unit, system);
  const raw =
    unit === 'month'
      ? (a.year - b.year) * engine.monthsInYear + (a.month - b.month)
      : a.year - b.year;
  const step = unit === 'month' ? addMonths : addYears;
  // `raw` counts calendar-month (or -year) boundaries crossed. It overshoots by exactly one
  // when the final unit has not fully passed (a's day-of-month is still before b's), and the
  // step function's clamping decides that edge, not a plain day comparison.
  return compareDates(step(b, raw, system), a) > 0 ? raw - 1 : raw;
}

export type PeriodUnit = 'week' | 'month' | 'year';

/**
 * The first day of the week, month, or year containing `date`, in `system`. A week's start day
 * varies by culture, so `weekStartDay` is a parameter (a `dayOfWeek()` index); it defaults to
 * `WEEK_START_DAY[system]` and is ignored for the other units.
 */
export function startOf(
  date: CalendarDateFields,
  unit: PeriodUnit,
  system: CalendarSystem,
  weekStartDay: number = WEEK_START_DAY[system],
): CalendarDateFields {
  if (unit === 'week') {
    const daysSinceWeekStart = (dayOfWeek(date, system) - weekStartDay + 7) % 7;
    return addDays(date, -daysSinceWeekStart, system);
  }
  return { year: date.year, month: unit === 'month' ? date.month : 1, day: 1 };
}

/**
 * The last day of the week, month, or year containing `date`, in `system`. Takes the same
 * `weekStartDay` parameter as `startOf()`.
 */
export function endOf(
  date: CalendarDateFields,
  unit: PeriodUnit,
  system: CalendarSystem,
  weekStartDay: number = WEEK_START_DAY[system],
): CalendarDateFields {
  if (unit === 'week') return addDays(startOf(date, 'week', system, weekStartDay), 6, system);
  const { monthsInYear, daysInMonth } = getCalendarEngine(system);
  const month = unit === 'month' ? date.month : monthsInYear;
  return { year: date.year, month, day: daysInMonth(date.year, month) };
}

// The query helpers below are thin wrappers over compareDates(), one line each, so an app that
// imports only one of them tree-shakes to almost nothing.

export function isBefore(a: CalendarDateFields, b: CalendarDateFields): boolean {
  return compareDates(a, b) < 0;
}

export function isAfter(a: CalendarDateFields, b: CalendarDateFields): boolean {
  return compareDates(a, b) > 0;
}

export function isSameDay(a: CalendarDateFields, b: CalendarDateFields): boolean {
  return compareDates(a, b) === 0;
}

/** True when `date` falls inside `start`..`end`, bounds included. */
export function isBetween(
  date: CalendarDateFields,
  start: CalendarDateFields,
  end: CalendarDateFields,
): boolean {
  return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
}

/** True when `date` names the current day in `system`, read from the local system clock the
 * same way `createCalendar().today()` reads it. */
export function isToday(date: CalendarDateFields, system: CalendarSystem): boolean {
  return isSameDay(date, createCalendar({ system }).today());
}
