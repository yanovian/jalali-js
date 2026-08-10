import type { CalendarDateFields, CalendarEngine } from './calendar-engine.js';
import { gregorianEngine } from './gregorian.js';
import { marchEquinoxJde } from './meeus-sun.js';

/**
 * Official Iranian calendar meridian: 52.5° east (UTC+03:30).
 * Nowruz is the civil day whose local midnight is nearest the equinox
 * (equivalent to the before-noon / after-noon rule at this meridian).
 */
const TEHRAN_OFFSET_DAYS = 3.5 / 24;

const nowruzCache = new Map<number, number>();

/** Julian Day Number of 1 Farvardin for a Jalali year (astronomical Nowruz). */
export function nowruzJulianDayNumber(jalaliYear: number): number {
  const cached = nowruzCache.get(jalaliYear);
  if (cached !== undefined) return cached;

  // March of Gregorian year (jalaliYear + 621) holds this Nowruz.
  const gregorianYear = jalaliYear + 621;
  const equinoxJde = marchEquinoxJde(gregorianYear);
  const tehranJd = equinoxJde + TEHRAN_OFFSET_DAYS;
  // Civil day that contains the equinox at Tehran, then the noon rule:
  // before local noon → that day; at or after noon → the next day.
  const localJdn = Math.floor(tehranJd + 0.5);
  const jdn = tehranJd < localJdn ? localJdn : localJdn + 1;
  nowruzCache.set(jalaliYear, jdn);
  return jdn;
}

function isLeapYear(year: number): boolean {
  return nowruzJulianDayNumber(year + 1) - nowruzJulianDayNumber(year) === 366;
}

function daysInMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 30 : 29;
}

function daysBeforeMonth(year: number, month: number): number {
  let days = 0;
  for (let m = 1; m < month; m++) days += daysInMonth(year, m);
  return days;
}

function toJulianDayNumber({ year, month, day }: CalendarDateFields): number {
  return nowruzJulianDayNumber(year) + daysBeforeMonth(year, month) + (day - 1);
}

function fromJulianDayNumber(jdn: number): CalendarDateFields {
  const approxGregorian = gregorianEngine.fromJulianDayNumber(jdn);
  let year = approxGregorian.year - 621;
  while (nowruzJulianDayNumber(year + 1) <= jdn) year += 1;
  while (nowruzJulianDayNumber(year) > jdn) year -= 1;

  let remaining = jdn - nowruzJulianDayNumber(year);
  let month = 1;
  while (remaining >= daysInMonth(year, month)) {
    remaining -= daysInMonth(year, month);
    month += 1;
  }
  return { year, month, day: remaining + 1 };
}

export const jalaliAstronomicalEngine: CalendarEngine = {
  system: 'jalali',
  monthsInYear: 12,
  isLeapYear,
  daysInMonth,
  toJulianDayNumber,
  fromJulianDayNumber,
};
