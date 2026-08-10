import { describe, expect, it } from 'vitest';
import { createCalendar } from './calendar.js';
import { fromGregorian, toGregorian } from './convert.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliAstronomicalEngine, nowruzJulianDayNumber } from './jalali-astronomical.js';
import { jalaliEngine } from './jalali.js';

describe('jalali astronomical engine', () => {
  it('places known Nowruz dates on the Tehran-meridian civil day', () => {
    expect(gregorianEngine.fromJulianDayNumber(nowruzJulianDayNumber(1403))).toEqual({
      year: 2024,
      month: 3,
      day: 20,
    });
    expect(gregorianEngine.fromJulianDayNumber(nowruzJulianDayNumber(1402))).toEqual({
      year: 2023,
      month: 3,
      day: 21,
    });
    expect(gregorianEngine.fromJulianDayNumber(nowruzJulianDayNumber(1404))).toEqual({
      year: 2025,
      month: 3,
      day: 21,
    });
  });

  it('round-trips Jalali dates through Julian Day Numbers', () => {
    for (let year = 1300; year <= 1450; year += 7) {
      for (const month of [1, 6, 12]) {
        const day = jalaliAstronomicalEngine.daysInMonth(year, month);
        const date = { year, month, day };
        const jdn = jalaliAstronomicalEngine.toJulianDayNumber(date);
        expect(jalaliAstronomicalEngine.fromJulianDayNumber(jdn)).toEqual(date);
      }
    }
  });

  it('agrees with the arithmetic engine on Nowruz for most years in 1300-1500', () => {
    let matches = 0;
    for (let year = 1300; year <= 1500; year++) {
      const farvardin = { year, month: 1, day: 1 };
      if (
        jalaliAstronomicalEngine.toJulianDayNumber(farvardin) ===
        jalaliEngine.toJulianDayNumber(farvardin)
      ) {
        matches += 1;
      }
    }
    // Low-precision Meeus can disagree on rare noon-boundary years.
    expect(matches).toBeGreaterThan(190);
  });

  it('converts through toGregorian/fromGregorian with engine: astronomical', () => {
    expect(
      toGregorian({ year: 1403, month: 1, day: 1 }, 'jalali', { engine: 'astronomical' }),
    ).toEqual({ year: 2024, month: 3, day: 20 });
    expect(
      fromGregorian({ year: 2024, month: 3, day: 20 }, 'jalali', { engine: 'astronomical' }),
    ).toEqual({ year: 1403, month: 1, day: 1 });
  });

  it('createCalendar accepts engine: astronomical', () => {
    const cal = createCalendar({ system: 'jalali', engine: 'astronomical' });
    expect(cal.isLeapYear(1403)).toBe(jalaliAstronomicalEngine.isLeapYear(1403));
    expect(cal.daysInMonth(1403, 12)).toBe(jalaliAstronomicalEngine.daysInMonth(1403, 12));
  });
});
