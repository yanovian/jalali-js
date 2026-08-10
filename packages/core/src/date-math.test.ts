import fc from 'fast-check';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  compareDates,
  diffDates,
  endOf,
  isAfter,
  isBefore,
  isBetween,
  isSameDay,
  isToday,
  startOf,
  WEEK_START_DAY,
} from './date-math.js';
import { getCalendarEngine } from './convert.js';
import { dayOfWeek } from './day-of-week.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliEngine } from './jalali.js';

// Arbitraries shared by the property tests below: a valid date in a wide year range, in either
// calendar system. The day is drawn from the real month length, so every generated date exists.
const systemArb = fc.constantFrom('jalali', 'gregorian' as const);
const dateArb = fc
  .record({
    system: systemArb,
    year: fc.integer({ min: -1000, max: 3000 }),
    month: fc.integer({ min: 1, max: 12 }),
    dayFraction: fc.double({ min: 0, max: 1, noNaN: true }),
  })
  .map(({ system, year, month, dayFraction }) => {
    const daysInMonth = getCalendarEngine(system).daysInMonth(year, month);
    return { system, date: { year, month, day: 1 + Math.floor(dayFraction * (daysInMonth - 1)) } };
  });

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays({ year: 1403, month: 5, day: 30 }, 1, 'jalali')).toEqual({
      year: 1403,
      month: 5,
      day: 31,
    });
    expect(addDays({ year: 1403, month: 5, day: 31 }, 1, 'jalali')).toEqual({
      year: 1403,
      month: 6,
      day: 1,
    });
  });

  it('crosses a year boundary (30 Esfand of a leap year to 1 Farvardin)', () => {
    expect(addDays({ year: 1403, month: 12, day: 30 }, 1, 'jalali')).toEqual({
      year: 1404,
      month: 1,
      day: 1,
    });
  });

  it('subtracts days for a negative amount', () => {
    expect(addDays({ year: 1404, month: 1, day: 1 }, -1, 'jalali')).toEqual({
      year: 1403,
      month: 12,
      day: 30,
    });
  });

  it('adding 0 days is the identity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = jalaliEngine.daysInMonth(year, month);
          const date = { year, month, day };
          expect(addDays(date, 0, 'jalali')).toEqual(date);
        },
      ),
    );
  });

  it('adding N then subtracting N is the identity, for both calendar systems', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: -400, max: 400 }),
        fc.constantFrom('jalali', 'gregorian'),
        (year, month, days, system) => {
          const engine = system === 'jalali' ? jalaliEngine : gregorianEngine;
          const date = { year, month, day: engine.daysInMonth(year, month) };
          expect(addDays(addDays(date, days, system), -days, system)).toEqual(date);
        },
      ),
    );
  });
});

describe('compareDates', () => {
  it('gives 0 for the same date', () => {
    expect(compareDates({ year: 1403, month: 5, day: 15 }, { year: 1403, month: 5, day: 15 })).toBe(
      0,
    );
  });

  it('orders by year, then month, then day', () => {
    expect(
      compareDates({ year: 1403, month: 5, day: 15 }, { year: 1404, month: 1, day: 1 }),
    ).toBeLessThan(0);
    expect(
      compareDates({ year: 1403, month: 5, day: 15 }, { year: 1403, month: 6, day: 1 }),
    ).toBeLessThan(0);
    expect(
      compareDates({ year: 1403, month: 5, day: 15 }, { year: 1403, month: 5, day: 16 }),
    ).toBeLessThan(0);
    expect(
      compareDates({ year: 1404, month: 1, day: 1 }, { year: 1403, month: 5, day: 15 }),
    ).toBeGreaterThan(0);
  });

  it('agrees with Julian Day Number ordering, for both calendar systems', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('jalali', 'gregorian'),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (system, yearA, monthA, yearB, monthB) => {
          const engine = getCalendarEngine(system);
          const a = { year: yearA, month: monthA, day: engine.daysInMonth(yearA, monthA) };
          const b = { year: yearB, month: monthB, day: engine.daysInMonth(yearB, monthB) };
          const jdnDiff = engine.toJulianDayNumber(a) - engine.toJulianDayNumber(b);
          expect(Math.sign(compareDates(a, b))).toBe(Math.sign(jdnDiff));
        },
      ),
    );
  });
});

