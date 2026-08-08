import { afterAll, beforeAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCalendar } from './calendar.js';

// Date's local getters (used by the 'date' and 'datetime' precision tiers' today()) read the
// process timezone. Pinning it to UTC here makes those tests deterministic regardless of which
// timezone the machine running them is in.
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
});
afterEach(() => {
  vi.useRealTimers();
});

describe("createCalendar precision: 'date' (the default)", () => {
  it("today() gives the current date, converted to the calendar's system", () => {
    vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
    const gregorian = createCalendar({ system: 'gregorian' }).today();
    expect(gregorian).toEqual({
      precision: 'date',
      system: 'gregorian',
      year: 2024,
      month: 8,
      day: 5,
    });

    const jalali = createCalendar({ system: 'jalali' }).today();
    expect(jalali).toEqual({ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 });
  });

  it('defaults to the date precision when none is given', () => {
    const calendar = createCalendar({ system: 'jalali' });
    expect(calendar.precision).toBe('date');
  });
});

describe("createCalendar precision: 'datetime'", () => {
  it('today() gives the current date and wall-clock time, with no timezone', () => {
    vi.setSystemTime(new Date('2024-08-05T14:30:45.123Z'));
    const calendar = createCalendar({ system: 'jalali', precision: 'datetime' });
    expect(calendar.today()).toEqual({
      precision: 'datetime',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      second: 45,
      millisecond: 123,
    });
  });
});

describe("createCalendar precision: 'zoned-datetime'", () => {
  it('today() gives the current date and time as observed in the given timezone', () => {
    // 2024-08-05T22:15:00Z is 2024-08-06T01:45:00 in Asia/Tehran (UTC+03:30): past midnight,
    // a different calendar day, which is exactly the case worth covering here.
    vi.setSystemTime(new Date('2024-08-05T22:15:00.000Z'));
    const calendar = createCalendar({
      system: 'jalali',
      precision: 'zoned-datetime',
      timeZone: 'Asia/Tehran',
    });
    expect(calendar.timeZone).toBe('Asia/Tehran');
    expect(calendar.today()).toEqual({
      precision: 'zoned-datetime',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 16,
      hour: 1,
      minute: 45,
      second: 0,
      millisecond: 0,
      timeZone: 'Asia/Tehran',
    });
  });

  it("resolves timeZone: 'auto' through resolveTimeZone (UTC outside a browser environment)", () => {
    const calendar = createCalendar({
      system: 'jalali',
      precision: 'zoned-datetime',
      timeZone: 'auto',
    });
    expect(calendar.timeZone).toBe('UTC');
  });

  it("resolves a missing timeZone the same as 'auto'", () => {
    const calendar = createCalendar({ system: 'jalali', precision: 'zoned-datetime' });
    expect(calendar.timeZone).toBe('UTC');
  });
});

describe('createCalendar isLeapYear and daysInMonth', () => {
  it("delegate to the calendar system's own engine", () => {
    const jalali = createCalendar({ system: 'jalali' });
    expect(jalali.isLeapYear(1403)).toBe(true);
    expect(jalali.isLeapYear(1404)).toBe(false);
    expect(jalali.daysInMonth(1403, 12)).toBe(30);

    const gregorian = createCalendar({ system: 'gregorian' });
    expect(gregorian.isLeapYear(2024)).toBe(true);
    expect(gregorian.daysInMonth(2024, 2)).toBe(29);
  });
});
