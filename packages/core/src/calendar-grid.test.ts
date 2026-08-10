import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { CalendarDate } from './calendar-date.js';
import { buildCalendarGrid, nextMonth, previousMonth } from './calendar-grid.js';
import { addDays } from './date-math.js';
import { getCalendarEngine } from './convert.js';

const systems = ['jalali', 'gregorian'] as const;

function today(system: (typeof systems)[number]): CalendarDate {
  return { precision: 'date', system, year: 1403, month: 1, day: 1 };
}

describe('buildCalendarGrid', () => {
  it('every week has exactly 7 days', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...systems),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (system, year, month) => {
          const weeks = buildCalendarGrid(system, year, month, today(system), null);
          for (const week of weeks) expect(week).toHaveLength(7);
        },
      ),
    );
  });

  it('contains every day of the target month exactly once, marked isCurrentMonth', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...systems),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (system, year, month) => {
          const engine = getCalendarEngine(system);
          const weeks = buildCalendarGrid(system, year, month, today(system), null);
          const currentMonthDays = weeks
            .flat()
            .filter((cell) => cell.isCurrentMonth)
            .map((cell) => cell.date.day)
            .sort((a, b) => a - b);
          const expected = Array.from(
            { length: engine.daysInMonth(year, month) },
            (_, index) => index + 1,
          );
          expect(currentMonthDays).toEqual(expected);
        },
      ),
    );
  });

  it('lists consecutive calendar days across the whole grid, with no gaps or repeats', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...systems),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (system, year, month) => {
          const engine = getCalendarEngine(system);
          const cells = buildCalendarGrid(system, year, month, today(system), null).flat();
          for (let i = 1; i < cells.length; i++) {
            const previous = cells[i - 1]!.date;
            const expectedNext = addDays(previous, 1, system);
            const actualNext = cells[i]!.date;
            expect({ year: actualNext.year, month: actualNext.month, day: actualNext.day }).toEqual(
              expectedNext,
            );
          }
          // Sanity check the helper itself is exercising engine, not unused.
          expect(engine.monthsInYear).toBeGreaterThan(0);
        },
      ),
    );
  });

  it('marks the cell matching `today` as isToday, and no other cell', () => {
    const system = 'jalali';
    const theToday: CalendarDate = { precision: 'date', system, year: 1403, month: 5, day: 15 };
    const weeks = buildCalendarGrid(system, 1403, 5, theToday, null);
    const todayCells = weeks.flat().filter((cell) => cell.isToday);
    expect(todayCells).toHaveLength(1);
    expect(todayCells[0]!.date).toEqual(theToday);
  });

  it('marks the cell matching `selected` as isSelected, and no other cell', () => {
    const system = 'jalali';
    const selected: CalendarDate = { precision: 'date', system, year: 1403, month: 5, day: 20 };
    const weeks = buildCalendarGrid(system, 1403, 5, today(system), selected);
    const selectedCells = weeks.flat().filter((cell) => cell.isSelected);
    expect(selectedCells).toHaveLength(1);
    expect(selectedCells[0]!.date).toEqual(selected);
  });

  it('marks no cell as isSelected when selected is null', () => {
    const system = 'jalali';
    const weeks = buildCalendarGrid(system, 1403, 5, today(system), null);
    expect(weeks.flat().some((cell) => cell.isSelected)).toBe(false);
  });

  it('marks holiday cells from isHolidayDay, and leaves others false', () => {
    const system = 'jalali';
    const weeks = buildCalendarGrid(
      system,
      1403,
      1,
      today(system),
      null,
      undefined,
      (date) => date.day === 1 || date.day === 12,
    );
    const holidayDays = weeks
      .flat()
      .filter((cell) => cell.isHoliday && cell.isCurrentMonth)
      .map((cell) => cell.date.day)
      .sort((a, b) => a - b);
    expect(holidayDays).toEqual([1, 12]);
    expect(
      weeks
        .flat()
        .every((cell) => cell.isHoliday === (cell.date.day === 1 || cell.date.day === 12)),
    ).toBe(true);
  });
});

describe('nextMonth / previousMonth', () => {
  it('are inverses of each other', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...systems),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (system, year, month) => {
          const forward = nextMonth(system, year, month);
          expect(previousMonth(system, forward.year, forward.month)).toEqual({ year, month });
        },
      ),
    );
  });

  it('rolls over into the next year after the last month', () => {
    expect(nextMonth('jalali', 1403, 12)).toEqual({ year: 1404, month: 1 });
    expect(nextMonth('gregorian', 2024, 12)).toEqual({ year: 2025, month: 1 });
  });

  it('rolls back into the previous year before the first month', () => {
    expect(previousMonth('jalali', 1403, 1)).toEqual({ year: 1402, month: 12 });
    expect(previousMonth('gregorian', 2024, 1)).toEqual({ year: 2023, month: 12 });
  });
});
