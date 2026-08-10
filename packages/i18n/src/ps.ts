import type { LocalePack } from './locale.js';

// Pashto (ps), one of Afghanistan's two official languages (see architecture.md's
// "Internationalization"). All names and digits below come from CLDR's `ps` locale data, read
// through ICU (Node's `Intl`), not from memory. Phase 1 used the same source to verify the
// calendar arithmetic itself.
//
// Afghanistan uses the same Jalali solar calendar as Iran. Pashto names the months after the zodiac
// signs, so the Jalali month names below share nothing with fa.ts's Persian ones. These are
// two name sets for the same months of the same calendar, verified directly: ICU reports
// identical year, month, and day numbers for the `ps-AF` and `en` Persian-calendar locales
// across 20,000 random dates (1900-2100), and وری names the same day فروردین names (Nowruz,
// month 1 day 1). Only the display names differ.
//
// CLDR's `ps` data has no abbreviated month or weekday forms distinct from the long ones
// (its "short" variants only differ in spelling, not length), so `short` reuses `long`
// throughout. fa.ts makes the same choice for its month names.
const jalaliMonthsLong = [
  'وری',
  'غویی',
  'غبرگولی',
  'چنگاښ',
  'زمری',
  'وږی',
  'تله',
  'لړم',
  'لیندۍ',
  'مرغومی',
  'سلواغه',
  'کب',
];

const gregorianMonthsLong = [
  'جنوري',
  'فبروري',
  'مارچ',
  'اپریل',
  'مۍ',
  'جون',
  'جولای',
  'اګست',
  'سپتمبر',
  'اکتوبر',
  'نومبر',
  'دسمبر',
];

const weekdaysLong = ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'];

export const ps: LocalePack = {
  code: 'ps',
  direction: 'rtl',
  // CLDR gives Pashto the same digit glyphs fa uses.
  digits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  defaultNumerals: 'native',
  weekdaySeparator: '، ',
  monthNames: {
    gregorian: { long: gregorianMonthsLong, short: gregorianMonthsLong },
    jalali: { long: jalaliMonthsLong, short: jalaliMonthsLong },
  },
  weekdayNames: {
    long: weekdaysLong,
    short: weekdaysLong,
  },
  datePickerPlaceholder: 'نېټه وټاکئ',
  rangePickerPlaceholder: 'د نېټو واټن وټاکئ',
  relative: {
    today: 'نن',
    past: {
      day: { one: '{n} ورځ مخکې', other: '{n} ورځې مخکې' },
      week: { one: '{n} اونۍ مخکې', other: '{n} اونۍ مخکې' },
      month: { one: '{n} مياشت مخکې', other: '{n} مياشتې مخکې' },
      year: { one: '{n} کال مخکې', other: '{n} کاله مخکې' },
    },
    future: {
      day: { one: 'په {n} ورځ کې', other: 'په {n} ورځو کې' },
      week: { one: 'په {n} اونۍ کې', other: 'په {n} اونيو کې' },
      month: { one: 'په {n} مياشت کې', other: 'په {n} مياشتو کې' },
      year: { one: 'په {n} کال کې', other: 'په {n} کالونو کې' },
    },
  },
};
