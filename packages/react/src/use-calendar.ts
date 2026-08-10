import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { createCalendar } from 'jalali-js';
import type { FormatOptions, LocalePack } from '@jalali-js/i18n';
import { en, fa, ps, format as formatDate } from '@jalali-js/i18n';
import { useCallback, useMemo, useState } from 'react';

export type LocaleCode = 'en' | 'fa' | 'ps';

const localePacks: Record<LocaleCode, LocalePack> = { en, fa, ps };

export function localePackFor(locale: LocaleCode): LocalePack {
  return localePacks[locale];
}

export interface UseCalendarOptions {
  /** Which calendar system the hook's date is expressed in. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language format() reads. Default: 'en'. */
  locale?: LocaleCode;
  /** The initial date. Default: today, in `system`. */
  initialDate?: CalendarDate;
}

export interface UseCalendarResult {
  date: CalendarDate;
  setDate: (date: CalendarDate) => void;
  format: (date?: CalendarDate, options?: FormatOptions) => string;
  today: () => CalendarDate;
  isLeapYear: (year: number) => boolean;
  daysInMonth: (year: number, month: number) => number;
  locale: LocalePack;
}

/**
 * The calendar's own reactive state: a `date` and a `setDate`, plus `format()` bound to the
 * hook's locale, and the calendar system's `isLeapYear()`/`daysInMonth()`/`today()`. This is
 * the low-level hook `DatePicker` (and any custom UI) is built on; it holds no opinion on how
 * that date gets displayed or stored (see architecture.md's "Display value against storage
 * value" for where that split lives).
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const system = options.system ?? 'jalali';
  const locale = options.locale ?? 'en';
  const calendar = useMemo(() => createCalendar({ system }), [system]);
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const [date, setDate] = useState<CalendarDate>(() => options.initialDate ?? calendar.today());

  const format = useCallback(
    (target: CalendarDate = date, formatOptions?: FormatOptions) =>
      formatDate(target, localePack, formatOptions),
    [date, localePack],
  );

  return {
    date,
    setDate,
    format,
    today: calendar.today,
    isLeapYear: calendar.isLeapYear,
    daysInMonth: calendar.daysInMonth,
    locale: localePack,
  };
}
