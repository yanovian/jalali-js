import type { CalendarDate, CalendarDateFields } from 'jalali-js';
import { addDays, addMonths, addYears } from 'jalali-js';
import { describe, expect, it } from 'vitest';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';
import { formatRelative } from './relative.js';

const base: CalendarDate = {
  precision: 'date',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
};

function jalali(fields: CalendarDateFields): CalendarDate {
  return { precision: 'date', system: 'jalali', ...fields };
}

describe('formatRelative', () => {
  it('returns today when both dates are the same day', () => {
    expect(formatRelative(base, base, en)).toBe('today');
    expect(formatRelative(base, base, fa)).toBe('امروز');
    expect(formatRelative(base, base, ps)).toBe('نن');
  });

  it('formats past and future days in en, fa, and ps', () => {
    const past = jalali(addDays(base, -3, 'jalali'));
    const future = jalali(addDays(base, 2, 'jalali'));

    expect(formatRelative(past, base, en)).toBe('3 days ago');
    expect(formatRelative(future, base, en)).toBe('in 2 days');
    expect(formatRelative(past, base, fa)).toBe('۳ روز پیش');
    expect(formatRelative(future, base, fa)).toBe('۲ روز دیگر');
    expect(formatRelative(past, base, ps)).toBe('۳ ورځې مخکې');
    expect(formatRelative(future, base, ps)).toBe('په ۲ ورځو کې');
  });

  it('uses singular forms for a count of one', () => {
    const past = jalali(addDays(base, -1, 'jalali'));
    const future = jalali(addDays(base, 1, 'jalali'));

    expect(formatRelative(past, base, en)).toBe('1 day ago');
    expect(formatRelative(future, base, en)).toBe('in 1 day');
    expect(formatRelative(past, base, fa)).toBe('۱ روز پیش');
    expect(formatRelative(past, base, ps)).toBe('۱ ورځ مخکې');
  });

  it('picks week, month, and year units', () => {
    expect(formatRelative(jalali(addDays(base, -14, 'jalali')), base, en)).toBe('2 weeks ago');
    expect(formatRelative(jalali(addMonths(base, -3, 'jalali')), base, en)).toBe('3 months ago');
    expect(formatRelative(jalali(addYears(base, 1, 'jalali')), base, en)).toBe('in 1 year');
    expect(formatRelative(jalali(addMonths(base, 2, 'jalali')), base, fa)).toBe('۲ ماه بعد');
    expect(formatRelative(jalali(addYears(base, -2, 'jalali')), base, ps)).toBe('۲ کاله مخکې');
  });

  it('honors the numerals option', () => {
    const past = jalali(addDays(base, -3, 'jalali'));
    expect(formatRelative(past, base, fa, { numerals: 'latin' })).toBe('3 روز پیش');
    expect(formatRelative(past, base, en, { numerals: 'native' })).toBe('3 days ago');
  });

  it('rejects mixed calendar systems', () => {
    const gregorian: CalendarDate = {
      precision: 'date',
      system: 'gregorian',
      year: 2024,
      month: 8,
      day: 5,
    };
    expect(() => formatRelative(base, gregorian, en)).toThrow(/same calendar system/);
  });
});
