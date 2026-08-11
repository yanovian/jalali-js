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

/**
 * Attrs for a blocked day button. Prefer these over native `disabled` so hover and focus
 * still work for the holiday tip strip.
 */
export type BlockedDayAttrs = {
  'data-disabled': '';
  'aria-disabled': 'true';
  tabIndex: -1;
};

export interface HolidayDayChrome {
  tip?: string;
  ariaLabel: string;
  blocked?: BlockedDayAttrs;
}

function blockedDayAttrs(isSelectable: boolean): BlockedDayAttrs | undefined {
  if (isSelectable) return undefined;
  return { 'data-disabled': '', 'aria-disabled': 'true', tabIndex: -1 };
}

/** Tip, aria-label, and blocked-day attrs for one calendar day cell. */
export function holidayDayChrome(
  dateLabel: string,
  cell: HolidayDayCell,
  options: { locale: HolidayLocale; region?: HolidayQueryOptions['region']; closedLabel: string },
): HolidayDayChrome {
  const blocked = blockedDayAttrs(cell.isSelectable);
  if (!cell.isHoliday) {
    return blocked ? { ariaLabel: dateLabel, blocked } : { ariaLabel: dateLabel };
  }

  const tipOptions: HolidayDayTipOptions = {
    locale: options.locale,
    closed: !cell.isSelectable,
    closedLabel: options.closedLabel,
  };
  if (options.region !== undefined) tipOptions.region = options.region;
  const tip = holidayDayTip(cell.date, tipOptions);
  const result: HolidayDayChrome = {
    ariaLabel: tip ? holidayDayAriaLabel(dateLabel, tip) : dateLabel,
  };
  if (tip) result.tip = tip;
  if (blocked) result.blocked = blocked;
  return result;
}
