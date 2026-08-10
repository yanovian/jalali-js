/**
 * Official Iranian public holiday ids.
 *
 * Fixed solar (Jalali) ids keep the same month and day every year.
 * Lunar Islamic ids appear only in the per-year table.
 * Ids use Iranian Persian forms, not Arabic calques.
 *
 * `IRAN_LUNAR_HOLIDAY_IDS` is also the allow-list that
 * `scripts/update-holidays.mjs` reads. Keep that export name stable.
 */

export const IRAN_FIXED_HOLIDAY_IDS = [
  'nowruz',
  'jomhoori-eslami',
  'sizdah-bedar',
  'khomeini-demise',
  'khordad-15',
  'revolution-day',
  'oil-nationalization',
] as const;

export const IRAN_LUNAR_HOLIDAY_IDS = [
  'eyd-fetr',
  'eyd-fetr-holiday',
  'martyrdom-imam-ali',
  'martyrdom-imam-sadegh',
  'eyd-qorban',
  'eyd-ghadir',
  'tasua',
  'ashura',
  'arbain',
  'demise-prophet',
  'martyrdom-imam-reza',
  'martyrdom-imam-askari',
  'birth-prophet',
  'martyrdom-fatemeh',
  'birth-imam-ali',
  'mabas',
  'birth-imam-mahdi',
] as const;

export type IranFixedHolidayId = (typeof IRAN_FIXED_HOLIDAY_IDS)[number];
export type IranLunarHolidayId = (typeof IRAN_LUNAR_HOLIDAY_IDS)[number];
export type IranHolidayId = IranFixedHolidayId | IranLunarHolidayId;
