import type { FormatOptions, LocalePack } from '@jalali-js/i18n';
import { en, fa, format as formatDate } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { createCalendar } from 'jalali-js';
import { computed, ref, type Ref } from 'vue';

export type LocaleCode = 'en' | 'fa';

export function localePackFor(locale: LocaleCode): LocalePack {
  return locale === 'fa' ? fa : en;
}

export interface UseCalendarOptions {
  /** Which calendar system the composable's date is expressed in. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language format() reads. Default: 'en'. */
  locale?: LocaleCode;
  /** The initial date. Default: today, in `system`. */
  initialDate?: CalendarDate;
}

export interface UseCalendarResult {
  date: Ref<CalendarDate>;
  format: (date?: CalendarDate, options?: FormatOptions) => string;
  today: () => CalendarDate;
  isLeapYear: (year: number) => boolean;
  daysInMonth: (year: number, month: number) => number;
  locale: Ref<LocalePack>;
}

/**
 * The calendar's own reactive state: a `date` ref, plus `format()` bound to the composable's
 * locale, and the calendar system's `isLeapYear()`/`daysInMonth()`/`today()`. This is the
 * low-level composable `DatePicker` (and any custom UI) is built on; it holds no opinion on how
 * that date gets displayed or stored (see architecture.md's "Display value against storage
 * value").
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const system = options.system ?? 'jalali';
  const locale = options.locale ?? 'en';
  const calendar = createCalendar({ system });
  const localePack = computed(() => localePackFor(locale));
  const date = ref<CalendarDate>(options.initialDate ?? calendar.today()) as Ref<CalendarDate>;

  function format(target: CalendarDate = date.value, formatOptions?: FormatOptions): string {
    return formatDate(target, localePack.value, formatOptions);
  }

  return {
    date,
    format,
    today: calendar.today,
    isLeapYear: calendar.isLeapYear,
    daysInMonth: calendar.daysInMonth,
    locale: localePack,
  };
}
