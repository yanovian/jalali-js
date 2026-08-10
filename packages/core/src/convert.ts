import type { CalendarDateFields, CalendarEngine } from './calendar-engine.js';
import { gregorianEngine } from './gregorian.js';
import { jalaliAstronomicalEngine } from './jalali-astronomical.js';
import { jalaliEngine } from './jalali.js';

export type CalendarSystem = 'gregorian' | 'jalali';

/** Jalali leap-year rule. Default is the fast arithmetic engine. */
export type JalaliEngineId = 'arithmetic' | 'astronomical';

export interface CalendarEngineOptions {
  /** Only used when `system` is `'jalali'`. Default: `'arithmetic'`. */
  engine?: JalaliEngineId;
}

const engines: Record<CalendarSystem, CalendarEngine> = {
  gregorian: gregorianEngine,
  jalali: jalaliEngine,
};

export function getCalendarEngine(
  system: CalendarSystem,
  options?: CalendarEngineOptions,
): CalendarEngine {
  if (system === 'jalali' && options?.engine === 'astronomical') {
    return jalaliAstronomicalEngine;
  }
  return engines[system];
}

export function toGregorian(
  date: CalendarDateFields,
  system: CalendarSystem,
  options?: CalendarEngineOptions,
): CalendarDateFields {
  const jdn = getCalendarEngine(system, options).toJulianDayNumber(date);
  return gregorianEngine.fromJulianDayNumber(jdn);
}

export function fromGregorian(
  date: CalendarDateFields,
  system: CalendarSystem,
  options?: CalendarEngineOptions,
): CalendarDateFields {
  const jdn = gregorianEngine.toJulianDayNumber(date);
  return getCalendarEngine(system, options).fromJulianDayNumber(jdn);
}
