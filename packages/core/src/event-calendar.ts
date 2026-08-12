import type { CalendarDate } from './calendar-date.js';
import type { CalendarDateFields } from './calendar-engine.js';
import type { CalendarSystem } from './convert.js';
import { addDays, addMonths, compareDates, isSameDay, startOf } from './date-math.js';
import type { TimeOfDay } from './time-of-day.js';

export type EventCalendarView = 'month' | 'week' | 'day' | 'timeline';

export type TimelineDirection = 'vertical' | 'horizontal';
export type TimelineMarkerShape = 'circular' | 'square';
/** Card placement for vertical timelines. */
export type TimelineLayout = 'single' | 'alternating' | 'roadmap';

/**
 * Options for `view: 'timeline'`. Defaults match a vertical, circular-marker
 * list with icons on and a single-sided rail.
 */
export interface TimelineOptions {
  direction?: TimelineDirection;
  markerShape?: TimelineMarkerShape;
  showIcons?: boolean;
  /**
   * Card layout. `single` keeps every card on one side of the rail.
   * `alternating` puts cards on both sides of a straight center rail.
   * `roadmap` uses a serpentine dashed road with markers on the curve peaks.
   * Default: `'single'`.
   */
  layout?: TimelineLayout;
  /**
   * Prefer `layout: 'alternating'`. When `layout` is omitted, `true` maps to
   * `alternating`.
   */
  alternating?: boolean;
  /** Marker diameter in CSS pixels. When omitted, CSS `--jalali-timeline-marker-size` applies. */
  markerSize?: number;
}

/** True when the layout places cards on both sides. */
export function isBothSidesTimelineLayout(layout: TimelineLayout): boolean {
  return layout === 'alternating' || layout === 'roadmap';
}

/** Resolve the effective timeline layout from options. */
export function resolveTimelineLayout(options?: TimelineOptions): TimelineLayout {
  if (
    options?.layout === 'single' ||
    options?.layout === 'alternating' ||
    options?.layout === 'roadmap'
  ) {
    return options.layout;
  }
  return options?.alternating ? 'alternating' : 'single';
}

/** Marker X positions as percent of the roadmap width (0 to 100). */
export const ROADMAP_LEFT_X = 34;
export const ROADMAP_RIGHT_X = 66;

/**
 * Half-amplitude from center as a fraction of width.
 * Keep this larger than half the road width so bends stay open.
 */
export const ROADMAP_AMPLITUDE_FRACTION = 0.16;

/** Road width as a fraction of the timeline width. */
export const ROADMAP_WIDTH_FRACTION = 0.12;

export interface RoadmapTrackBounds {
  width: number;
  height: number;
}

/**
 * Build an SVG path for a vertical serpentine roadmap.
 * Pass the painted pixel size so the viewBox matches 1:1.
 * The centerline is a sine wave through each marker peak so a thick
 * stroke reads as a smooth road, not linked blobs.
 */
export function roadmapTrackPath(
  count: number,
  bounds?: RoadmapTrackBounds,
): { d: string; viewBox: string; roadWidth: number } {
  const width = Math.max(1, bounds?.width ?? 100);
  const height = Math.max(1, bounds?.height ?? Math.max(100, count * 100));
  const mid = width / 2;
  const amp = width * ROADMAP_AMPLITUDE_FRACTION;
  const roadWidth = Math.round(width * ROADMAP_WIDTH_FRACTION * 1000) / 1000;
  const viewBox = `0 0 ${width} ${height}`;

  if (count <= 0) {
    const pad = Math.min(roadWidth, height / 4);
    return {
      d: `M ${mid} ${pad} L ${mid} ${height - pad}`,
      viewBox,
      roadWidth,
    };
  }

  const step = height / count;
  // phase = y / step: marker i sits at phase i+0.5 (left on even, right on odd).
  const xAtPhase = (phase: number): number => mid - amp * Math.sin(Math.PI * phase);
  const samplesPerRow = 48;
  const totalSamples = count * samplesPerRow;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= totalSamples; i += 1) {
    const phase = (i / totalSamples) * count;
    const y = phase * step;
    points.push({ x: xAtPhase(phase), y });
  }

  // Smooth cubic path through samples (Catmull-Rom style segment fit).
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return { d, viewBox, roadWidth };
}

