import type { CalendarDate } from './calendar-date.js';
import type { CalendarDateFields } from './calendar-engine.js';
import { compareDates, isSameDay } from './date-math.js';
import type { TimeOfDay } from './time-of-day.js';

/**
 * A consumer-owned calendar event. The library lays events out. The consumer
 * owns storage and editing.
 *
 * `start` and `end` are inclusive date fields in the calendar system the
 * month view uses. Timed events may set `startTime` / `endTime`. Recurring
 * rules are not expanded here: expand them before you pass the array.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: CalendarDateFields;
  end: CalendarDateFields;
  /** Default: true when no times are set. */
  allDay?: boolean;
  startTime?: TimeOfDay;
  endTime?: TimeOfDay;
}

/** One event chip or bar segment inside a week row. */
export interface EventLaneSegment {
  eventId: string;
  title: string;
  lane: number;
  /** Inclusive weekday index in the week (0-6). */
  startWeekday: number;
  /** Inclusive weekday index in the week (0-6). */
  endWeekday: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  allDay: boolean;
}

function asFields(date: CalendarDateFields): CalendarDateFields {
  return { year: date.year, month: date.month, day: date.day };
}

/** True when `end` is on or after `start`. */
export function isValidEventSpan(event: CalendarEvent): boolean {
  return compareDates(asFields(event.start), asFields(event.end)) <= 0;
}

export function eventIsAllDay(event: CalendarEvent): boolean {
  if (event.allDay !== undefined) return event.allDay;
  return event.startTime === undefined && event.endTime === undefined;
}

/** True when the event covers `date` (inclusive start and end). */
export function eventCoversDate(event: CalendarEvent, date: CalendarDateFields): boolean {
  if (!isValidEventSpan(event)) return false;
  const day = asFields(date);
  return (
    compareDates(asFields(event.start), day) <= 0 && compareDates(day, asFields(event.end)) <= 0
  );
}

function compareEventOrder(a: CalendarEvent, b: CalendarEvent): number {
  const start = compareDates(asFields(a.start), asFields(b.start));
  if (start !== 0) return start;
  const aLength = compareDates(asFields(a.end), asFields(a.start));
  const bLength = compareDates(asFields(b.end), asFields(b.start));
  if (aLength !== bLength) return bLength - aLength;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Events that cover `date`, sorted for stable layout. */
export function eventsForDate(
  events: readonly CalendarEvent[],
  date: CalendarDateFields,
): CalendarEvent[] {
  return events.filter((event) => eventCoversDate(event, date)).sort(compareEventOrder);
}

function weekdayIndex(week: readonly CalendarDate[], date: CalendarDateFields): number {
  return week.findIndex((day) => isSameDay(day, date));
}

/**
 * Lay out events that touch one week row. Each segment keeps one lane across
 * the days it spans in that week. Pure function: no DOM, no framework.
 */
export function layoutWeekEvents(
  events: readonly CalendarEvent[],
  week: readonly CalendarDate[],
): EventLaneSegment[] {
  if (week.length !== 7) {
    throw new Error(`layoutWeekEvents() expects 7 days, got ${week.length}`);
  }
  const weekStart = asFields(week[0]!);
  const weekEnd = asFields(week[6]!);

  const candidates = events
    .filter((event) => isValidEventSpan(event))
    .filter((event) => {
      const start = asFields(event.start);
      const end = asFields(event.end);
      return compareDates(start, weekEnd) <= 0 && compareDates(weekStart, end) <= 0;
    })
    .sort(compareEventOrder);

  const occupied: Array<{ lane: number; start: number; end: number }> = [];
  const segments: EventLaneSegment[] = [];

  for (const event of candidates) {
    const start = asFields(event.start);
    const end = asFields(event.end);
    const clippedStart = compareDates(start, weekStart) < 0 ? weekStart : start;
    const clippedEnd = compareDates(end, weekEnd) > 0 ? weekEnd : end;
    const startWeekday = weekdayIndex(week, clippedStart);
    const endWeekday = weekdayIndex(week, clippedEnd);
    if (startWeekday < 0 || endWeekday < 0) continue;

    let lane = 0;
    for (;;) {
      const hits = occupied.some(
        (entry) => entry.lane === lane && !(endWeekday < entry.start || startWeekday > entry.end),
      );
      if (!hits) break;
      lane += 1;
    }
    occupied.push({ lane, start: startWeekday, end: endWeekday });
    segments.push({
      eventId: event.id,
      title: event.title,
      lane,
      startWeekday,
      endWeekday,
      continuesBefore: compareDates(start, weekStart) < 0,
      continuesAfter: compareDates(end, weekEnd) > 0,
      allDay: eventIsAllDay(event),
    });
  }

  return segments;
}

/**
 * Lay out every week in a month grid. `weeks` is the return value of
 * `buildCalendarGrid()` (only the dates are read).
 */
export function layoutMonthEvents(
  events: readonly CalendarEvent[],
  weeks: readonly (readonly { date: CalendarDate }[])[],
): EventLaneSegment[][] {
  return weeks.map((week) =>
    layoutWeekEvents(
      events,
      week.map((cell) => cell.date),
    ),
  );
}

/** Look up an event by id. */
export function findEventById(
  events: readonly CalendarEvent[],
  id: string,
): CalendarEvent | undefined {
  return events.find((event) => event.id === id);
}
