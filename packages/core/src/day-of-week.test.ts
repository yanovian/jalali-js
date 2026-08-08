import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dayOfWeek } from './day-of-week.js';
import { gregorianEngine } from './gregorian.js';
import { fromGregorian } from './convert.js';

// Date.UTC() has a legacy two-digit-year gotcha (a year 0-99 is read as 1900+year), so this
// helper avoids it via setUTCFullYear(), the same fix used elsewhere in this package's tests.
function safeUTCDay(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCDay();
}

describe('dayOfWeek', () => {
  it('matches Date.getUTCDay() for known reference dates', () => {
    expect(dayOfWeek({ year: 2024, month: 8, day: 5 }, 'gregorian')).toBe(1); // Monday
    expect(dayOfWeek({ year: 2000, month: 1, day: 1 }, 'gregorian')).toBe(6); // Saturday
  });

  it('agrees with Date.getUTCDay() across a wide range of Gregorian dates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -2000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = gregorianEngine.daysInMonth(year, month);
          const expected = safeUTCDay(year, month, day);
          expect(dayOfWeek({ year, month, day }, 'gregorian')).toBe(expected);
        },
      ),
    );
  });

  it('gives the same weekday for a Jalali date as its Gregorian equivalent', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const gregorianDate = { year, month, day: gregorianEngine.daysInMonth(year, month) };
          const jalaliDate = fromGregorian(gregorianDate, 'jalali');
          expect(dayOfWeek(jalaliDate, 'jalali')).toBe(dayOfWeek(gregorianDate, 'gregorian'));
        },
      ),
    );
  });
});
