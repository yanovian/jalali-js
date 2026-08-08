import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { fromGregorian, toGregorian } from './convert.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliEngine } from './jalali.js';

describe('toGregorian / fromGregorian', () => {
  it('matches the worked example from architecture.md', () => {
    // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar.
    expect(fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali')).toEqual({
      year: 1403,
      month: 5,
      day: 15,
    });
    expect(toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali')).toEqual({
      year: 2024,
      month: 8,
      day: 5,
    });
  });

  it('round-trips Gregorian -> Jalali -> Gregorian across a wide range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = gregorianEngine.daysInMonth(year, month);
          const gregorianDate = { year, month, day };
          const jalaliDate = fromGregorian(gregorianDate, 'jalali');
          expect(toGregorian(jalaliDate, 'jalali')).toEqual(gregorianDate);
        },
      ),
    );
  });

  it('round-trips Jalali -> Gregorian -> Jalali across a wide range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = jalaliEngine.daysInMonth(year, month);
          const jalaliDate = { year, month, day };
          const gregorianDate = toGregorian(jalaliDate, 'jalali');
          expect(fromGregorian(gregorianDate, 'jalali')).toEqual(jalaliDate);
        },
      ),
    );
  });

  it('treats the gregorian system as an identity conversion', () => {
    const date = { year: 2024, month: 8, day: 5 };
    expect(toGregorian(date, 'gregorian')).toEqual(date);
    expect(fromGregorian(date, 'gregorian')).toEqual(date);
  });
});
