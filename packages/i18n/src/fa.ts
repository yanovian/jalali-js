import type { LocalePack } from './locale.js';

// Persian month names, both Jalali and Gregorian, have no widely standardized abbreviated
// form the way English does (Jan, Feb, ...). Rather than invent one, `short` reuses `long` for
// month names in this locale. Weekday names do have a well-established one-letter short form
// (used across Persian calendar UIs), so those differ between long and short below.
const jalaliMonthsLong = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const gregorianMonthsLong = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

export const fa: LocalePack = {
  code: 'fa',
  direction: 'rtl',
  digits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  defaultNumerals: 'native',
  weekdaySeparator: '، ',
  monthNames: {
    gregorian: { long: gregorianMonthsLong, short: gregorianMonthsLong },
    jalali: { long: jalaliMonthsLong, short: jalaliMonthsLong },
  },
  weekdayNames: {
    long: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'],
    short: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  },
  datePickerPlaceholder: 'انتخاب تاریخ',
  rangePickerPlaceholder: 'انتخاب بازه تاریخ',
  ui: {
    previousMonth: 'ماه قبل',
    nextMonth: 'ماه بعد',
    previousYear: 'سال قبل',
    nextYear: 'سال بعد',
    previousYears: 'سال‌های قبل',
    nextYears: 'سال‌های بعد',
    previousWeek: 'هفته قبل',
    nextWeek: 'هفته بعد',
    previousDay: 'روز قبل',
    nextDay: 'روز بعد',
    chooseMonth: 'انتخاب ماه',
    chooseYear: 'انتخاب سال',
    chooseDate: 'انتخاب تاریخ',
    chooseDateAndTime: 'انتخاب تاریخ و زمان',
    chooseDateRange: 'انتخاب بازه تاریخ',
    month: 'ماه',
    year: 'سال',
    day: 'روز',
    hour: 'ساعت',
    minute: 'دقیقه',
  },
  relative: {
    today: 'امروز',
    past: {
      day: { one: '{n} روز پیش', other: '{n} روز پیش' },
      week: { one: '{n} هفته پیش', other: '{n} هفته پیش' },
      month: { one: '{n} ماه پیش', other: '{n} ماه پیش' },
      year: { one: '{n} سال پیش', other: '{n} سال پیش' },
    },
    future: {
      day: { one: '{n} روز دیگر', other: '{n} روز دیگر' },
      week: { one: '{n} هفته بعد', other: '{n} هفته بعد' },
      month: { one: '{n} ماه بعد', other: '{n} ماه بعد' },
      year: { one: '{n} سال بعد', other: '{n} سال بعد' },
    },
  },
};
