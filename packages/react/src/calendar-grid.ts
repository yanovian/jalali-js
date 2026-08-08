import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { addDays, dayOfWeek, getCalendarEngine } from 'jalali-js';

export interface CalendarGridDay {
  date: CalendarDate;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

// The day a week starts on, as a dayOfWeek() index (0 = Sunday, 6 = Saturday). Jalali weeks
// culturally start on Saturday; Gregorian ones on Sunday. This is a grid-layout concern, not a
// locale (language) one, so it is keyed by calendar system rather than living in a locale pack.
const WEEK_START_DAY: Record<CalendarSystem, number> = {
  jalali: 6,
  gregorian: 0,
};

function isSameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.system === b.system && a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * The full weeks of grid cells needed to display `year`/`month`, padded with the trailing days
 * of the previous month and the leading days of the next month so every row is a complete
 * week. `today` and `selected` mark the matching cells via `isToday`/`isSelected`, for a
 * consumer to style.
 */
export function buildCalendarGrid(
  system: CalendarSystem,
  year: number,
  month: number,
  today: CalendarDate,
  selected: CalendarDate | null,
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
        isToday: isSameDate(date, today),
        isSelected: selected !== null && isSameDate(date, selected),
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
