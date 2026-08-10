/** Plain Jalali year/month/day fields. Duck-typed to match `jalali-js` date shapes. */
export interface HolidayDateFields {
  year: number;
  month: number;
  day: number;
}

/**
 * Country or region whose official holiday list to use.
 *
 * - `IR`: Iran (shipped). Official Iranian public holidays.
 * - `AF`: Afghanistan (planned, not shipped yet).
 * - `TJ`: Tajikistan (planned, not shipped yet).
 *
 * Each country has its own official list. Do not treat Iran's table as the
 * holidays for Afghanistan or Tajikistan.
 */
export type HolidayRegion = 'IR' | 'AF' | 'TJ';

/**
 * Display names for every locale this monorepo ships (`en`, `fa`, `ps`),
 * matching `@jalali-js/i18n`'s `LocaleCode`. Kept as a structural type so this
 * package stays free of a runtime dependency on i18n.
 */
export type HolidayLocale = 'en' | 'fa' | 'ps';

export interface HolidayNames {
  en: string;
  fa: string;
  ps: string;
}

/** Holiday id for a shipped region. Today this is Iran's id set. */
export type HolidayId = import('./regions/ir/ids.js').IranHolidayId;

export interface Holiday {
  id: HolidayId;
  names: HolidayNames;
  /**
   * `fixed`: solar / Jalali (same month and day every year, for example Nowruz).
   * `lunar`: Islamic lunar observance (Jalali date shifts; from the year table).
   */
  kind: 'fixed' | 'lunar';
}

export interface HolidayOccurrence extends Holiday {
  year: number;
  month: number;
  day: number;
}

export interface HolidayQueryOptions {
  /**
   * Whose official holiday list to use. Default: `'IR'` (Iran). Afghanistan
   * and Tajikistan are planned region codes; they are not shipped yet.
   */
  region?: HolidayRegion;
}

/**
 * One country's holiday data and resolvers. Iran ships today. Other regions
 * plug in here with their own fixed rules, lunar tables, and name files.
 */
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
