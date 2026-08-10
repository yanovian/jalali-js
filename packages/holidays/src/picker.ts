import { holidayDatesAround, isHoliday } from './holidays.js';
import { DEFAULT_HOLIDAY_REGION } from './regions/index.js';
import type { HolidayDateFields, HolidayQueryOptions, HolidaySelectionRules } from './types.js';
import { sameYmd } from './ymd.js';

export interface CalendarHolidayOptions {
  /** Mark holiday days with `data-holiday`. Jalali system only. */
  showHolidays?: boolean;
  /** Also block holiday days through `SelectionRules.disabledDates`. Jalali only. */
  blockHolidays?: boolean;
  /**
   * Whose official holiday list to mark or block. Default: `'IR'` (Iran).
   * Afghanistan and Tajikistan are planned; they are not shipped yet.
   */
  region?: HolidayQueryOptions['region'];
  rules?: HolidaySelectionRules | undefined;
}

export interface ResolvedCalendarHolidays {
  rules: HolidaySelectionRules | undefined;
  isHolidayDay: ((date: HolidayDateFields) => boolean) | undefined;
}

function queryOptions(options: CalendarHolidayOptions): HolidayQueryOptions {
  return { region: options.region ?? DEFAULT_HOLIDAY_REGION };
}

/**
 * Merge holiday dates into `disabledDates` for the displayed month and its
 * neighbors. Leaves other rule fields unchanged. When `enabledDates` is set,
 * the whitelist still wins inside `isDateSelectable()`, so holidays are not
 * forced through that path.
 */
export function withHolidaysBlocked(
  year: number,
  month: number,
  base?: HolidaySelectionRules,
  options?: HolidayQueryOptions,
): HolidaySelectionRules {
  const holidayDates = holidayDatesAround(year, month, options);
  const existing = base?.disabledDates ?? [];
  const disabledDates = [
    ...existing,
    ...holidayDates.filter((date) => !existing.some((entry) => sameYmd(entry, date))),
  ];
  return { ...base, disabledDates };
}

/**
 * Resolve picker holiday options into the `rules` and `isHolidayDay` arguments
 * that `buildCalendarGrid()` accepts. No-ops when the calendar system is not
 * Jalali, since the holiday table is Jalali-native. Default region is Iran.
 */
export function resolveCalendarHolidays(
  system: 'jalali' | 'gregorian',
  year: number,
  month: number,
  options: CalendarHolidayOptions,
): ResolvedCalendarHolidays {
  if (system !== 'jalali') {
    return { rules: options.rules, isHolidayDay: undefined };
  }
  const query = queryOptions(options);
  const show = options.showHolidays === true;
  const block = options.blockHolidays === true;
  return {
    rules: block ? withHolidaysBlocked(year, month, options.rules, query) : options.rules,
    isHolidayDay: show ? (date) => isHoliday(date, query) : undefined,
  };
}
