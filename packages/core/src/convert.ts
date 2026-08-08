import type { CalendarDateFields, CalendarEngine } from './calendar-engine.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliEngine } from './jalali.js';

export type CalendarSystem = 'gregorian' | 'jalali';

const engines: Record<CalendarSystem, CalendarEngine> = {
  gregorian: gregorianEngine,
  jalali: jalaliEngine,
};

export function getCalendarEngine(system: CalendarSystem): CalendarEngine {
  return engines[system];
}

export function toGregorian(date: CalendarDateFields, system: CalendarSystem): CalendarDateFields {
  const jdn = getCalendarEngine(system).toJulianDayNumber(date);
  return gregorianEngine.fromJulianDayNumber(jdn);
}

export function fromGregorian(
  date: CalendarDateFields,
  system: CalendarSystem,
): CalendarDateFields {
  const jdn = gregorianEngine.toJulianDayNumber(date);
  return getCalendarEngine(system).fromJulianDayNumber(jdn);
}
