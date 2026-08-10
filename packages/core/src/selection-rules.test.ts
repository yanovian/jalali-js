import { describe, expect, it } from 'vitest';
import type { CalendarDate } from './calendar-date.js';
import { buildCalendarGrid } from './calendar-grid.js';
import { dayOfWeek } from './day-of-week.js';
import { isDateSelectable, isRangeSelectable } from './selection-rules.js';

// 1403-05-15 (Jalali) is 2024-08-05, a Monday (weekday index 1).
function jalali(year: number, month: number, day: number): CalendarDate {
  return { precision: 'date', system: 'jalali', year, month, day };
}
const date = jalali(1403, 5, 15);

describe('isDateSelectable', () => {
  it('allows everything without rules', () => {
    expect(isDateSelectable(date)).toBe(true);
    expect(isDateSelectable(date, {})).toBe(true);
  });

  it('applies minDate and maxDate, bounds included', () => {
    const rules = {
      minDate: { year: 1403, month: 5, day: 10 },
      maxDate: { year: 1403, month: 5, day: 20 },
    };
    expect(isDateSelectable(jalali(1403, 5, 9), rules)).toBe(false);
    expect(isDateSelectable(jalali(1403, 5, 10), rules)).toBe(true);
    expect(isDateSelectable(jalali(1403, 5, 20), rules)).toBe(true);
    expect(isDateSelectable(jalali(1403, 5, 21), rules)).toBe(false);
  });

  it('blocks listed disabledDates', () => {
    const rules = { disabledDates: [{ year: 1403, month: 5, day: 15 }] };
    expect(isDateSelectable(date, rules)).toBe(false);
    expect(isDateSelectable(jalali(1403, 5, 16), rules)).toBe(true);
  });

  it("blocks listed disabledWeekdays, in the date's own system", () => {
    expect(dayOfWeek(date, 'jalali')).toBe(1); // Monday
    expect(isDateSelectable(date, { disabledWeekdays: [1] })).toBe(false);
    expect(isDateSelectable(date, { disabledWeekdays: [4, 5] })).toBe(true);
  });

  it('enabledDates wins over every other rule', () => {
    const rules = {
      enabledDates: [{ year: 1403, month: 5, day: 15 }],
      disabledDates: [{ year: 1403, month: 5, day: 15 }],
      disabledWeekdays: [1],
      maxDate: { year: 1403, month: 5, day: 1 },
    };
    expect(isDateSelectable(date, rules)).toBe(true);
    expect(isDateSelectable(jalali(1403, 5, 16), rules)).toBe(false);
  });
});

describe('isRangeSelectable', () => {
  it('allows a range with no blocked day inside, bounds included', () => {
    const rules = { disabledDates: [{ year: 1403, month: 5, day: 20 }] };
    expect(isRangeSelectable(jalali(1403, 5, 10), jalali(1403, 5, 19), rules)).toBe(true);
    expect(isRangeSelectable(jalali(1403, 5, 10), jalali(1403, 5, 10), rules)).toBe(true);
  });

  it('rejects a range that crosses a blocked day, including at either bound', () => {
    const rules = { disabledDates: [{ year: 1403, month: 5, day: 20 }] };
    expect(isRangeSelectable(jalali(1403, 5, 10), jalali(1403, 5, 25), rules)).toBe(false);
    expect(isRangeSelectable(jalali(1403, 5, 20), jalali(1403, 5, 25), rules)).toBe(false);
    expect(isRangeSelectable(jalali(1403, 5, 10), jalali(1403, 5, 20), rules)).toBe(false);
  });

  it('crosses month boundaries', () => {
    const rules = { disabledDates: [{ year: 1403, month: 6, day: 1 }] };
    expect(isRangeSelectable(jalali(1403, 5, 25), jalali(1403, 6, 5), rules)).toBe(false);
    expect(isRangeSelectable(jalali(1403, 5, 25), jalali(1403, 5, 31), rules)).toBe(true);
  });
});

describe('buildCalendarGrid with rules', () => {
  const today = jalali(1403, 5, 15);

  it('marks every cell selectable without rules', () => {
    const cells = buildCalendarGrid('jalali', 1403, 5, today, null).flat();
    expect(cells.every((cell) => cell.isSelectable)).toBe(true);
  });

  it('marks blocked cells, including padding cells from neighbor months', () => {
    const rules = { minDate: { year: 1403, month: 5, day: 1 } };
    const cells = buildCalendarGrid('jalali', 1403, 5, today, null, rules).flat();
    for (const cell of cells) {
      expect(cell.isSelectable).toBe(cell.date.month === 5 || cell.date.month === 6);
    }
  });

  it('blocks weekdays across the whole grid', () => {
    const cells = buildCalendarGrid('jalali', 1403, 5, today, null, {
      disabledWeekdays: [5],
    }).flat();
    for (const cell of cells) {
      expect(cell.isSelectable).toBe(dayOfWeek(cell.date, 'jalali') !== 5);
    }
  });
});
