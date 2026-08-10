import type { CalendarDate } from './calendar-date.js';
import type { CalendarDateFields } from './calendar-engine.js';
import { addDays, compareDates, isAfter, isBefore, isSameDay } from './date-math.js';
import { dayOfWeek } from './day-of-week.js';

/**
 * Limits on what a picker lets the user select. All rule dates are plain
 * `{ year, month, day }` fields, read in the same calendar system as the date under test.
 */
export interface SelectionRules {
  /** The earliest selectable date, included. */
  minDate?: CalendarDateFields;
  /** The latest selectable date, included. */
  maxDate?: CalendarDateFields;
  /** When set, only these dates are selectable. This list wins over every other rule. */
  enabledDates?: readonly CalendarDateFields[];
  /** Dates that are never selectable. */
  disabledDates?: readonly CalendarDateFields[];
  /** Weekdays that are never selectable. Index 0 is Sunday and 6 is Saturday. */
  disabledWeekdays?: readonly number[];
}

function listed(date: CalendarDate, list: readonly CalendarDateFields[]): boolean {
  return list.some((entry) => isSameDay(date, entry));
}

/**
 * True when `rules` allow selecting `date`. The priority order:
 *
 * 1. `enabledDates`, when set, decides alone.
 * 2. `disabledDates` blocks a listed date.
 * 3. `disabledWeekdays` blocks a listed weekday.
 * 4. `minDate` and `maxDate` block dates outside the bounds.
 */
export function isDateSelectable(date: CalendarDate, rules?: SelectionRules): boolean {
  if (!rules) return true;
  if (rules.enabledDates) return listed(date, rules.enabledDates);
  if (rules.disabledDates && listed(date, rules.disabledDates)) return false;
  if (rules.disabledWeekdays?.includes(dayOfWeek(date, date.system))) return false;
  if (rules.minDate && isBefore(date, rules.minDate)) return false;
  if (rules.maxDate && isAfter(date, rules.maxDate)) return false;
  return true;
}

/**
 * True when every day from `start` to `end` (bounds included) is selectable. The range
 * pickers use this to decide whether a candidate range may complete: a range that crosses a
 * blocked day does not complete, and the click starts a new range instead.
 */
export function isRangeSelectable(
  start: CalendarDate,
  end: CalendarDate,
  rules?: SelectionRules,
): boolean {
  if (!rules) return true;
  let current = start;
  while (compareDates(current, end) <= 0) {
    if (!isDateSelectable(current, rules)) return false;
    current = {
      precision: 'date',
      system: current.system,
      ...addDays(current, 1, current.system),
    };
  }
  return true;
}
