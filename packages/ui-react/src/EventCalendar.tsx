import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber, formatTimelineStamp } from '@jalali-js/i18n';
import type { LocaleCode } from '@jalali-js/react';
import { localePackFor } from '@jalali-js/react';
import type {
  CalendarDate,
  CalendarDateFields,
  CalendarEvent,
  CalendarSystem,
  EventCalendarView,
  TimelineOptions,
} from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  dayOfWeek,
  daysForEventView,
  eventIsAllDay,
  eventsForTimeline,
  findEventById,
  isSameDay,
  laneCountOf,
  layoutDaysTimedEvents,
  layoutMonthEvents,
  layoutWeekEvents,
  listHours,
  shiftEventViewAnchor,
  timedBlockStyle,
  timelineAccentFor,
  timelineEventDateTime,
  weekdayLabelsForGrid,
} from 'jalali-js';
import { useId, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';

export interface EventCalendarProps {
  system?: CalendarSystem;
  locale?: LocaleCode;
  view?: EventCalendarView;
  events?: readonly CalendarEvent[];
  initialDisplayedMonth?: { year: number; month: number };
  initialDate?: CalendarDateFields;
  displayFormat?: FormatOptions;
  /** Options for `view: 'timeline'`. */
  timeline?: TimelineOptions;
  onEventClick?: (event: CalendarEvent) => void;
  onDayClick?: (date: CalendarDate) => void;
  className?: string;
}

export function EventCalendar({
  system = 'jalali',
  locale = 'en',
  view = 'month',
  events = [],
  initialDisplayedMonth,
  initialDate,
  displayFormat,
  timeline,
  onEventClick,
  onDayClick,
  className,
}: EventCalendarProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [anchor, setAnchor] = useState<CalendarDateFields>(() => {
    if (initialDate) return { ...initialDate };
    if (initialDisplayedMonth) return { ...initialDisplayedMonth, day: 1 };
    return { year: today.year, month: today.month, day: today.day };
  });

  const weeks = useMemo(
    () =>
      view === 'month' ? buildCalendarGrid(system, anchor.year, anchor.month, today, null) : null,
    [view, system, anchor.year, anchor.month, today],
  );
  const monthLayouts = useMemo(
    () => (weeks ? layoutMonthEvents(events, weeks) : null),
    [events, weeks],
  );

  const periodDays = useMemo(
    () => (view === 'week' || view === 'day' ? daysForEventView(system, view, anchor) : null),
    [view, system, anchor],
  );
  const allDayEvents = useMemo(() => events.filter(eventIsAllDay), [events]);
  const allDaySegments = useMemo(
    () => (periodDays ? layoutWeekEvents(allDayEvents, periodDays) : []),
    [allDayEvents, periodDays],
  );
  const timedLayouts = useMemo(
    () => (periodDays ? layoutDaysTimedEvents(events, periodDays) : []),
    [events, periodDays],
  );
  const allDayLaneCount = laneCountOf(allDaySegments);
  const timelineEvents = useMemo(
    () => (view === 'timeline' ? eventsForTimeline(events) : null),
    [view, events],
  );

  const title = useMemo(() => {
    if (view === 'timeline') {
      if (!timelineEvents?.length) return 'Timeline';
      const first = timelineEvents[0]!;
      const last = timelineEvents[timelineEvents.length - 1]!;
      const start = formatDate(
        { precision: 'date', system, ...first.start },
        localePack,
        displayFormat ?? { style: 'short' },
      );
      const end = formatDate(
        { precision: 'date', system, ...last.start },
        localePack,
        displayFormat ?? { style: 'short' },
      );
      return start === end ? start : `${start} – ${end}`;
    }
    if (view === 'month') {
      const monthLabel = localePack.monthNames[system].long[anchor.month - 1];
      const yearLabel = formatNumber(anchor.year, localePack.defaultNumerals, localePack.digits);
      return `${monthLabel} ${yearLabel}`;
    }
    if (!periodDays?.length) return '';
    if (view === 'day') {
      return formatDate(periodDays[0]!, localePack, displayFormat ?? { style: 'long' });
    }
    const start = formatDate(periodDays[0]!, localePack, { style: 'short' });
    const end = formatDate(periodDays[periodDays.length - 1]!, localePack, { style: 'short' });
    return `${start} – ${end}`;
  }, [view, system, anchor, localePack, periodDays, displayFormat, timelineEvents]);

  const navLabel = view === 'month' ? 'month' : view === 'week' ? 'week' : 'day';
  const hours = listHours();
  const titleId = useId();
  const direction = timeline?.direction ?? 'vertical';
  const markerShape = timeline?.markerShape ?? 'circular';
  const showIcons = timeline?.showIcons ?? true;
  const alternating = timeline?.alternating ?? false;
  const markerSize = timeline?.markerSize ?? 24;

  function clickEvent(eventId: string, click: MouseEvent): void {
    click.stopPropagation();
    const matched = findEventById(events, eventId);
    if (matched) onEventClick?.(matched);
  }

  return (
    <div
      className={className}
      dir={localePack.direction}
      role="region"
      aria-labelledby={titleId}
      data-jalali-calendar-root
      data-jalali-eventcalendar-root
      data-view={view}
    >
      {view !== 'timeline' ? (
        <div data-jalali-calendar-header>
          <button
            type="button"
            data-jalali-calendar-nav="previous"
            aria-label={`Previous ${navLabel}`}
            onClick={() => setAnchor(shiftEventViewAnchor(system, view, anchor, -1))}
          >
            ‹
          </button>
          <span id={titleId} data-jalali-calendar-title>
            {title}
          </span>
          <button
            type="button"
            data-jalali-calendar-nav="next"
            aria-label={`Next ${navLabel}`}
            onClick={() => setAnchor(shiftEventViewAnchor(system, view, anchor, 1))}
          >
            ›
          </button>
        </div>
      ) : (
        <div data-jalali-calendar-header data-jalali-timeline-header="">
          <span id={titleId} data-jalali-calendar-title>
            {title}
          </span>
        </div>
      )}

      {view === 'month' && weeks && monthLayouts ? (
        <div
          role="grid"
          aria-labelledby={titleId}
          data-jalali-calendar-grid
          data-jalali-eventcalendar-grid
        >
          <div role="row" data-jalali-calendar-weekdays>
            {weekdayLabelsForGrid(localePack.weekdayNames.short, system).map((name, index) => (
              <span key={index} role="columnheader" data-jalali-calendar-weekday>
                {name}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => {
            const segments = monthLayouts[weekIndex] ?? [];
            const laneCount = laneCountOf(segments);
            return (
              <div key={weekIndex} role="row" data-jalali-eventcalendar-week>
                <div data-jalali-eventcalendar-days>
                  {week.map((cell) => (
                    <button
                      key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                      type="button"
                      role="gridcell"
                      data-jalali-calendar-day
                      data-today={cell.isToday ? '' : undefined}
                      data-outside-month={cell.isCurrentMonth ? undefined : ''}
                      aria-current={cell.isToday ? 'date' : undefined}
                      aria-label={formatDate(
                        cell.date,
                        localePack,
                        displayFormat ?? { style: 'long' },
                      )}
                      onClick={() => onDayClick?.(cell.date)}
                    >
                      {formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)}
                    </button>
                  ))}
                </div>
                <div
                  data-jalali-eventcalendar-lanes
                  style={{
                    gridTemplateRows: laneCount > 0 ? `repeat(${laneCount}, auto)` : undefined,
                  }}
                >
                  {segments.map((segment) => (
                    <button
                      key={`${segment.eventId}-${segment.startWeekday}-${segment.lane}`}
                      type="button"
                      data-jalali-eventcalendar-event
                      data-continues-before={segment.continuesBefore ? '' : undefined}
                      data-continues-after={segment.continuesAfter ? '' : undefined}
                      data-all-day={segment.allDay ? '' : undefined}
                      style={{
                        gridColumn: `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`,
                        gridRow: segment.lane + 1,
                      }}
                      onClick={(event) => clickEvent(segment.eventId, event)}
                    >
                      {segment.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {(view === 'week' || view === 'day') && periodDays ? (
        <div
          role="region"
          tabIndex={0}
          aria-labelledby={titleId}
          data-jalali-eventcalendar-period
          style={{ ['--jalali-event-cols' as string]: periodDays.length }}
        >
          <div data-jalali-eventcalendar-days>
            {periodDays.map((day) => (
              <button
                key={`${day.year}-${day.month}-${day.day}`}
                type="button"
                data-jalali-calendar-day
                data-today={isSameDay(day, today) ? '' : undefined}
                aria-current={isSameDay(day, today) ? 'date' : undefined}
                aria-label={formatDate(day, localePack, displayFormat ?? { style: 'long' })}
                onClick={() => onDayClick?.(day)}
              >
                <span data-jalali-eventcalendar-dayname>
                  {localePack.weekdayNames.short[dayOfWeek(day, system)]}
                </span>
                {formatNumber(day.day, localePack.defaultNumerals, localePack.digits)}
              </button>
            ))}
          </div>
          <div
            data-jalali-eventcalendar-lanes
            data-jalali-eventcalendar-allday
            style={{
              gridTemplateRows:
                allDayLaneCount > 0 ? `repeat(${allDayLaneCount}, auto)` : undefined,
            }}
          >
            {allDaySegments.map((segment) => (
              <button
                key={`${segment.eventId}-${segment.startWeekday}-${segment.lane}`}
                type="button"
                data-jalali-eventcalendar-event
                data-continues-before={segment.continuesBefore ? '' : undefined}
                data-continues-after={segment.continuesAfter ? '' : undefined}
                data-all-day=""
                style={{
                  gridColumn: `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`,
                  gridRow: segment.lane + 1,
                }}
                onClick={(event) => clickEvent(segment.eventId, event)}
              >
                {segment.title}
              </button>
            ))}
          </div>
          <div role="region" tabIndex={0} aria-labelledby={titleId} data-jalali-eventcalendar-timed>
            <div data-jalali-eventcalendar-hours>
              {hours.map((hour) => (
                <span key={hour} data-jalali-eventcalendar-hour>
                  {formatNumber(hour, localePack.defaultNumerals, localePack.digits)}
                </span>
              ))}
            </div>
            {periodDays.map((day, dayIndex) => {
              const blocks = timedLayouts[dayIndex] ?? [];
              const laneCount = Math.max(1, laneCountOf(blocks));
              return (
                <div key={`${day.year}-${day.month}-${day.day}`} data-jalali-eventcalendar-daycol>
                  {blocks.map((block) => (
                    <button
                      key={`${block.eventId}-${block.startMinute}-${block.lane}`}
                      type="button"
                      data-jalali-eventcalendar-event
                      data-timed=""
                      style={timedBlockStyle(block, laneCount)}
                      onClick={(event) => clickEvent(block.eventId, event)}
                    >
                      {block.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === 'timeline' && timelineEvents ? (
        <div
          role={direction === 'horizontal' ? 'region' : undefined}
          tabIndex={direction === 'horizontal' ? 0 : undefined}
          aria-labelledby={direction === 'horizontal' ? titleId : undefined}
          data-jalali-timeline-scroll={direction === 'horizontal' ? '' : undefined}
        >
          <ol
            data-jalali-timeline
            data-direction={direction}
            data-marker-shape={markerShape}
            data-show-icons={showIcons ? '' : undefined}
            data-alternating={alternating ? '' : undefined}
            style={{ ['--jalali-timeline-marker-size' as string]: `${markerSize}px` }}
          >
            {timelineEvents.map((event, index) => {
              const itemStyle = {
                ['--jalali-timeline-accent' as string]: timelineAccentFor(index, event.color),
              } satisfies CSSProperties;
              return (
                <li key={event.id} data-jalali-timeline-item style={itemStyle}>
                  <div data-jalali-timeline-marker aria-hidden="true">
                    {showIcons && event.icon ? (
                      <span data-jalali-timeline-icon>{event.icon}</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    data-jalali-timeline-card
                    onClick={(click) => clickEvent(event.id, click)}
                  >
                    <time data-jalali-timeline-when dateTime={timelineEventDateTime(event)}>
                      {formatTimelineStamp(
                        event.start,
                        system,
                        localePack,
                        displayFormat ?? {},
                        event.startTime,
                      )}
                    </time>
                    <span data-jalali-timeline-title>{event.title}</span>
                    {event.description ? (
                      <span data-jalali-timeline-description>{event.description}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
