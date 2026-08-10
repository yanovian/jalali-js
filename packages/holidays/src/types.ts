import type { IranHolidayId } from './regions/ir/ids.js';

/** Plain Jalali year/month/day fields. Duck-typed to match `jalali-js` date shapes. */
export interface HolidayDateFields {
  year: number;
  month: number;
  day: number;
}

/** `IR` ships today. `AF` and `TJ` are reserved. */
export type HolidayRegion = 'IR' | 'AF' | 'TJ';

/** Locales this monorepo ships. Structural so this package stays free of i18n. */
export type HolidayLocale = 'en' | 'fa' | 'ps';

export interface HolidayNames {
  en: string;
  fa: string;
  ps: string;
}

/** Holiday id for a shipped region. Today this is Iran's id set. */
export type HolidayId = IranHolidayId;

export interface Holiday {
  id: HolidayId;
  names: HolidayNames;
  /** `fixed`: solar Jalali. `lunar`: Islamic day from the year table. */
  kind: 'fixed' | 'lunar';
}

export interface HolidayOccurrence extends Holiday {
  year: number;
  month: number;
  day: number;
}

export interface HolidayQueryOptions {
  /** Default: `'IR'`. */
  region?: HolidayRegion;
}

/** One region pack. Iran ships today. */
export interface RegionHolidayPack {
  region: HolidayRegion;
  label: HolidayNames;
  yearRange: { readonly min: number; readonly max: number };
  holidaysOn(date: HolidayDateFields): HolidayOccurrence[];
  holidaysInMonth(year: number, month: number): HolidayOccurrence[];
  names(id: HolidayId): HolidayNames;
  name(id: HolidayId, locale: HolidayLocale): string;
}

/**
 * A `SelectionRules`-shaped bag. This package stays free of a `jalali-js`
 * dependency, so the type is structural.
 */
export interface HolidaySelectionRules {
  minDate?: HolidayDateFields;
  maxDate?: HolidayDateFields;
  enabledDates?: readonly HolidayDateFields[];
  disabledDates?: readonly HolidayDateFields[];
  disabledWeekdays?: readonly number[];
}
