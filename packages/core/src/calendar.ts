import type {
  CalendarDate,
  CalendarDateTime,
  Precision,
  ZonedCalendarDateTime,
} from './calendar-date.js';
import type { CalendarSystem } from './convert.js';
import { fromGregorian, getCalendarEngine } from './convert.js';
import { instantToZonedFields, resolveTimeZone } from './timezone.js';

interface BaseCreateCalendarOptions {
  system: CalendarSystem;
}

export interface CreateDateCalendarOptions extends BaseCreateCalendarOptions {
  precision?: 'date';
}

export interface CreateDateTimeCalendarOptions extends BaseCreateCalendarOptions {
  precision: 'datetime';
}

export interface CreateZonedDateTimeCalendarOptions extends BaseCreateCalendarOptions {
  precision: 'zoned-datetime';
  timeZone?: 'auto' | string;
}

export type CreateCalendarOptions =
  CreateDateCalendarOptions | CreateDateTimeCalendarOptions | CreateZonedDateTimeCalendarOptions;

interface CalendarBase {
  readonly system: CalendarSystem;
  readonly precision: Precision;
  isLeapYear(year: number): boolean;
  daysInMonth(year: number, month: number): number;
}

export interface DateCalendar extends CalendarBase {
  readonly precision: 'date';
  today(): CalendarDate;
}

export interface DateTimeCalendar extends CalendarBase {
  readonly precision: 'datetime';
  today(): CalendarDateTime;
}

export interface ZonedDateTimeCalendar extends CalendarBase {
  readonly precision: 'zoned-datetime';
  readonly timeZone: string;
  today(): ZonedCalendarDateTime;
}

export type Calendar = DateCalendar | DateTimeCalendar | ZonedDateTimeCalendar;

// Local system clock, in local wall-clock terms (the same "local" a plain `new Date()` uses),
// for `today()` calls with no timezone attached. Not exported: a caller who needs a specific
// timezone should ask for a `'zoned-datetime'` calendar instead.
function localNow() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    millisecond: now.getMilliseconds(),
  };
}

export function createCalendar(options: CreateDateTimeCalendarOptions): DateTimeCalendar;
export function createCalendar(options: CreateZonedDateTimeCalendarOptions): ZonedDateTimeCalendar;
export function createCalendar(options: CreateDateCalendarOptions): DateCalendar;
export function createCalendar(options: CreateCalendarOptions): Calendar {
  const engine = getCalendarEngine(options.system);
  const precision = options.precision ?? 'date';

  const base = {
    system: options.system,
    isLeapYear: (year: number) => engine.isLeapYear(year),
    daysInMonth: (year: number, month: number) => engine.daysInMonth(year, month),
  };

  if (precision === 'datetime') {
    return {
      ...base,
      precision: 'datetime',
      today(): CalendarDateTime {
        const now = localNow();
        const dateFields = fromGregorian(now, options.system);
        return {
          ...dateFields,
          hour: now.hour,
          minute: now.minute,
          second: now.second,
          millisecond: now.millisecond,
          system: options.system,
          precision: 'datetime',
        };
      },
    };
  }

  if (precision === 'zoned-datetime') {
    const timeZone = resolveTimeZone(
      (options as CreateZonedDateTimeCalendarOptions).timeZone ?? 'auto',
    );
    return {
      ...base,
      precision: 'zoned-datetime',
      timeZone,
      today(): ZonedCalendarDateTime {
        const zoned = instantToZonedFields(Date.now(), timeZone);
        const dateFields = fromGregorian(zoned, options.system);
        return {
          ...dateFields,
          hour: zoned.hour,
          minute: zoned.minute,
          second: zoned.second,
          millisecond: zoned.millisecond,
          timeZone,
          system: options.system,
          precision: 'zoned-datetime',
        };
      },
    };
  }

  return {
    ...base,
    precision: 'date',
    today(): CalendarDate {
      const now = localNow();
      const dateFields = fromGregorian(now, options.system);
      return { ...dateFields, system: options.system, precision: 'date' };
    },
  };
}
