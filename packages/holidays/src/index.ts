export { holidayName, holidayNames, holidayYearRange, HOLIDAY_YEAR_RANGE } from './holidays.js';
export {
  holidayDatesAround,
  holidaysInMonth,
  holidaysInYear,
  holidaysOn,
  isHoliday,
} from './holidays.js';
export { holidayDayAriaLabel, holidayDayChrome, holidayDayTip } from './day-tip.js';
export type {
  BlockedDayAttrs,
  HolidayDayCell,
  HolidayDayChrome,
  HolidayDayTipOptions,
} from './day-tip.js';
export { resolveCalendarHolidays, withHolidaysBlocked } from './picker.js';
export type { CalendarHolidayOptions, ResolvedCalendarHolidays } from './picker.js';
export {
  DEFAULT_HOLIDAY_REGION,
  HOLIDAY_REGIONS,
  SHIPPED_HOLIDAY_REGIONS,
  holidayPackFor,
  isHolidayRegion,
  isShippedHolidayRegion,
} from './regions/index.js';
export type {
  Holiday,
  HolidayDateFields,
  HolidayId,
  HolidayLocale,
  HolidayNames,
  HolidayOccurrence,
  HolidayQueryOptions,
  HolidayRegion,
  HolidaySelectionRules,
  RegionHolidayPack,
} from './types.js';
// Public so TypeDoc can resolve `HolidayId` (an alias of these ids).
export { IRAN_FIXED_HOLIDAY_IDS, IRAN_LUNAR_HOLIDAY_IDS } from './regions/ir/ids.js';
export type { IranFixedHolidayId, IranHolidayId, IranLunarHolidayId } from './regions/ir/ids.js';
