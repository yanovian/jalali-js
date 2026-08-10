import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from './parse.js';

// Pinned the same way packages/core/src/calendar.test.ts pins it: today() reads the process
// timezone through Date's local getters, so this makes the "today" tests deterministic
// regardless of which timezone the machine running them is in.
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
  // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar (see convert.test.ts in packages/core).
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('parse: English', () => {
  it('reads relative terms, case-insensitively', () => {
    expect(parse('today', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
    });
    expect(parse('Tomorrow', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 16,
    });
    expect(parse('YESTERDAY', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 14,
    });
    expect(parse('next week', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 22,
    });
  });

  it('reads "next <month>", rolling to next year when the month has already started this year', () => {
    // Today is Mordad (month 5). Farvardin (month 1) has already passed this year, so "next
    // Farvardin" means next year's Farvardin.
    expect(parse('next Farvardin', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1404,
      month: 1,
      day: 1,
    });
  });

  it('reads "next <month>", staying in this year when the month has not started yet', () => {
    // Shahrivar (month 6) has not happened yet this year (today is in month 5).
    expect(parse('next Shahrivar', 'en')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 6,
      day: 1,
    });
  });

  it('returns null for input it does not recognize', () => {
    expect(parse('banana', 'en')).toBeNull();
    expect(parse('', 'en')).toBeNull();
    expect(parse('   ', 'en')).toBeNull();
    expect(parse('next Bananuary', 'en')).toBeNull();
  });

  it('can target the gregorian system instead of the default jalali', () => {
    expect(parse('today', 'en', { system: 'gregorian' })).toEqual({
      precision: 'date',
      system: 'gregorian',
      year: 2024,
      month: 8,
      day: 5,
    });
  });
});

describe('parse: Farsi (Persian script)', () => {
  it('reads relative terms', () => {
    expect(parse('امروز', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 15,
    });
    expect(parse('فردا', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 16,
    });
    expect(parse('دیروز', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 14,
    });
  });

  it('reads both accepted "next week" phrasings', () => {
    expect(parse('هفته آینده', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 22,
    });
    expect(parse('هفته بعد', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 22,
    });
  });

  it('reads "<month> آینده" and "<month> بعد", in suffix order', () => {
    expect(parse('فروردین آینده', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1404,
      month: 1,
      day: 1,
    });
    expect(parse('شهریور بعد', 'fa')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 6,
      day: 1,
    });
  });

  it('returns null for unrecognized Farsi input', () => {
    expect(parse('موز', 'fa')).toBeNull();
  });
});

describe('parse: Pashto', () => {
  it('reads relative terms', () => {
    for (const word of ['نن', 'نن ورځ']) {
      expect(parse(word, 'ps')).toEqual({
        precision: 'date',
        system: 'jalali',
        year: 1403,
        month: 5,
        day: 15,
      });
    }
    expect(parse('سبا', 'ps')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 16,
    });
    expect(parse('پرون', 'ps')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 14,
    });
  });

  it('reads both accepted "next week" phrasings', () => {
    for (const phrase of ['راتلونکې اونۍ', 'بله اونۍ']) {
      expect(parse(phrase, 'ps')).toEqual({
        precision: 'date',
        system: 'jalali',
        year: 1403,
        month: 5,
        day: 22,
      });
    }
  });

  it('reads "راتلونکی <month>" with the Afghan month names, in prefix order', () => {
    // Today is month 5. وری (month 1) has already passed this year, so "next وری" means next
    // year's; وږی (month 6) has not started yet, so it stays in this year. Both gender forms
    // of the "next" adjective are accepted.
    expect(parse('راتلونکی وری', 'ps')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1404,
      month: 1,
      day: 1,
    });
    expect(parse('راتلونکې وږی', 'ps')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 6,
      day: 1,
    });
    expect(parse('بل کب', 'ps')).toEqual({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 12,
      day: 1,
    });
  });

  it('returns null for unrecognized Pashto input', () => {
    expect(parse('کيله', 'ps')).toBeNull();
  });
});
