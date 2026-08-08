import type { CalendarDateFields, CalendarEngine } from './calendar-engine.js';

// Julian Day Number of 1 Farvardin, year 1 AP (22 March 622 CE in the proleptic Gregorian
// calendar). Verified against ICU's Persian calendar (see jalali.test.ts).
const EPOCH_JDN = 1948320;

// The Jalali leap-year rule follows a fixed 33-year cycle: a year is leap when its number,
// taken modulo 33, is one of these eight residues. This arithmetic rule (as opposed to an
// astronomical, vernal-equinox-based one; see architecture.md's "Conversion algorithm")
// was cross-checked against ICU's Persian calendar across Jalali years -50 to 3100 with zero
// mismatches (see jalali.test.ts), which covers every year any real application will meet.
const LEAP_YEAR_RESIDUES = new Set([1, 5, 9, 13, 17, 22, 26, 30]);
const CYCLE_YEARS = 33;
const CYCLE_LEAP_YEARS = 8;
const CYCLE_DAYS = CYCLE_YEARS * 365 + CYCLE_LEAP_YEARS; // 12053

// A 33-year cycle always spans exactly 12053 days, regardless of where it starts, since the
// leap rule is a pure function of (year mod 33). That makes it safe to shift any supported
// year, even a negative one, by a whole number of cycles before doing the positive-only day
// count below, then shift the resulting day count back by the matching number of days.
const CYCLE_SHIFT = 1000;
const YEAR_SHIFT = CYCLE_SHIFT * CYCLE_YEARS;
const DAY_SHIFT = CYCLE_SHIFT * CYCLE_DAYS;

function isLeapYear(year: number): boolean {
  const residue = ((year % CYCLE_YEARS) + CYCLE_YEARS) % CYCLE_YEARS;
  return LEAP_YEAR_RESIDUES.has(residue);
}

function daysInMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 30 : 29;
}

// Days in years [1, year - 1], for a year already shifted to be at least 1.
function daysBeforePositiveYear(year: number): number {
  const completeYears = year - 1;
  const completeCycles = Math.floor(completeYears / CYCLE_YEARS);
  const remainderYears = completeYears - completeCycles * CYCLE_YEARS;
  let leapYearsInRemainder = 0;
  for (let offset = 1; offset <= remainderYears; offset++) {
    if (LEAP_YEAR_RESIDUES.has(offset)) leapYearsInRemainder++;
  }
  return completeCycles * CYCLE_DAYS + remainderYears * 365 + leapYearsInRemainder;
}

// Days in years [1, year - 1], the origin toJulianDayNumber and fromJulianDayNumber count
// from. Works for any year, including zero and negative years, via the cycle-shift above.
function daysBeforeYear(year: number): number {
  return daysBeforePositiveYear(year + YEAR_SHIFT) - DAY_SHIFT;
}

function toJulianDayNumber({ year, month, day }: CalendarDateFields): number {
  let daysBeforeMonth = 0;
  for (let m = 1; m < month; m++) daysBeforeMonth += daysInMonth(year, m);
  return EPOCH_JDN + daysBeforeYear(year) + daysBeforeMonth + (day - 1);
}

function fromJulianDayNumber(jdn: number): CalendarDateFields {
  const dayCount = jdn - EPOCH_JDN;

  // The average Jalali year is 365.2422 days; this gives a close estimate, refined below.
  let year = Math.floor(dayCount / 365.2422) + 1;
  while (daysBeforeYear(year) > dayCount) year--;
  while (daysBeforeYear(year + 1) <= dayCount) year++;

  let remainingDays = dayCount - daysBeforeYear(year);
  let month = 1;
  while (remainingDays >= daysInMonth(year, month)) {
    remainingDays -= daysInMonth(year, month);
    month++;
  }
  return { year, month, day: remainingDays + 1 };
}

export const jalaliEngine: CalendarEngine = {
  system: 'jalali',
  monthsInYear: 12,
  isLeapYear,
  daysInMonth,
  toJulianDayNumber,
  fromJulianDayNumber,
};
