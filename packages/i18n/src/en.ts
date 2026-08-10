import type { LocalePack } from './locale.js';

export const en: LocalePack = {
  code: 'en',
  direction: 'ltr',
  digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  defaultNumerals: 'latin',
  weekdaySeparator: ', ',
  monthNames: {
    gregorian: {
      long: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    // English transliterations of the Jalali month names, so an English-locale consumer can
    // read a Jalali date without needing Persian script (see "next Farvardin" in
    // architecture.md's natural language parsing example).
    jalali: {
      long: [
        'Farvardin',
        'Ordibehesht',
        'Khordad',
        'Tir',
        'Mordad',
        'Shahrivar',
        'Mehr',
        'Aban',
        'Azar',
        'Dey',
        'Bahman',
        'Esfand',
      ],
      short: ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'],
    },
  },
  weekdayNames: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  datePickerPlaceholder: 'Select a date',
  rangePickerPlaceholder: 'Select a date range',
  relative: {
    today: 'today',
    past: {
      day: { one: '{n} day ago', other: '{n} days ago' },
      week: { one: '{n} week ago', other: '{n} weeks ago' },
      month: { one: '{n} month ago', other: '{n} months ago' },
      year: { one: '{n} year ago', other: '{n} years ago' },
    },
    future: {
      day: { one: 'in {n} day', other: 'in {n} days' },
      week: { one: 'in {n} week', other: 'in {n} weeks' },
      month: { one: 'in {n} month', other: 'in {n} months' },
      year: { one: 'in {n} year', other: 'in {n} years' },
    },
  },
};
