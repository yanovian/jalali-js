import { holidayName, holidaysOn } from './holidays.js';
import type { HolidayDateFields, HolidayLocale, HolidayQueryOptions } from './types.js';

export interface HolidayDayTipOptions extends HolidayQueryOptions {
  locale: HolidayLocale;
  closed?: boolean;
  closedLabel?: string;
}

/** Holiday names for a day tip. Adds `closedLabel` when the day is blocked. */
export function holidayDayTip(
  date: HolidayDateFields,
  options: HolidayDayTipOptions,
): string | undefined {
  const names = holidaysOn(date, options).map((holiday) =>
    holidayName(holiday.id, options.locale, options),
  );
  const parts = [...names];
  if (options.closed && options.closedLabel) parts.push(options.closedLabel);
  if (parts.length === 0) return undefined;
  return parts.join(' · ');
}

export function holidayDayAriaLabel(dateLabel: string, tip: string | undefined): string {
  return tip ? `${dateLabel}. ${tip}` : dateLabel;
}

export interface HolidayDayCell {
  date: HolidayDateFields;
  isHoliday: boolean;
  isSelectable: boolean;
}

/** Tip and aria-label for one calendar day cell. */
export function holidayDayChrome(
  dateLabel: string,
  cell: HolidayDayCell,
  options: { locale: HolidayLocale; region?: HolidayQueryOptions['region']; closedLabel: string },
): { tip?: string; ariaLabel: string } {
  if (!cell.isHoliday) return { ariaLabel: dateLabel };
  const tipOptions: HolidayDayTipOptions = {
    locale: options.locale,
    closed: !cell.isSelectable,
    closedLabel: options.closedLabel,
  };
  if (options.region !== undefined) tipOptions.region = options.region;
  const tip = holidayDayTip(cell.date, tipOptions);
  return tip ? { tip, ariaLabel: holidayDayAriaLabel(dateLabel, tip) } : { ariaLabel: dateLabel };
}
