import fc from 'fast-check';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { getCalendarEngine } from 'jalali-js';
import { describe, expect, it } from 'vitest';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';
import { format } from './format.js';
import { parseTemplate } from './template.js';

// 2024-08-05 is 15 Mordad 1403 on the Jalali calendar, and a Monday (see format.test.ts).
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

describe('format: template option', () => {
  it('renders numeric tokens, padded and unpadded', () => {
    expect(format(jalaliDate, en, { template: 'YYYY/MM/DD' })).toBe('1403/05/15');
    expect(format(gregorianDate, en, { template: 'YYYY-M-D' })).toBe('2024-8-5');
  });

  it('renders month-name and weekday tokens', () => {
    expect(format(jalaliDate, en, { template: 'D MMMM YYYY' })).toBe('15 Mordad 1403');
    expect(format(jalaliDate, en, { template: 'ddd D MMM YYYY' })).toBe('Mon 15 Mor 1403');
    expect(format(jalaliDate, en, { template: 'dddd D MMMM YYYY' })).toBe('Monday 15 Mordad 1403');
  });

  it('uses the locale default numerals, and honors the numerals override', () => {
    expect(format(jalaliDate, fa, { template: 'YYYY/MM/DD' })).toBe('۱۴۰۳/۰۵/۱۵');
    expect(format(jalaliDate, fa, { template: 'YYYY/MM/DD', numerals: 'latin' })).toBe(
      '1403/05/15',
    );
  });

  it("picks month names from the date's own calendar system", () => {
    expect(format(gregorianDate, fa, { template: 'D MMMM YYYY' })).toBe('۵ اوت ۲۰۲۴');
    expect(format(jalaliDate, ps, { template: 'D MMMM YYYY' })).toBe('۱۵ زمری ۱۴۰۳');
  });

  it('ignores style and weekday when a template is set', () => {
    expect(format(jalaliDate, en, { template: 'YYYY/MM/DD', style: 'short', weekday: true })).toBe(
      '1403/05/15',
    );
  });

  it('passes text between tokens through as-is', () => {
    expect(format(jalaliDate, en, { template: '[YYYY] (MM)' })).toBe('[1403] (05)');
  });
});

describe('parseTemplate', () => {
  it('parses a numeric template, defaulting to the Jalali system', () => {
    expect(parseTemplate('1403/05/15', 'YYYY/MM/DD', en)).toEqual(jalaliDate);
  });

  it('parses into the Gregorian system when asked', () => {
    expect(parseTemplate('2024/08/05', 'YYYY/MM/DD', en, { system: 'gregorian' })).toEqual(
      gregorianDate,
    );
  });

  it('parses month names', () => {
    expect(parseTemplate('15 Mordad 1403', 'D MMMM YYYY', en)).toEqual(jalaliDate);
    expect(parseTemplate('۱۵ مرداد ۱۴۰۳', 'D MMMM YYYY', fa)).toEqual(jalaliDate);
  });

  it('accepts Latin and native digits alike', () => {
    expect(parseTemplate('۱۴۰۳/۰۵/۱۵', 'YYYY/MM/DD', fa)).toEqual(jalaliDate);
    expect(parseTemplate('1403/05/15', 'YYYY/MM/DD', fa)).toEqual(jalaliDate);
  });

  it('checks a weekday name against the parsed date', () => {
    const template = 'dddd D MMMM YYYY';
    expect(parseTemplate('Monday 15 Mordad 1403', template, en)).toEqual(jalaliDate);
    expect(parseTemplate('Tuesday 15 Mordad 1403', template, en)).toBeNull();
  });

  it('rejects input that does not match the template shape', () => {
    expect(parseTemplate('1403-05-15', 'YYYY/MM/DD', en)).toBeNull();
    expect(parseTemplate('1403/5/15', 'YYYY/MM/DD', en)).toBeNull();
    expect(parseTemplate('1403/05/15 extra', 'YYYY/MM/DD', en)).toBeNull();
    expect(parseTemplate('1403/05', 'YYYY/MM/DD', en)).toBeNull();
    expect(parseTemplate('15 Nomonth 1403', 'D MMMM YYYY', en)).toBeNull();
  });

  it('rejects dates that do not exist', () => {
    expect(parseTemplate('1403/13/01', 'YYYY/MM/DD', en)).toBeNull();
    expect(parseTemplate('1403/05/32', 'YYYY/MM/DD', en)).toBeNull();
    // 1403 is a Jalali leap year, 1402 is not: Esfand 30 exists only in 1403.
    expect(parseTemplate('1403/12/30', 'YYYY/MM/DD', en)).toEqual({
      ...jalaliDate,
      month: 12,
      day: 30,
    });
    expect(parseTemplate('1402/12/30', 'YYYY/MM/DD', en)).toBeNull();
  });

  it('rejects a repeated field with two different values', () => {
    const template = 'MM MMMM YYYY DD';
    expect(parseTemplate('05 Mordad 1403 15', template, en)).toEqual(jalaliDate);
    expect(parseTemplate('04 Mordad 1403 15', template, en)).toBeNull();
  });

  it('rejects a template that does not produce a full date', () => {
    expect(parseTemplate('05/15', 'MM/DD', en)).toBeNull();
  });
});

describe('parseTemplate: round trip with format', () => {
  const systemArb = fc.constantFrom<CalendarSystem>('jalali', 'gregorian');
  // Years stay in 1..3000 so `YYYY` always pads to exactly 4 digits.
  const dateArb = fc
    .record({
      system: systemArb,
      year: fc.integer({ min: 1, max: 3000 }),
      month: fc.integer({ min: 1, max: 12 }),
      dayFraction: fc.double({ min: 0, max: 1, noNaN: true }),
    })
    .map(({ system, year, month, dayFraction }): CalendarDate => {
      const days = getCalendarEngine(system).daysInMonth(year, month);
      const day = 1 + Math.min(days - 1, Math.floor(dayFraction * days));
      return { precision: 'date', system, year, month, day };
    });

  it('parses back what format produced, across locales, systems, digits, and templates', () => {
    fc.assert(
      fc.property(
        dateArb,
        fc.constantFrom(en, fa, ps),
        fc.constantFrom<'latin' | 'native'>('latin', 'native'),
        fc.constantFrom(
          'YYYY/MM/DD',
          'YYYYMMDD',
          'YYYY-M-D',
          'D MMMM YYYY',
          'DD MMM YYYY',
          'dddd D MMMM YYYY',
        ),
        (date, locale, numerals, template) => {
          const text = format(date, locale, { template, numerals });
          const parsed = parseTemplate(text, template, locale, { system: date.system });
          expect(parsed).toEqual(date);
        },
      ),
    );
  });
});
