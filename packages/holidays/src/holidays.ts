import { DEFAULT_HOLIDAY_REGION, holidayPackFor } from './regions/index.js';
import type {
  HolidayDateFields,
  HolidayId,
  HolidayLocale,
  HolidayNames,
  HolidayOccurrence,
  HolidayQueryOptions,
  HolidayRegion,
} from './types.js';
import { pushUniqueYmd } from './ymd.js';

function resolveRegion(options?: HolidayQueryOptions): HolidayRegion {
  return options?.region ?? DEFAULT_HOLIDAY_REGION;
}

function pack(options?: HolidayQueryOptions) {
  return holidayPackFor(resolveRegion(options));
}

/** Inclusive Jalali year range for lunar rows in the chosen region. */
export function holidayYearRange(options?: HolidayQueryOptions): {
  readonly min: number;
  readonly max: number;
} {
  return pack(options).yearRange;
}

/** @deprecated Use {@link holidayYearRange}. Kept as the Iran lunar range alias. */
export const HOLIDAY_YEAR_RANGE = holidayPackFor('IR').yearRange;

/**
 * Every official holiday that falls on `date` (Jalali fields) for the chosen
 * region. Default region is Iran (`IR`). Fixed solar holidays resolve for any
 * year. Lunar holidays resolve only inside that region's year range.
 */
export function holidaysOn(
  date: HolidayDateFields,
  options?: HolidayQueryOptions,
): HolidayOccurrence[] {
  return pack(options).holidaysOn(date);
}

/** True when at least one official holiday falls on `date` for the region. */
export function isHoliday(date: HolidayDateFields, options?: HolidayQueryOptions): boolean {
  return holidaysOn(date, options).length > 0;
}

/** Every official holiday in a Jalali month for the region, sorted by day then id. */
export function holidaysInMonth(
  year: number,
  month: number,
  options?: HolidayQueryOptions,
): HolidayOccurrence[] {
  return pack(options).holidaysInMonth(year, month);
}

/** Every official holiday in a Jalali year for the region. */
export function holidaysInYear(year: number, options?: HolidayQueryOptions): HolidayOccurrence[] {
  const out: HolidayOccurrence[] = [];
  for (let month = 1; month <= 12; month++) {
    out.push(...holidaysInMonth(year, month, options));
  }
  return out;
}

/**
 * Unique `{ year, month, day }` fields for holidays in `month` and its
 * neighbors. Month grids pad with adjacent days, so blocking uses this wider
 * window.
 */
export function holidayDatesAround(
  year: number,
  month: number,
  options?: HolidayQueryOptions,
): HolidayDateFields[] {
  const months: Array<{ year: number; month: number }> = [];
  if (month <= 1) months.push({ year: year - 1, month: 12 });
  else months.push({ year, month: month - 1 });
  months.push({ year, month });
  if (month >= 12) months.push({ year: year + 1, month: 1 });
  else months.push({ year, month: month + 1 });

  const dates: HolidayDateFields[] = [];
  for (const target of months) {
    for (const holiday of holidaysInMonth(target.year, target.month, options)) {
      pushUniqueYmd(dates, { year: holiday.year, month: holiday.month, day: holiday.day });
    }
  }
  return dates;
}

/**
 * Display names for one holiday id in the chosen region. Default region is
 * Iran. Per-language source files live under that region's `names/` folder.
 */
export function holidayNames(id: HolidayId, options?: HolidayQueryOptions): HolidayNames {
  return pack(options).names(id);
}

/** One locale's display name for a holiday id in the chosen region. */
export function holidayName(
  id: HolidayId,
  locale: HolidayLocale,
  options?: HolidayQueryOptions,
): string {
  return pack(options).name(id, locale);
}
