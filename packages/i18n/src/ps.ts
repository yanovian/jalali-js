import type { LocalePack } from './locale.js';

// Pashto (ps), Afghanistan's other official language alongside Dari (see architecture.md's
// "Internationalization"). All names and digits below come from CLDR's `ps` locale data, read
// through ICU (Node's `Intl`), not from memory, the same verification approach Phase 1 used
// for the calendar arithmetic itself.
//
// Afghanistan uses the same Solar Hijri calendar as Iran, but names its months after the
// zodiac signs, so the Jalali month names below share nothing with fa.ts's Persian ones.
// CLDR's `ps` data has no abbreviated month or weekday forms distinct from the long ones
// (its "short" variants only differ in spelling, not length), so `short` reuses `long`
// throughout, the same choice fa.ts makes for its month names.
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
  // CLDR's default numbering system for Pashto is arabext, the same digit glyphs fa uses.
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
};
