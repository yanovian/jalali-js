import { describe, expect, it } from 'vitest';
import {
  HOLIDAY_YEAR_RANGE,
  holidayDatesAround,
  holidayName,
  holidayPackFor,
  holidaysInMonth,
  holidaysOn,
  holidayYearRange,
  isHoliday,
  isShippedHolidayRegion,
  resolveCalendarHolidays,
  withHolidaysBlocked,
} from './index.js';

describe('@jalali-js/holidays', () => {
  it('defaults to Iran official holidays', () => {
    expect(isShippedHolidayRegion('IR')).toBe(true);
    expect(isShippedHolidayRegion('AF')).toBe(false);
    expect(holidayPackFor('IR').label.en).toBe('Iran');
    expect(isHoliday({ year: 1403, month: 1, day: 1 })).toBe(true);
  });

  it('rejects Afghanistan and Tajikistan until those packs ship', () => {
    expect(() => holidayPackFor('AF')).toThrow(/not shipped yet/);
    expect(() => holidayPackFor('TJ')).toThrow(/not shipped yet/);
    expect(() => isHoliday({ year: 1403, month: 1, day: 1 }, { region: 'AF' })).toThrow(
      /not shipped yet/,
    );
  });

  it('marks fixed Nowruz days in any year', () => {
    expect(isHoliday({ year: 1390, month: 1, day: 1 })).toBe(true);
    expect(isHoliday({ year: 1500, month: 1, day: 4 })).toBe(true);
    expect(holidaysOn({ year: 1403, month: 1, day: 1 })[0]?.id).toBe('nowruz');
  });

  it('marks other fixed solar holidays', () => {
    expect(isHoliday({ year: 1403, month: 1, day: 12 })).toBe(true);
    expect(isHoliday({ year: 1403, month: 1, day: 13 })).toBe(true);
    expect(isHoliday({ year: 1403, month: 3, day: 14 })).toBe(true);
    expect(isHoliday({ year: 1403, month: 3, day: 15 })).toBe(true);
    expect(isHoliday({ year: 1403, month: 11, day: 22 })).toBe(true);
    expect(isHoliday({ year: 1403, month: 12, day: 29 })).toBe(true);
  });

  it('uses Iranian English names, not Arabic calques', () => {
    const fetr = holidaysOn({ year: 1403, month: 1, day: 22 }).find(
      (holiday) => holiday.id === 'eyd-fetr',
    );
    expect(fetr?.names.en).toBe('Eyd-e Fetr');
    expect(fetr?.names.en).not.toMatch(/Eid al-/i);

    const jomhoori = holidaysOn({ year: 1403, month: 1, day: 12 })[0];
    expect(jomhoori?.id).toBe('jomhoori-eslami');
    expect(jomhoori?.names.en).toBe('Jomhoori Eslami');
  });

  it('returns lunar holidays for known official dates in 1403', () => {
    const ashura = holidaysOn({ year: 1403, month: 4, day: 26 });
    expect(ashura.some((holiday) => holiday.id === 'ashura')).toBe(true);
    expect(ashura[0]?.names.fa).toBe('عاشورا');
    expect(ashura[0]?.names.ps).toBe('عاشورا');
    expect(ashura[0]?.names.en).toBe('Ashura');

    const fetr = holidaysOn({ year: 1403, month: 1, day: 22 });
    expect(fetr.some((holiday) => holiday.id === 'eyd-fetr')).toBe(true);

    const reza = holidaysOn({ year: 1403, month: 6, day: 14 });
    expect(reza.some((holiday) => holiday.id === 'martyrdom-imam-reza')).toBe(true);
  });

  it('names every holiday in en, fa, and ps from per-language files', () => {
    const day = holidaysOn({ year: 1403, month: 4, day: 26 })[0]!;
    expect(day.names).toEqual({
      en: 'Ashura',
      fa: 'عاشورا',
      ps: 'عاشورا',
    });
    expect(holidayName('eyd-fetr', 'fa')).toBe('عید فطر');
    expect(holidayName('eyd-fetr', 'ps', { region: 'IR' })).toBe('کوچنی اختر');
    expect(holidayName('eyd-qorban', 'ps')).toBe('لوی اختر');
    expect(holidayName('jomhoori-eslami', 'fa')).toBe('روز جمهوری اسلامی');
    expect(holidayName('jomhoori-eslami', 'ps')).toBe('د اسلامي جمهوریت ورځ');
    expect(() => holidayName('ashura', 'en', { region: 'AF' })).toThrow(/not shipped yet/);
  });

  it('returns both fixed and lunar holidays when they share a day', () => {
    const day = holidaysOn({ year: 1403, month: 1, day: 13 });
    const ids = day.map((holiday) => holiday.id).sort();
    expect(ids).toEqual(['martyrdom-imam-ali', 'sizdah-bedar']);
  });

  it('lists Farvardin 1403 holidays in day order', () => {
    const month = holidaysInMonth(1403, 1);
    expect(month.map((holiday) => holiday.day)).toEqual([1, 2, 3, 4, 12, 13, 13, 22, 23]);
    expect(month.some((holiday) => holiday.id === 'jomhoori-eslami')).toBe(true);
  });

  it('does not invent lunar holidays outside the covered year range', () => {
    expect(HOLIDAY_YEAR_RANGE).toEqual({ min: 1402, max: 1425 });
    expect(holidayYearRange({ region: 'IR' })).toEqual({ min: 1402, max: 1425 });
    expect(isHoliday({ year: 1399, month: 4, day: 26 })).toBe(false);
    expect(isHoliday({ year: 1426, month: 1, day: 1 })).toBe(true);
    expect(isHoliday({ year: 1426, month: 4, day: 4 })).toBe(false);
    expect(isHoliday({ year: 1399, month: 1, day: 1 })).toBe(true);
  });

  it('covers sample lunar dates across the Iran table, including later years', () => {
    expect(isHoliday({ year: 1402, month: 5, day: 6 })).toBe(true);
    expect(isHoliday({ year: 1405, month: 4, day: 4 })).toBe(true);
    expect(isHoliday({ year: 1404, month: 1, day: 11 })).toBe(true);
    expect(isHoliday({ year: 1406, month: 3, day: 25 })).toBe(true);
    expect(isHoliday({ year: 1406, month: 12, day: 8 })).toBe(true);
    expect(isHoliday({ year: 1425, month: 10, day: 5 })).toBe(true);
  });

  it('includes adjacent-month holidays when building a block list', () => {
    const around = holidayDatesAround(1403, 1);
    expect(around.some((date) => date.month === 1 && date.day === 1)).toBe(true);
    expect(around.some((date) => date.year === 1402 && date.month === 12 && date.day === 29)).toBe(
      true,
    );
  });

  it('merges holiday dates into SelectionRules.disabledDates', () => {
    const rules = withHolidaysBlocked(1403, 1, {
      minDate: { year: 1403, month: 1, day: 5 },
      disabledDates: [{ year: 1403, month: 1, day: 10 }],
    });
    expect(rules.minDate).toEqual({ year: 1403, month: 1, day: 5 });
    expect(rules.disabledDates?.some((date) => date.day === 10)).toBe(true);
    expect(rules.disabledDates?.some((date) => date.day === 1)).toBe(true);
  });

  it('resolveCalendarHolidays is a no-op for Gregorian', () => {
    const resolved = resolveCalendarHolidays('gregorian', 1403, 1, {
      showHolidays: true,
      blockHolidays: true,
      rules: { disabledWeekdays: [5] },
    });
    expect(resolved.isHolidayDay).toBeUndefined();
    expect(resolved.rules).toEqual({ disabledWeekdays: [5] });
  });

  it('resolveCalendarHolidays wires show and block for Jalali Iran', () => {
    const resolved = resolveCalendarHolidays('jalali', 1403, 1, {
      showHolidays: true,
      blockHolidays: true,
      region: 'IR',
    });
    expect(resolved.isHolidayDay?.({ year: 1403, month: 1, day: 1 })).toBe(true);
    expect(resolved.isHolidayDay?.({ year: 1403, month: 1, day: 5 })).toBe(false);
    expect(resolved.rules?.disabledDates?.some((date) => date.day === 1)).toBe(true);
  });
});
