import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useCalendar } from './use-calendar.js';

let originalTz: string | undefined;
beforeAll(() => {
  originalTz = process.env.TZ;
  process.env.TZ = 'UTC';
});
afterAll(() => {
  process.env.TZ = originalTz;
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

// useCalendar reads no injected context, so it works fine called outside a component; an
// effectScope keeps its computed() refs' reactivity properly scoped and disposable, the same
// role a component's setup() would normally play.
function withScope<T>(fn: () => T): T {
  const scope = effectScope();
  return scope.run(fn) as T;
}

describe('useCalendar', () => {
  it('starts at today, in the requested system', () => {
    const { date } = withScope(() => useCalendar({ system: 'jalali' }));
    expect(date.value).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
    });
  });

  it('date is a writable ref', () => {
    const { date } = withScope(() => useCalendar({ system: 'jalali' }));
    date.value = { precision: 'date', system: 'jalali', year: 1400, month: 1, day: 1 };
    expect(date.value).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1400,
      month: 1,
      day: 1,
    });
  });

  it('format() reads the current date in the requested locale by default', () => {
    const { format } = withScope(() => useCalendar({ system: 'jalali', locale: 'fa' }));
    expect(format()).toBe('۱۵ مرداد ۱۴۰۳');
  });

  it('format() accepts an explicit date and options, overriding the composable state', () => {
    const { format } = withScope(() => useCalendar({ system: 'jalali', locale: 'en' }));
    const explicit = {
      precision: 'date' as const,
      system: 'jalali' as const,
      year: 1400,
      month: 1,
      day: 1,
    };
    expect(format(explicit, { style: 'short' })).toBe('1 Far 1400');
  });

  it('exposes isLeapYear and daysInMonth from the underlying calendar system', () => {
    const { isLeapYear, daysInMonth } = withScope(() => useCalendar({ system: 'jalali' }));
    expect(isLeapYear(1403)).toBe(true);
    expect(daysInMonth(1403, 12)).toBe(30);
  });
});
