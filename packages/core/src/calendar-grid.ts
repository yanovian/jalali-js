import type { CalendarDate } from './calendar-date.js';
import type { CalendarSystem } from './convert.js';
import { getCalendarEngine } from './convert.js';
import { addDays, isSameDay, WEEK_START_DAY } from './date-math.js';
import { dayOfWeek } from './day-of-week.js';
import { isDateSelectable, type SelectionRules } from './selection-rules.js';

export interface CalendarGridDay {
  date: CalendarDate;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  /** False when the grid's `SelectionRules` block this day. True without rules. */
  isSelectable: boolean;
  /**
   * True when `isHolidayDay` marks this cell. Bindings render a `data-holiday`
   * attribute from this flag. The predicate itself lives outside core (see
   * `@jalali-js/holidays`).
   */
  isHoliday: boolean;
}

/**
 * The full weeks of grid cells needed to display `year`/`month`, padded with the trailing days
 * of the previous month and the leading days of the next month so every row is a complete
 * week. `today` and `selected` mark the matching cells via `isToday`/`isSelected`, for a
 * consumer to style. `rules` marks blocked cells via `isSelectable` (see
 * `isDateSelectable()`), so every binding gets the same behavior from this one place.
 * Optional `isHolidayDay` marks holiday cells via `isHoliday` without pulling holiday data
 * into core.
 *
 * Framework-agnostic on purpose: the `react` and `vue` bindings both need this exact
 * computation, and `core` is the one package both already depend on, so it lives here instead
 * of being written twice and risking drift between them.
 */
export function buildCalendarGrid(
  system: CalendarSystem,
  year: number,
  month: number,
  today: CalendarDate,
  selected: CalendarDate | null,
  rules?: SelectionRules,
  isHolidayDay?: (date: CalendarDate) => boolean,
): CalendarGridDay[][] {
  const engine = getCalendarEngine(system);
  const daysInThisMonth = engine.daysInMonth(year, month);
  const firstOfMonth = { year, month, day: 1 };
  const leadingDays = (dayOfWeek(firstOfMonth, system) - WEEK_START_DAY[system] + 7) % 7;
  const gridStart = addDays(firstOfMonth, -leadingDays, system);

  const totalWeeks = Math.ceil((leadingDays + daysInThisMonth) / 7);
  const weeks: CalendarGridDay[][] = [];
  for (let week = 0; week < totalWeeks; week++) {
    const days: CalendarGridDay[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const offset = week * 7 + weekday;
      const fields = offset === 0 ? gridStart : addDays(gridStart, offset, system);
      const date: CalendarDate = { precision: 'date', system, ...fields };
      days.push({
        date,
        isCurrentMonth: date.year === year && date.month === month,
        isToday: isSameDay(date, today),
        isSelected: selected !== null && isSameDay(date, selected),
        isSelectable: isDateSelectable(date, rules),
        isHoliday: isHolidayDay?.(date) ?? false,
      });
    }
    weeks.push(days);
  }
  return weeks;
}

export function nextMonth(
  system: CalendarSystem,
  year: number,
  month: number,
): { year: number; month: number } {
  const { monthsInYear } = getCalendarEngine(system);
  return month >= monthsInYear ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export function previousMonth(
  system: CalendarSystem,
  year: number,
  month: number,
): { year: number; month: number } {
  const { monthsInYear } = getCalendarEngine(system);
  return month <= 1 ? { year: year - 1, month: monthsInYear } : { year, month: month - 1 };
}
