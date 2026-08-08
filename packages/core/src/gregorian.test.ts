import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { gregorianEngine } from './gregorian.js';

describe('gregorianEngine.isLeapYear', () => {
  it('treats a year divisible by 4 but not 100 as leap', () => {
    expect(gregorianEngine.isLeapYear(1996)).toBe(true);
    expect(gregorianEngine.isLeapYear(2024)).toBe(true);
  });

  it('treats a year divisible by 100 but not 400 as not leap', () => {
    expect(gregorianEngine.isLeapYear(1900)).toBe(false);
    expect(gregorianEngine.isLeapYear(2100)).toBe(false);
  });

  it('treats a year divisible by 400 as leap', () => {
    expect(gregorianEngine.isLeapYear(2000)).toBe(true);
  });

  it('treats a year not divisible by 4 as not leap', () => {
    expect(gregorianEngine.isLeapYear(2023)).toBe(false);
  });
});

describe('gregorianEngine.daysInMonth', () => {
  it('gives February 29 days in a leap year, 28 otherwise', () => {
    expect(gregorianEngine.daysInMonth(2024, 2)).toBe(29);
    expect(gregorianEngine.daysInMonth(2023, 2)).toBe(28);
    expect(gregorianEngine.daysInMonth(1900, 2)).toBe(28);
    expect(gregorianEngine.daysInMonth(2000, 2)).toBe(29);
  });
});

describe('gregorianEngine Julian Day Number conversion', () => {
  it('round-trips a known reference date', () => {
    // 2000-01-01T12:00Z is JDN 2451545 by definition (the J2000.0 epoch).
    const jdn = gregorianEngine.toJulianDayNumber({ year: 2000, month: 1, day: 1 });
    expect(jdn).toBe(2451545);
    expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual({ year: 2000, month: 1, day: 1 });
  });

  it('round-trips across the century leap-year boundaries', () => {
    const dates = [
      { year: 1900, month: 2, day: 28 },
      { year: 1900, month: 3, day: 1 },
      { year: 2000, month: 2, day: 29 },
      { year: 2000, month: 3, day: 1 },
      { year: 2100, month: 2, day: 28 },
      { year: 2100, month: 3, day: 1 },
    ];
    for (const date of dates) {
      const jdn = gregorianEngine.toJulianDayNumber(date);
      expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual(date);
    }
  });

  it('places 2000-02-29 exactly one day before 2000-03-01', () => {
    const feb29 = gregorianEngine.toJulianDayNumber({ year: 2000, month: 2, day: 29 });
    const mar1 = gregorianEngine.toJulianDayNumber({ year: 2000, month: 3, day: 1 });
    expect(mar1 - feb29).toBe(1);
  });

  it('round-trips year 1 and year 0 (astronomical numbering)', () => {
    for (const date of [
      { year: 1, month: 1, day: 1 },
      { year: 0, month: 12, day: 31 },
    ]) {
      const jdn = gregorianEngine.toJulianDayNumber(date);
      expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual(date);
    }
  });

  it('round-trips any valid Gregorian date across a wide year range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -2000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = gregorianEngine.daysInMonth(year, month);
          const date = { year, month, day };
          const jdn = gregorianEngine.toJulianDayNumber(date);
          expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual(date);
        },
      ),
    );
  });

  it('gives consecutive Julian Day Numbers to consecutive calendar days', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1721060, max: 2816788 }), (jdn) => {
        const today = gregorianEngine.fromJulianDayNumber(jdn);
        const tomorrow = gregorianEngine.fromJulianDayNumber(jdn + 1);
        expect(gregorianEngine.toJulianDayNumber(tomorrow)).toBe(
          gregorianEngine.toJulianDayNumber(today) + 1,
        );
      }),
    );
  });
});
