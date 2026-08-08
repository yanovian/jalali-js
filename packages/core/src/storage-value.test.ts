import { describe, expect, it } from 'vitest';
import type { CalendarDate, CalendarDateTime, ZonedCalendarDateTime } from './calendar-date.js';
import { toStorageValue } from './storage-value.js';

// 2024-08-05 is 15 Mordad 1403 on the Jalali calendar (see convert.test.ts).
const jalaliDate: CalendarDate = {
  precision: 'date',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
};
const jalaliDateTime: CalendarDateTime = {
  precision: 'datetime',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 45,
  millisecond: 123,
};
const jalaliZoned: ZonedCalendarDateTime = {
  precision: 'zoned-datetime',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
  hour: 12,
  minute: 0,
  second: 0,
  millisecond: 0,
  timeZone: 'Asia/Tehran',
};

describe('toStorageValue default (gregorian-iso) stays Gregorian and calendar-agnostic', () => {
  it('gives a plain Gregorian ISO date string for the date precision, even for a Jalali date', () => {
    expect(toStorageValue(jalaliDate)).toBe('2024-08-05');
  });

  it('gives a Gregorian ISO datetime string, no offset, for the datetime precision', () => {
    expect(toStorageValue(jalaliDateTime)).toBe('2024-08-05T14:30:45.123');
  });

  it('gives a Gregorian ISO datetime string with a numeric offset for the zoned-datetime precision', () => {
    // The wall-clock time (12:00) paired with its own offset (+03:30), per ISO 8601 - not the
    // UTC-shifted clock time. Together they still represent the same instant, 08:30 UTC.
    expect(toStorageValue(jalaliZoned)).toBe('2024-08-05T12:00:00.000+03:30');
  });

  it('never contains the Jalali year, month, or day in its output', () => {
    for (const date of [jalaliDate, jalaliDateTime, jalaliZoned]) {
      const value = toStorageValue(date) as string;
      expect(value.startsWith('1403')).toBe(false);
      expect(value).toMatch(/^2024-08-0[56]/);
    }
  });
});

describe("toStorageValue with format: 'date'", () => {
  it('gives a JS Date at Gregorian midnight UTC for the date precision', () => {
    const value = toStorageValue(jalaliDate, 'date') as Date;
    expect(value).toBeInstanceOf(Date);
    expect(value.toISOString()).toBe('2024-08-05T00:00:00.000Z');
  });

  it('treats a datetime precision (no timezone) as UTC', () => {
    const value = toStorageValue(jalaliDateTime, 'date') as Date;
    expect(value.toISOString()).toBe('2024-08-05T14:30:45.123Z');
  });

  it('resolves a zoned-datetime precision to its real UTC instant', () => {
    const value = toStorageValue(jalaliZoned, 'date') as Date;
    expect(value.toISOString()).toBe('2024-08-05T08:30:00.000Z');
  });
});

describe("toStorageValue with format: 'epoch'", () => {
  it('matches the epoch milliseconds of the equivalent Date value', () => {
    for (const date of [jalaliDate, jalaliDateTime, jalaliZoned]) {
      const epoch = toStorageValue(date, 'epoch');
      const asDate = toStorageValue(date, 'date') as Date;
      expect(epoch).toBe(asDate.getTime());
    }
  });
});

describe("toStorageValue with format: 'jalali-iso' and 'jalali-object'", () => {
  it("gives the calendar's own native fields as an ISO-shaped string, unconverted", () => {
    expect(toStorageValue(jalaliDate, 'jalali-iso')).toBe('1403-05-15');
    expect(toStorageValue(jalaliDateTime, 'jalali-iso')).toBe('1403-05-15T14:30:45.123');
    expect(toStorageValue(jalaliZoned, 'jalali-iso')).toBe('1403-05-15T12:00:00.000');
  });

  it("gives the calendar's own native fields as a plain object, unconverted", () => {
    expect(toStorageValue(jalaliDate, 'jalali-object')).toEqual({ year: 1403, month: 5, day: 15 });
    expect(toStorageValue(jalaliDateTime, 'jalali-object')).toEqual({
      year: 1403,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      second: 45,
      millisecond: 123,
    });
    expect(toStorageValue(jalaliZoned, 'jalali-object')).toEqual({
      year: 1403,
      month: 5,
      day: 15,
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0,
      timeZone: 'Asia/Tehran',
    });
  });
});
