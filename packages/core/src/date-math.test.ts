import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { addDays, compareDates } from './date-math.js';
import { getCalendarEngine } from './convert.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliEngine } from './jalali.js';

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
