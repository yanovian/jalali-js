import { describe, expect, it } from 'vitest';
import type { CalendarDateFields, CalendarEngine } from './calendar-engine.js';

/**
 * Deliberately irregular calendar: 10 months, odd lengths. Used only to prove
 * CalendarEngine has no hidden 12-month Jalali/Gregorian assumption.
 */
const irregularEngine: CalendarEngine = {
  system: 'irregular-test',
  monthsInYear: 10,
  isLeapYear(year) {
    return year % 5 === 0;
  },
  daysInMonth(year, month) {
    if (month < 1 || month > 10) throw new Error(`bad month ${month}`);
    if (month === 10) return this.isLeapYear(year) ? 4 : 3;
    return month % 2 === 0 ? 8 : 7;
  },
  toJulianDayNumber(date) {
    let days = date.year * 1000 + date.day - 1;
    for (let month = 1; month < date.month; month++) {
      days += this.daysInMonth(date.year, month);
    }
    return days;
  },
  fromJulianDayNumber(jdn) {
    const year = Math.floor(jdn / 1000);
    let remaining = jdn - year * 1000;
    let month = 1;
    while (month < 10 && remaining >= this.daysInMonth(year, month)) {
      remaining -= this.daysInMonth(year, month);
      month += 1;
    }
    return { year, month, day: remaining + 1 };
  },
};

describe('CalendarEngine interface (fake irregular calendar)', () => {
  it('round-trips dates through Julian Day Numbers', () => {
    const samples: CalendarDateFields[] = [
      { year: 0, month: 1, day: 1 },
      { year: 5, month: 10, day: 4 },
      { year: 12, month: 3, day: 7 },
      { year: 20, month: 10, day: 3 },
    ];
    for (const date of samples) {
      const jdn = irregularEngine.toJulianDayNumber(date);
      expect(irregularEngine.fromJulianDayNumber(jdn)).toEqual(date);
    }
  });

  it('reports a non-12 month year and irregular month lengths', () => {
    expect(irregularEngine.monthsInYear).toBe(10);
    expect(irregularEngine.daysInMonth(1, 1)).toBe(7);
    expect(irregularEngine.daysInMonth(1, 2)).toBe(8);
    expect(irregularEngine.daysInMonth(1, 10)).toBe(3);
    expect(irregularEngine.daysInMonth(5, 10)).toBe(4);
  });
});
