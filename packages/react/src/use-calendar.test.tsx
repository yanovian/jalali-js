// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('useCalendar', () => {
  it('starts at today, in the requested system', () => {
    const { result } = renderHook(() => useCalendar({ system: 'jalali' }));
    expect(result.current.date).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
    });
  });

  it('setDate updates the returned date', () => {
    const { result } = renderHook(() => useCalendar({ system: 'jalali' }));
    act(() => {
      result.current.setDate({ precision: 'date', system: 'jalali', year: 1400, month: 1, day: 1 });
    });
    expect(result.current.date).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1400,
      month: 1,
      day: 1,
    });
  });

  it('format() reads the current date in the requested locale by default', () => {
    const { result } = renderHook(() => useCalendar({ system: 'jalali', locale: 'fa' }));
    expect(result.current.format()).toBe('۱۵ مرداد ۱۴۰۳');
  });

  it('format() accepts an explicit date and options, overriding the hook state', () => {
    const { result } = renderHook(() => useCalendar({ system: 'jalali', locale: 'en' }));
    const explicit = {
      precision: 'date' as const,
      system: 'jalali' as const,
      year: 1400,
      month: 1,
      day: 1,
    };
    expect(result.current.format(explicit, { style: 'short' })).toBe('1 Far 1400');
  });

  it('exposes isLeapYear and daysInMonth from the underlying calendar system', () => {
    const { result } = renderHook(() => useCalendar({ system: 'jalali' }));
    expect(result.current.isLeapYear(1403)).toBe(true);
    expect(result.current.daysInMonth(1403, 12)).toBe(30);
  });
});