/**
 * A consumer-owned calendar event. The library lays events out. The consumer
 * owns storage and editing.
 *
 * `start` and `end` are inclusive date fields in the calendar system the
 * view uses. Timed events may set `startTime` / `endTime`. Recurring rules
 * are not expanded here: expand them before you pass the array.
 *
 * Timeline view also reads optional `description`, `color`, and `icon`.
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
  /** Optional body text for timeline cards. */
  description?: string;
  /** CSS color for timeline accent (marker and card edge). */
  color?: string;
  /** Short icon for timeline markers (emoji or text). */
  icon?: string;
}

/** One event chip or bar segment inside an all-day row. */
export interface EventLaneSegment {
  eventId: string;
  title: string;
  lane: number;
  /** Inclusive day index in the visible day list. */
  startWeekday: number;
  /** Inclusive day index in the visible day list. */
  endWeekday: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  allDay: boolean;
}

/** One timed block inside a day column (minutes from midnight). */
export interface TimedEventBlock {
  eventId: string;
  title: string;
  lane: number;
  startMinute: number;
  endMinute: number;
}

const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_TIMED_MINUTES = 60;

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

function toMinute(time: TimeOfDay | undefined, fallback: number): number {
  if (!time) return fallback;
  return Math.min(MINUTES_PER_DAY, Math.max(0, time.hour * 60 + time.minute));
}

/** Days shown for `view` around `anchor` (week = 7, day = 1). */
export function daysForEventView(
  system: CalendarSystem,
  view: 'week' | 'day',
  anchor: CalendarDateFields,
): CalendarDate[] {
  if (view === 'day') {
    return [{ precision: 'date', system, ...asFields(anchor) }];
  }
  const start = startOf(anchor, 'week', system);
  return Array.from({ length: 7 }, (_, index) => {
    const fields = index === 0 ? start : addDays(start, index, system);
    return { precision: 'date' as const, system, ...fields };
  });
}

/** Move the anchor by one month, week, or day. Timeline keeps the same anchor. */
export function shiftEventViewAnchor(
  system: CalendarSystem,
  view: EventCalendarView,
  anchor: CalendarDateFields,
  direction: -1 | 1,
): CalendarDateFields {
  if (view === 'timeline') return asFields(anchor);
  if (view === 'month') {
    const next = addMonths({ ...anchor, day: 1 }, direction, system);
    return { year: next.year, month: next.month, day: 1 };
  }
  return addDays(anchor, view === 'week' ? direction * 7 : direction, system);
}

/** Events in chronological order for a timeline list. */
export function eventsForTimeline(events: readonly CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => isValidEventSpan(event)).sort(compareEventOrder);
}

/** Default accent colors when a timeline event has no `color`. */
export const TIMELINE_ACCENT_COLORS = [
  '#22c55e',
  '#6366f1',
  '#f97316',
  '#ef4444',
  '#a855f7',
] as const;

/** Accent for timeline item `index`, or `color` when set. */
export function timelineAccentFor(index: number, color?: string): string {
  return color ?? TIMELINE_ACCENT_COLORS[index % TIMELINE_ACCENT_COLORS.length]!;
}

/** Machine-readable `dateTime` value for a timeline `<time>` element. */
export function timelineEventDateTime(event: Pick<CalendarEvent, 'start' | 'startTime'>): string {
  const month = String(event.start.month).padStart(2, '0');
  const day = String(event.start.day).padStart(2, '0');
  const date = `${event.start.year}-${month}-${day}`;
  if (!event.startTime) return date;
  const hour = String(event.startTime.hour).padStart(2, '0');
  const minute = String(event.startTime.minute).padStart(2, '0');
  return `${date}T${hour}:${minute}`;
}

/**
 * Timed span of `event` on `date`, in minutes from midnight. Null when the
 * event is all-day or does not cover the date.
 */
