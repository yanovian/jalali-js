import type { HolidayLocale, HolidayNames } from '../../../types.js';
import type { IranHolidayId } from '../ids.js';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';

/** Compose the three per-language maps into one `HolidayNames` bag. */
export function iranHolidayNames(id: IranHolidayId): HolidayNames {
  return { en: en[id], fa: fa[id], ps: ps[id] };
}

export function iranHolidayName(id: IranHolidayId, locale: HolidayLocale): string {
  return iranHolidayNames(id)[locale];
}
