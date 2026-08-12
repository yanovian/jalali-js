import { describe, expect, it } from 'vitest';
import type { CalendarDate } from './calendar-date.js';
import { buildCalendarGrid } from './calendar-grid.js';
import {
  daysForEventView,
  eventCoversDate,
  eventMinutesOnDate,
  eventsForDate,
  eventsForTimeline,
  findEventById,
  isValidEventSpan,
  layoutDayTimedEvents,
  layoutMonthEvents,
  layoutWeekEvents,
  shiftEventViewAnchor,
  TIMELINE_ACCENT_COLORS,
  timelineAccentFor,
  timelineEventDateTime,
  timedBlockStyle,
  resolveTimelineLayout,
  ROADMAP_LEFT_X,
  ROADMAP_RIGHT_X,
  roadmapTrackPath,
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

  it('orders timeline events chronologically and drops inverted spans', () => {
    const events = [
      event('later', { year: 1403, month: 5, day: 16 }),
      event('earlier', { year: 1403, month: 5, day: 10 }),
      event('bad', { year: 1403, month: 5, day: 12 }, { year: 1403, month: 5, day: 8 }),
    ];
    expect(eventsForTimeline(events).map((entry) => entry.id)).toEqual(['earlier', 'later']);
  });

  it('picks timeline accents and pads dateTime values', () => {
    expect(timelineAccentFor(0)).toBe(TIMELINE_ACCENT_COLORS[0]);
    expect(timelineAccentFor(5)).toBe(TIMELINE_ACCENT_COLORS[0]);
    expect(timelineAccentFor(1, '#111111')).toBe('#111111');
    expect(
      timelineEventDateTime({
        start: { year: 1403, month: 1, day: 2 },
        startTime: { hour: 9, minute: 5 },
      }),
    ).toBe('1403-01-02T09:05');
  });

  it('resolves timeline layout from layout or alternating', () => {
    expect(resolveTimelineLayout()).toBe('single');
    expect(resolveTimelineLayout({ layout: 'roadmap' })).toBe('roadmap');
    expect(resolveTimelineLayout({ alternating: true })).toBe('alternating');
    expect(resolveTimelineLayout({ layout: 'single', alternating: true })).toBe('single');
  });

  it('builds a serpentine roadmap track path in pixel bounds', () => {
    const track = roadmapTrackPath(3, { width: 200, height: 400 });
    expect(track.viewBox).toBe('0 0 200 400');
    expect(track.roadWidth).toBeCloseTo(24, 5);
    expect(track.d.startsWith('M 100 ')).toBe(true);
    expect(track.d).toContain('C');
    // First peak is left of center, second peak is right of center.
    expect(track.d).toContain(` ${((100 - 200 * 0.16) * 1000) / 1000}`.trim());
  });

  it('falls back to a unit viewBox when bounds are omitted', () => {
    const track = roadmapTrackPath(2);
    expect(track.viewBox).toBe('0 0 100 200');
    expect(track.roadWidth).toBeCloseTo(12, 5);
  });

  it('places even markers on the left peak of the sine road', () => {
    const track = roadmapTrackPath(2, { width: 100, height: 200 });
    const leftPeak = 50 - 100 * 0.16;
    const rightPeak = 50 + 100 * 0.16;
    expect(leftPeak).toBeCloseTo(ROADMAP_LEFT_X, 5);
    expect(rightPeak).toBeCloseTo(ROADMAP_RIGHT_X, 5);
    expect(track.d).toContain(` ${leftPeak} `);
    expect(track.d).toContain(` ${rightPeak} `);
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

  it('builds week and day day-lists from an anchor', () => {
    const week = daysForEventView('jalali', 'week', { year: 1403, month: 5, day: 15 });
    expect(week).toHaveLength(7);
    expect(week[0]).toMatchObject({ year: 1403, month: 5, day: 13 });
    expect(daysForEventView('jalali', 'day', { year: 1403, month: 5, day: 15 })).toEqual([
      { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 },
    ]);
  });

  it('shifts the anchor by view', () => {
    expect(shiftEventViewAnchor('jalali', 'day', { year: 1403, month: 5, day: 15 }, 1)).toEqual({
      year: 1403,
      month: 5,
      day: 16,
    });
    expect(shiftEventViewAnchor('jalali', 'week', { year: 1403, month: 5, day: 15 }, -1)).toEqual({
      year: 1403,
      month: 5,
      day: 8,
    });
    expect(shiftEventViewAnchor('jalali', 'month', { year: 1403, month: 5, day: 15 }, 1)).toEqual({
      year: 1403,
      month: 6,
      day: 1,
    });
  });

  it('lays timed events into minute blocks with overlap lanes', () => {
    const events: CalendarEvent[] = [
      {
        id: 'a',
        title: 'A',
        start: { year: 1403, month: 5, day: 15 },
        end: { year: 1403, month: 5, day: 15 },
        allDay: false,
        startTime: { hour: 9, minute: 0 },
        endTime: { hour: 10, minute: 0 },
      },
      {
        id: 'b',
        title: 'B',
        start: { year: 1403, month: 5, day: 15 },
        end: { year: 1403, month: 5, day: 15 },
        allDay: false,
        startTime: { hour: 9, minute: 30 },
        endTime: { hour: 10, minute: 30 },
      },
    ];
    expect(eventMinutesOnDate(events[0]!, { year: 1403, month: 5, day: 15 })).toEqual({
      startMinute: 9 * 60,
      endMinute: 10 * 60,
    });
    const layout = layoutDayTimedEvents(events, { year: 1403, month: 5, day: 15 });
    expect(layout).toHaveLength(2);
    expect(layout[0]!.lane).not.toBe(layout[1]!.lane);
    const first = timedBlockStyle(layout[0]!, 2);
    const second = timedBlockStyle(layout[1]!, 2);
    expect(first.top).toContain('%');
    expect(first.width).toBe(second.width);
    expect(first.width).toContain('50%');
    expect(second.insetInlineStart).toContain('50%');
    expect(first.zIndex).toBe('1');
  });
});
