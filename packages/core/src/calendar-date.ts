import type { CalendarSystem } from './convert.js';

/** Year, month, and day only. The default precision tier; no time part. */
export interface CalendarDate {
  readonly precision: 'date';
  readonly system: CalendarSystem;
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Adds a wall-clock time to `CalendarDate`. No timezone attached. */
export interface CalendarDateTime {
  readonly precision: 'datetime';
  readonly system: CalendarSystem;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

/** Adds an IANA timezone to `CalendarDateTime`. The only tier where "now" is meaningful. */
export interface ZonedCalendarDateTime {
  readonly precision: 'zoned-datetime';
  readonly system: CalendarSystem;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly timeZone: string;
}

export type Precision =
  CalendarDate['precision'] | CalendarDateTime['precision'] | ZonedCalendarDateTime['precision'];

export type AnyCalendarDate = CalendarDate | CalendarDateTime | ZonedCalendarDateTime;
