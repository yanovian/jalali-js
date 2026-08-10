import { describe, expect, it } from 'vitest';
import type { CalendarDate } from './calendar-date.js';
import { buildCalendarGrid } from './calendar-grid.js';
import {
  eventCoversDate,
  eventsForDate,
  findEventById,
  isValidEventSpan,
  layoutMonthEvents,
  layoutWeekEvents,
  type CalendarEvent,
} from './event-calendar.js';

const today: CalendarDate = {
  precision: 'date',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
};

function event(
  id: string,
  start: { year: number; month: number; day: number },
  end: { year: number; month: number; day: number } = start,
  title = id,
): CalendarEvent {
  return { id, title, start, end };
}

describe('event-calendar layout', () => {
  it('rejects an inverted span', () => {
    expect(
      isValidEventSpan(
        event('bad', { year: 1403, month: 5, day: 10 }, { year: 1403, month: 5, day: 5 }),
      ),
    ).toBe(false);
  });

  it('detects inclusive coverage', () => {
    const multi = event(
      'trip',
      { year: 1403, month: 5, day: 10 },
      { year: 1403, month: 5, day: 12 },
    );
    expect(eventCoversDate(multi, { year: 1403, month: 5, day: 10 })).toBe(true);
    expect(eventCoversDate(multi, { year: 1403, month: 5, day: 11 })).toBe(true);
    expect(eventCoversDate(multi, { year: 1403, month: 5, day: 12 })).toBe(true);
    expect(eventCoversDate(multi, { year: 1403, month: 5, day: 13 })).toBe(false);
  });

  it('lists events for a day in stable order', () => {
    const events = [
      event('b', { year: 1403, month: 5, day: 15 }, { year: 1403, month: 5, day: 16 }),
      event('a', { year: 1403, month: 5, day: 15 }),
      event('c', { year: 1403, month: 5, day: 14 }, { year: 1403, month: 5, day: 15 }),
    ];
    expect(
      eventsForDate(events, { year: 1403, month: 5, day: 15 }).map((entry) => entry.id),
    ).toEqual(['c', 'b', 'a']);
  });

  it('assigns lanes for overlapping events in a week', () => {
    const weeks = buildCalendarGrid('jalali', 1403, 5, today, null);
    const week = weeks.find((row) =>
      row.some((cell) => cell.date.day === 15 && cell.isCurrentMonth),
    )!;
    const dates = week.map((cell) => cell.date);
    const events = [
      event('all-day', { year: 1403, month: 5, day: 14 }, { year: 1403, month: 5, day: 16 }),
      event('same-day', { year: 1403, month: 5, day: 15 }),
    ];
    const layout = layoutWeekEvents(events, dates);
    const allDay = layout.find((segment) => segment.eventId === 'all-day')!;
    const sameDay = layout.find((segment) => segment.eventId === 'same-day')!;
    expect(allDay.lane).not.toBe(sameDay.lane);
    expect(allDay.endWeekday - allDay.startWeekday).toBeGreaterThanOrEqual(2);
    expect(sameDay.startWeekday).toBe(sameDay.endWeekday);
  });

  it('marks continuation when a span starts before the week', () => {
    const weeks = buildCalendarGrid('jalali', 1403, 5, today, null);
    const week = weeks[1]!;
    const mid = week[2]!.date;
    const beforeWeek = event(
      'before',
      { year: 1403, month: 4, day: 28 },
      { year: mid.year, month: mid.month, day: mid.day },
    );
    const layout = layoutWeekEvents(
      [beforeWeek],
      week.map((cell) => cell.date),
    );
    expect(layout).toHaveLength(1);
    expect(layout[0]?.continuesBefore).toBe(true);
    expect(layout[0]?.continuesAfter).toBe(false);
    expect(layout[0]?.startWeekday).toBe(0);
  });

  it('lays out every week in a month grid', () => {
    const weeks = buildCalendarGrid('jalali', 1403, 5, today, null);
    const events = [event('m', { year: 1403, month: 5, day: 1 }, { year: 1403, month: 5, day: 3 })];
    const layout = layoutMonthEvents(events, weeks);
    expect(layout).toHaveLength(weeks.length);
    expect(layout.some((row) => row.some((segment) => segment.eventId === 'm'))).toBe(true);
  });

  it('finds an event by id', () => {
    const events = [event('x', { year: 1403, month: 5, day: 1 })];
    expect(findEventById(events, 'x')?.title).toBe('x');
    expect(findEventById(events, 'missing')).toBeUndefined();
  });
});