describe('addMonths', () => {
  it('clamps the day to the target month length', () => {
    // Farvardin has 31 days; Mehr has 30.
    expect(addMonths({ year: 1403, month: 1, day: 31 }, 6, 'jalali')).toEqual({
      year: 1403,
      month: 7,
      day: 30,
    });
    // Gregorian: Jan 31 + 1 month clamps to February's length, leap-year aware.
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1, 'gregorian')).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(addMonths({ year: 2023, month: 1, day: 31 }, 1, 'gregorian')).toEqual({
      year: 2023,
      month: 2,
      day: 28,
    });
  });

  it('crosses year boundaries in both directions', () => {
    expect(addMonths({ year: 1403, month: 11, day: 10 }, 3, 'jalali')).toEqual({
      year: 1404,
      month: 2,
      day: 10,
    });
    expect(addMonths({ year: 1403, month: 2, day: 10 }, -3, 'jalali')).toEqual({
      year: 1402,
      month: 11,
      day: 10,
    });
  });

  it('adding 0 months is the identity, and the result day never exceeds its month', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -500, max: 500 }), ({ system, date }, months) => {
        expect(addMonths(date, 0, system)).toEqual(date);
        const moved = addMonths(date, months, system);
        expect(moved.month).toBeGreaterThanOrEqual(1);
        expect(moved.month).toBeLessThanOrEqual(12);
        expect(moved.day).toBeGreaterThanOrEqual(1);
        expect(moved.day).toBeLessThanOrEqual(
          getCalendarEngine(system).daysInMonth(moved.year, moved.month),
        );
      }),
    );
  });

  it('lands months boundaries exactly: the moved month index equals the start index plus n', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -500, max: 500 }), ({ system, date }, months) => {
        const moved = addMonths(date, months, system);
        const index = (d: { year: number; month: number }) => d.year * 12 + (d.month - 1);
        expect(index(moved)).toBe(index(date) + months);
      }),
    );
  });
});

describe('addYears', () => {
  it('clamps leap Esfand: Esfand 30 of a leap year plus one year gives Esfand 29', () => {
    // 1403 is a Jalali leap year (Esfand has 30 days); 1404 is not.
    expect(addYears({ year: 1403, month: 12, day: 30 }, 1, 'jalali')).toEqual({
      year: 1404,
      month: 12,
      day: 29,
    });
    expect(addYears({ year: 2024, month: 2, day: 29 }, 1, 'gregorian')).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
  });

  it('equals adding 12 times as many months', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -100, max: 100 }), ({ system, date }, years) => {
        expect(addYears(date, years, system)).toEqual(addMonths(date, years * 12, system));
      }),
    );
  });
});

describe('diffDates', () => {
  it('inverts addDays for the day unit', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -5000, max: 5000 }), ({ system, date }, days) => {
        expect(diffDates(addDays(date, days, system), date, 'day', system)).toBe(days);
      }),
    );
  });

  it('truncates weeks toward zero, in both directions', () => {
    const base = { year: 1403, month: 5, day: 15 };
    expect(diffDates(addDays(base, 13, 'jalali'), base, 'week', 'jalali')).toBe(1);
    expect(diffDates(addDays(base, -13, 'jalali'), base, 'week', 'jalali')).toBe(-1);
    expect(diffDates(addDays(base, 6, 'jalali'), base, 'week', 'jalali')).toBe(0);
  });

  it('counts a month only once it has fully passed', () => {
    const base = { year: 1403, month: 5, day: 6 };
    expect(diffDates({ year: 1403, month: 6, day: 5 }, base, 'month', 'jalali')).toBe(0);
    expect(diffDates({ year: 1403, month: 6, day: 6 }, base, 'month', 'jalali')).toBe(1);
  });

  it('honors clamping at month ends: one clamped month counts as a full month', () => {
    // Bahman 30 plus one month clamps to Esfand 29 (1402 is not a leap year); that clamped
    // landing day still counts as one full month.
    expect(
      diffDates(
        { year: 1402, month: 12, day: 29 },
        { year: 1402, month: 11, day: 30 },
        'month',
        'jalali',
      ),
    ).toBe(1);
  });

  it('inverts addMonths and addYears, clamping included', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -500, max: 500 }), ({ system, date }, months) => {
        expect(diffDates(addMonths(date, months, system), date, 'month', system)).toBe(months);
      }),
    );
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -100, max: 100 }), ({ system, date }, years) => {
        expect(diffDates(addYears(date, years, system), date, 'year', system)).toBe(years);
      }),
    );
  });

  it('is antisymmetric: diffDates(a, b) equals -diffDates(b, a)', () => {
    fc.assert(
      fc.property(
        dateArb,
        fc.integer({ min: -2000, max: 2000 }),
        fc.constantFrom('day', 'week', 'month', 'year' as const),
        ({ system, date }, days, unit) => {
          const other = addDays(date, days, system);
          // `0 -` rather than unary minus: negating a zero diff here would make the expected
          // value -0, and toBe uses Object.is, which tells -0 and 0 apart.
          expect(diffDates(date, other, unit, system)).toBe(
            0 - diffDates(other, date, unit, system),
          );
        },
      ),
    );
  });
});

