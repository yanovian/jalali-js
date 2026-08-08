/**
 * A calendar date, in whichever calendar system an engine works in. Month and day are
 * 1-indexed, matching how a person reads a date, not how an array indexes it.
 */
export interface CalendarDateFields {
  year: number;
  month: number;
  day: number;
}

/**
 * The seam between a calendar system's rules and the rest of jalali-js. Adding a calendar
 * later means writing one of these, not changing any other module.
 *
 * A Julian Day Number (JDN) is a continuous day count with no calendar of its own; every
 * engine converts to and from it, and that is the only path between two calendar systems.
 * "Julian" here names the day-count system, not the Julian calendar.
 */
export interface CalendarEngine {
  readonly system: string;
  readonly monthsInYear: number;
  isLeapYear(year: number): boolean;
  daysInMonth(year: number, month: number): number;
  toJulianDayNumber(date: CalendarDateFields): number;
  fromJulianDayNumber(jdn: number): CalendarDateFields;
}
