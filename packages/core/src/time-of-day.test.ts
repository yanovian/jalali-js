import { describe, expect, it } from 'vitest';
import type { CalendarDate, CalendarDateTime } from './calendar-date.js';
import { listHours, listMinutes, snapMinute, timeOfDay, withTime } from './time-of-day.js';

const date: CalendarDate = {
  precision: 'date',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
};

describe('listHours', () => {
  it('lists every hour by default', () => {
    expect(listHours()).toEqual(Array.from({ length: 24 }, (_, hour) => hour));
  });

  it('drops disabled hours', () => {
    expect(listHours([0, 1, 23])).toEqual(
      Array.from({ length: 24 }, (_, hour) => hour).filter((hour) => hour > 1 && hour < 23),
    );
  });
});

describe('listMinutes', () => {
  it('lists every minute by default', () => {
    expect(listMinutes()).toHaveLength(60);
    expect(listMinutes()[0]).toBe(0);
    expect(listMinutes()[59]).toBe(59);
  });

  it('steps by the given interval', () => {
    expect(listMinutes(15)).toEqual([0, 15, 30, 45]);
    expect(listMinutes(30)).toEqual([0, 30]);
  });

  it('falls back to the nearest divisor of 60 for an irregular step', () => {
    expect(listMinutes(7)).toEqual(listMinutes(6));
    expect(listMinutes(0)).toEqual(listMinutes(1));
  });
});

describe('snapMinute', () => {
  it('snaps down to the nearest step', () => {
    expect(snapMinute(17, 15)).toBe(15);
    expect(snapMinute(0, 15)).toBe(0);
    expect(snapMinute(59, 15)).toBe(45);
  });
});

describe('withTime / timeOfDay', () => {
  it('attaches a time of day onto a date', () => {
    expect(withTime(date, { hour: 14, minute: 30 })).toEqual({
      precision: 'datetime',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      millisecond: 0,
    });
  });

  it('reads the time of day, or midnight for a date-only value', () => {
    expect(timeOfDay(date)).toEqual({ hour: 0, minute: 0 });
    const datetime: CalendarDateTime = {
      ...date,
      precision: 'datetime',
      hour: 9,
      minute: 5,
      second: 0,
      millisecond: 0,
    };
    expect(timeOfDay(datetime)).toEqual({ hour: 9, minute: 5 });
  });
});