describe('startOf and endOf', () => {
  it('finds the week around a known date, honoring each system default week start', () => {
    // 1403-05-15 is 2024-08-05, a Monday. The Jalali week starts on Saturday, so it began on
    // 1403-05-13 and ends on 1403-05-19 (Friday).
    const date = { year: 1403, month: 5, day: 15 };
    expect(startOf(date, 'week', 'jalali')).toEqual({ year: 1403, month: 5, day: 13 });
    expect(endOf(date, 'week', 'jalali')).toEqual({ year: 1403, month: 5, day: 19 });
    // The same day in Gregorian, with the Gregorian default (Sunday): Aug 4 through Aug 10.
    const gregorian = { year: 2024, month: 8, day: 5 };
    expect(startOf(gregorian, 'week', 'gregorian')).toEqual({ year: 2024, month: 8, day: 4 });
    expect(endOf(gregorian, 'week', 'gregorian')).toEqual({ year: 2024, month: 8, day: 10 });
  });

  it('takes an explicit week start day (Monday-based Gregorian week)', () => {
    const date = { year: 2024, month: 8, day: 5 }; // a Monday
    expect(startOf(date, 'week', 'gregorian', 1)).toEqual(date);
    expect(endOf(date, 'week', 'gregorian', 1)).toEqual({ year: 2024, month: 8, day: 11 });
  });

  it('finds month and year bounds, leap-year aware', () => {
    const date = { year: 1403, month: 12, day: 10 };
    expect(startOf(date, 'month', 'jalali')).toEqual({ year: 1403, month: 12, day: 1 });
    expect(endOf(date, 'month', 'jalali')).toEqual({ year: 1403, month: 12, day: 30 }); // leap
    expect(endOf({ year: 1402, month: 12, day: 10 }, 'month', 'jalali')).toEqual({
      year: 1402,
      month: 12,
      day: 29, // not leap
    });
    expect(startOf(date, 'year', 'jalali')).toEqual({ year: 1403, month: 1, day: 1 });
    expect(endOf(date, 'year', 'jalali')).toEqual({ year: 1403, month: 12, day: 30 });
  });

  it('startOf week lands on the week start, at most 6 days back; endOf is 6 days later', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: 0, max: 6 }), ({ system, date }, weekStartDay) => {
        const engine = getCalendarEngine(system);
        const start = startOf(date, 'week', system, weekStartDay);
        expect(dayOfWeek(start, system)).toBe(weekStartDay);
        const distance = engine.toJulianDayNumber(date) - engine.toJulianDayNumber(start);
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThanOrEqual(6);
        const end = endOf(date, 'week', system, weekStartDay);
        expect(engine.toJulianDayNumber(end) - engine.toJulianDayNumber(start)).toBe(6);
      }),
    );
  });

  it('uses WEEK_START_DAY as the default week start', () => {
    fc.assert(
      fc.property(dateArb, ({ system, date }) => {
        expect(startOf(date, 'week', system)).toEqual(
          startOf(date, 'week', system, WEEK_START_DAY[system]),
        );
      }),
    );
  });
});

describe('query helpers', () => {
  it('agree with compareDates', () => {
    fc.assert(
      fc.property(dateArb, fc.integer({ min: -2000, max: 2000 }), ({ system, date }, days) => {
        const other = addDays(date, days, system);
        expect(isBefore(date, other)).toBe(days > 0);
        expect(isAfter(date, other)).toBe(days < 0);
        expect(isSameDay(date, other)).toBe(days === 0);
      }),
    );
  });

  it('isBetween includes both bounds', () => {
    const start = { year: 1403, month: 5, day: 10 };
    const end = { year: 1403, month: 5, day: 20 };
    expect(isBetween(start, start, end)).toBe(true);
    expect(isBetween(end, start, end)).toBe(true);
    expect(isBetween({ year: 1403, month: 5, day: 15 }, start, end)).toBe(true);
    expect(isBetween({ year: 1403, month: 5, day: 9 }, start, end)).toBe(false);
    expect(isBetween({ year: 1403, month: 5, day: 21 }, start, end)).toBe(false);
  });
});

describe('isToday', () => {
  // Pinned the same way calendar.test.ts pins it: today() reads the process timezone through
  // Date's local getters, so this stays deterministic on any machine.
  let originalTz: string | undefined;
  beforeAll(() => {
    originalTz = process.env.TZ;
    process.env.TZ = 'UTC';
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });
  beforeEach(() => {
    vi.useFakeTimers();
    // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar (see convert.test.ts).
    vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches the current day in each system, and nothing else', () => {
    expect(isToday({ year: 1403, month: 5, day: 15 }, 'jalali')).toBe(true);
    expect(isToday({ year: 1403, month: 5, day: 16 }, 'jalali')).toBe(false);
    expect(isToday({ year: 2024, month: 8, day: 5 }, 'gregorian')).toBe(true);
    expect(isToday({ year: 2024, month: 8, day: 4 }, 'gregorian')).toBe(false);
  });
});
