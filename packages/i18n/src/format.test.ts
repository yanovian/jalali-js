import type { CalendarDate } from 'jalali-js';
import { describe, expect, it } from 'vitest';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';
import { format } from './format.js';
import { formatTimelineStamp } from './timeline-stamp.js';

// 2024-08-05 is 15 Mordad 1403 on the Jalali calendar, and a Monday (see day-of-week.test.ts
// and convert.test.ts in packages/core).
const jalaliDate: CalendarDate = {
  precision: 'date',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
};
const gregorianDate: CalendarDate = {
  precision: 'date',
  system: 'gregorian',
  year: 2024,
  month: 8,
  day: 5,
};

describe('format: English locale', () => {
  it('formats a Jalali date with its English (transliterated) month name', () => {
    expect(format(jalaliDate, en)).toBe('15 Mordad 1403');
  });

  it('formats a Gregorian date with its English month name', () => {
    expect(format(gregorianDate, en)).toBe('5 August 2024');
  });

  it('uses the short style for both the month and the year data untouched', () => {
    expect(format(jalaliDate, en, { style: 'short' })).toBe('15 Mor 1403');
    expect(format(gregorianDate, en, { style: 'short' })).toBe('5 Aug 2024');
  });

  it('prefixes the weekday name when asked, with a comma separator', () => {
    expect(format(jalaliDate, en, { weekday: true })).toBe('Monday, 15 Mordad 1403');
    expect(format(jalaliDate, en, { weekday: true, style: 'short' })).toBe('Mon, 15 Mor 1403');
  });

  it('defaults to Latin numerals', () => {
    expect(format(jalaliDate, en)).not.toMatch(/[۰-۹]/);
  });
});

describe('format: Farsi locale', () => {
  it('formats a Jalali date in Persian, with Persian digits by default', () => {
    expect(format(jalaliDate, fa)).toBe('۱۵ مرداد ۱۴۰۳');
  });

  it('formats a Gregorian date with its Persian transliterated month name', () => {
    expect(format(gregorianDate, fa)).toBe('۵ اوت ۲۰۲۴');
  });

  it('prefixes the weekday name when asked, with a Persian comma separator', () => {
    expect(format(jalaliDate, fa, { weekday: true })).toBe('دوشنبه، ۱۵ مرداد ۱۴۰۳');
  });

  it('uses the one-letter short weekday form in short style', () => {
    expect(format(jalaliDate, fa, { weekday: true, style: 'short' })).toBe('د، ۱۵ مرداد ۱۴۰۳');
  });

  it('can be overridden to Latin numerals explicitly', () => {
    expect(format(jalaliDate, fa, { numerals: 'latin' })).toBe('15 مرداد 1403');
  });
});

describe('format: Pashto locale', () => {
  it('formats a Jalali date with the Afghan zodiac month name and native digits by default', () => {
    // Jalali month 5 is زمری in Pashto (Afghanistan's zodiac month names, not Iran's مرداد).
    expect(format(jalaliDate, ps)).toBe('۱۵ زمری ۱۴۰۳');
  });

  it('formats a Gregorian date with its Pashto month name', () => {
    expect(format(gregorianDate, ps)).toBe('۵ اګست ۲۰۲۴');
  });

  it('prefixes the weekday name when asked, with the same "،" separator fa uses', () => {
    // 2024-08-05 / 15 Mordad 1403 is a Monday: دونۍ in Pashto.
    expect(format(jalaliDate, ps, { weekday: true })).toBe('دونۍ، ۱۵ زمری ۱۴۰۳');
  });

  it('reuses the long forms in short style (CLDR ps has no distinct abbreviated forms)', () => {
    expect(format(jalaliDate, ps, { style: 'short' })).toBe('۱۵ زمری ۱۴۰۳');
    expect(format(jalaliDate, ps, { weekday: true, style: 'short' })).toBe('دونۍ، ۱۵ زمری ۱۴۰۳');
  });

  it('can be overridden to Latin numerals explicitly', () => {
    expect(format(jalaliDate, ps, { numerals: 'latin' })).toBe('15 زمری 1403');
  });
});

describe('format: numerals option overrides the locale default in both directions', () => {
  it('forces native digits on the English locale', () => {
    // en.digits equals the Latin digits, so this is a no-op in output, but the option itself
    // must be honored rather than ignored.
    expect(format(jalaliDate, en, { numerals: 'native' })).toBe('15 Mordad 1403');
  });
});

describe('formatTimelineStamp', () => {
  it('formats a date and an optional time with native digits', () => {
    expect(
      formatTimelineStamp(
        { year: 1403, month: 10, day: 26 },
        'jalali',
        fa,
        { numerals: 'native' },
        { hour: 9, minute: 0 },
      ),
    ).toBe('۰۹:۰۰ - ۱۴۰۳/۱۰/۲۶');
    expect(
      formatTimelineStamp({ year: 1403, month: 12, day: 2 }, 'jalali', fa, {
        numerals: 'native',
      }),
    ).toBe('۱۴۰۳/۱۲/۰۲');
  });
});
