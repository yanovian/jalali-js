import type { IranFixedHolidayId } from './ids.js';
import { iranHoliday } from './holiday.js';

/** Fixed solar (Jalali) Iranian public holidays: same month and day every year. */
const FIXED: ReadonlyArray<{ id: IranFixedHolidayId; month: number; day: number }> = [
  { id: 'nowruz', month: 1, day: 1 },
  { id: 'nowruz', month: 1, day: 2 },
  { id: 'nowruz', month: 1, day: 3 },
  { id: 'nowruz', month: 1, day: 4 },
  { id: 'jomhoori-eslami', month: 1, day: 12 },
  { id: 'sizdah-bedar', month: 1, day: 13 },
  { id: 'khomeini-demise', month: 3, day: 14 },
  { id: 'khordad-15', month: 3, day: 15 },
  { id: 'revolution-day', month: 11, day: 22 },
  { id: 'oil-nationalization', month: 12, day: 29 },
];

export function iranFixedOn(month: number, day: number) {
  return FIXED.filter((entry) => entry.month === month && entry.day === day).map((entry) =>
    iranHoliday(entry.id, 'fixed'),
  );
}

export function iranFixedInMonth(month: number) {
  return FIXED.filter((entry) => entry.month === month).map((entry) => ({
    ...iranHoliday(entry.id, 'fixed'),
    month: entry.month,
    day: entry.day,
  }));
}
