import type { IranHolidayId } from '../ids.js';

/**
 * Pashto display names for Iranian holidays. Shared observances use common
 * Afghan Pashto forms (for example کوچنی اختر). Iran-only official days get a
 * Pashto rendering of the same Iranian name.
 */
export const ps: Record<IranHolidayId, string> = {
  nowruz: 'نوروز',
  'jomhoori-eslami': 'د اسلامي جمهوریت ورځ',
  'sizdah-bedar': 'د طبیعت ورځ',
  'khomeini-demise': 'د امام خمیني وفات',
  'khordad-15': 'د ۱۵ غبرګولي قیام',
  'revolution-day': 'د اسلامي انقلاب بریا',
  'oil-nationalization': 'د تېلو د صنعت ملي کېدل',
  'eyd-fetr': 'کوچنی اختر',
  'eyd-fetr-holiday': 'د کوچني اختر رخصتي',
  'martyrdom-imam-ali': 'د امام علي شهادت',
  'martyrdom-imam-sadegh': 'د امام جعفر صادق شهادت',
  'eyd-qorban': 'لوی اختر',
  'eyd-ghadir': 'د غدیر اختر',
  tasua: 'تاسوعا',
  ashura: 'عاشورا',
  arbain: 'اربعین',
  'demise-prophet': 'د پیغمبر وفات او د امام حسن شهادت',
  'martyrdom-imam-reza': 'د امام رضا شهادت',
  'martyrdom-imam-askari': 'د امام حسن عسکري شهادت',
  'birth-prophet': 'د پیغمبر او امام جعفر صادق زیږون',
  'martyrdom-fatemeh': 'د حضرت فاطمې شهادت',
  'birth-imam-ali': 'د امام علي زیږون',
  mabas: 'مبعث',
  'birth-imam-mahdi': 'د حضرت قائم زیږون',
};