export function eventMinutesOnDate(
  event: CalendarEvent,
  date: CalendarDateFields,
): { startMinute: number; endMinute: number } | null {
  if (eventIsAllDay(event) || !eventCoversDate(event, date)) return null;
  const day = asFields(date);
  const isStart = isSameDay(event.start, day);
  const isEnd = isSameDay(event.end, day);
  const startMinute = isStart ? toMinute(event.startTime, 0) : 0;
  let endMinute = isEnd ? toMinute(event.endTime, MINUTES_PER_DAY) : MINUTES_PER_DAY;
  if (isStart && isEnd && endMinute <= startMinute) {
    endMinute = Math.min(MINUTES_PER_DAY, startMinute + DEFAULT_TIMED_MINUTES);
  }
  if (endMinute <= startMinute) return null;
  return { startMinute, endMinute };
}

/**
 * Lay out events that touch a day list (week or day). Each segment keeps one
 * lane across the days it spans. Pure function: no DOM, no framework.
 */
export function layoutWeekEvents(
  events: readonly CalendarEvent[],
  week: readonly CalendarDate[],
): EventLaneSegment[] {
  if (week.length < 1) {
    throw new Error('layoutWeekEvents() expects at least 1 day');
  }
  const weekStart = asFields(week[0]!);
  const weekEnd = asFields(week[week.length - 1]!);

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

/** Timed blocks for one day, with overlap lanes. */
export function layoutDayTimedEvents(
  events: readonly CalendarEvent[],
  date: CalendarDateFields,
): TimedEventBlock[] {
  const candidates = events
    .map((event) => {
      const span = eventMinutesOnDate(event, date);
      if (!span) return null;
      return { event, ...span };
    })
    .filter(
      (entry): entry is { event: CalendarEvent; startMinute: number; endMinute: number } =>
        entry !== null,
    )
    .sort((a, b) => {
      if (a.startMinute !== b.startMinute) return a.startMinute - b.startMinute;
      const aLength = a.endMinute - a.startMinute;
      const bLength = b.endMinute - b.startMinute;
      if (aLength !== bLength) return bLength - aLength;
      return a.event.id < b.event.id ? -1 : a.event.id > b.event.id ? 1 : 0;
    });

  const occupied: Array<{ lane: number; start: number; end: number }> = [];
  const blocks: TimedEventBlock[] = [];

  for (const candidate of candidates) {
    let lane = 0;
    for (;;) {
      const hits = occupied.some(
        (entry) =>
          entry.lane === lane &&
          !(candidate.endMinute <= entry.start || candidate.startMinute >= entry.end),
      );
      if (!hits) break;
      lane += 1;
    }
    occupied.push({ lane, start: candidate.startMinute, end: candidate.endMinute });
    blocks.push({
      eventId: candidate.event.id,
      title: candidate.event.title,
      lane,
      startMinute: candidate.startMinute,
      endMinute: candidate.endMinute,
    });
  }

  return blocks;
}

export function layoutDaysTimedEvents(
  events: readonly CalendarEvent[],
  days: readonly CalendarDateFields[],
): TimedEventBlock[][] {
  return days.map((day) => layoutDayTimedEvents(events, day));
}

/**
 * CSS placement for a timed block in a day column.
 * Overlapping events share the column side by side.
 */
export function timedBlockStyle(
  block: TimedEventBlock,
  laneCount: number,
): {
  top: string;
  height: string;
  insetInlineStart: string;
  width: string;
  zIndex: string;
} {
  const lanes = Math.max(1, laneCount);
  const startPct = (block.startMinute / MINUTES_PER_DAY) * 100;
  const heightPct = ((block.endMinute - block.startMinute) / MINUTES_PER_DAY) * 100;
  const start = (block.lane / lanes) * 100;
  const width = (1 / lanes) * 100;
  return {
    top: `${startPct}%`,
    height: `${heightPct}%`,
    insetInlineStart: `calc(${start}% + var(--jalali-event-lane-gap, 2px) / 2)`,
    width: `calc(${width}% - var(--jalali-event-lane-gap, 2px))`,
    zIndex: String(1 + block.lane),
  };
}

export function laneCountOf(segments: readonly { lane: number }[]): number {
  return segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0);
}

/** Look up an event by id. */
export function findEventById(
  events: readonly CalendarEvent[],
  id: string,
): CalendarEvent | undefined {
  return events.find((event) => event.id === id);
}
