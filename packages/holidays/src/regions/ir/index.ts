import type {
  HolidayDateFields,
  HolidayId,
  HolidayLocale,
  HolidayOccurrence,
  RegionHolidayPack,
} from '../../types.js';
import { iranFixedInMonth, iranFixedOn } from './fixed.js';
import { iranHoliday } from './holiday.js';
import { LUNAR_BY_YEAR, LUNAR_YEAR_RANGE } from './lunar-table.js';
import { iranHolidayName, iranHolidayNames } from './names/index.js';

function compareOccurrences(a: HolidayOccurrence, b: HolidayOccurrence): number {
  return a.day - b.day || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function lunarInMonth(year: number, month: number): HolidayOccurrence[] {
  return (LUNAR_BY_YEAR[year] ?? [])
    .filter((entry) => entry.month === month)
    .map((entry) => ({
      ...iranHoliday(entry.id, 'lunar'),
      year,
      month: entry.month,
      day: entry.day,
    }));
}

/**
 * Official public holidays of Iran. The list combines two calendars:
 * fixed solar (Jalali) national days such as Nowruz, and lunar Islamic
 * observances whose Jalali date shifts each year. Fixed days come from
 * rules. Lunar days come from the University of Tehran Calendar Centre
 * year table.
 */
export const iranHolidayPack: RegionHolidayPack = {
  region: 'IR',
  label: {
    en: 'Iran',
    fa: 'ایران',
    ps: 'ایران',
  },
  yearRange: LUNAR_YEAR_RANGE,
  holidaysOn(date: HolidayDateFields): HolidayOccurrence[] {
    const fixed = iranFixedOn(date.month, date.day).map((holiday) => ({
      ...holiday,
      year: date.year,
      month: date.month,
      day: date.day,
    }));
    const lunar = lunarInMonth(date.year, date.month).filter((holiday) => holiday.day === date.day);
    return [...fixed, ...lunar];
  },
  holidaysInMonth(year: number, month: number): HolidayOccurrence[] {
    const fixed = iranFixedInMonth(month).map((holiday) => ({ ...holiday, year }));
    return [...fixed, ...lunarInMonth(year, month)].sort(compareOccurrences);
  },
  names(id: HolidayId) {
    return iranHolidayNames(id);
  },
  name(id: HolidayId, locale: HolidayLocale) {
    return iranHolidayName(id, locale);
  },
};

export type { IranHolidayId } from './ids.js';
export { IRAN_FIXED_HOLIDAY_IDS, IRAN_LUNAR_HOLIDAY_IDS } from './ids.js';
