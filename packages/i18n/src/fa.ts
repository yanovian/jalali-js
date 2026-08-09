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
};
