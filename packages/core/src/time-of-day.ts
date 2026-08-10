import type { CalendarDate, CalendarDateTime } from './calendar-date.js';
import type { CalendarSystem } from './convert.js';

/** Hour and minute only. Seconds and milliseconds stay at 0 until a later need. */
export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** The date fields `withTime()` needs. Accepts a `CalendarDate` or a `CalendarDateTime`. */
export type DateFieldsWithSystem = {
  system: CalendarSystem;
  year: number;
  month: number;
  day: number;
};

/**
 * Hours 0-23, minus any listed in `disabledHours`. Every TimePicker binding uses this so the
 * option list stays identical across React, Vue, and Web Components.
 */
export function listHours(disabledHours: readonly number[] = []): number[] {
  const blocked = new Set(disabledHours);
  const hours: number[] = [];
  for (let hour = 0; hour < 24; hour++) {
    if (!blocked.has(hour)) hours.push(hour);
  }
  return hours;
}

/**
 * Minutes 0, step, 2*step, ... below 60. `minuteStep` must divide 60 evenly. Other values
 * fall back to the nearest divisor of 60 that is at least 1.
 */
export function listMinutes(minuteStep = 1): number[] {
  const step = normalizeMinuteStep(minuteStep);
  const minutes: number[] = [];
  for (let minute = 0; minute < 60; minute += step) minutes.push(minute);
  return minutes;
}

/** Snaps `minute` down to the nearest option from `listMinutes(minuteStep)`. */
export function snapMinute(minute: number, minuteStep = 1): number {
  const step = normalizeMinuteStep(minuteStep);
  const clamped = Math.min(59, Math.max(0, Math.trunc(minute)));
  return clamped - (clamped % step);
}

function normalizeMinuteStep(minuteStep: number): number {
  const step = Math.trunc(minuteStep);
  if (step < 1) return 1;
  if (step > 60) return 60;
  if (60 % step === 0) return step;
  for (let candidate = step; candidate >= 1; candidate--) {
    if (60 % candidate === 0) return candidate;
  }
  return 1;
}

/** Combines date fields with a time of day into a `CalendarDateTime`. */
export function withTime(date: DateFieldsWithSystem, time: TimeOfDay): CalendarDateTime {
  return {
    precision: 'datetime',
    system: date.system,
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  };
}

/** Reads the time of day from a datetime value, or midnight for a date-only value. */
export function timeOfDay(date: CalendarDate | CalendarDateTime): TimeOfDay {
  if (date.precision === 'date') return { hour: 0, minute: 0 };
  return { hour: date.hour, minute: date.minute };
}
