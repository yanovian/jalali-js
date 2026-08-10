import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { LocaleCode } from '@jalali-js/react';
import { localePackFor } from '@jalali-js/react';
import type { CalendarDate, CalendarEvent, CalendarSystem } from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  findEventById,
  layoutMonthEvents,
  nextMonth,
  previousMonth,
} from 'jalali-js';
import { useMemo, useState } from 'react';

export interface EventCalendarProps {
  /** Which calendar system to display. Default: `'jalali'`. */
  system?: CalendarSystem;
  /** Display language. Default: `'en'`. */
  locale?: LocaleCode;
  /** Consumer-owned events. Expand recurring rules before passing them. */
  events?: readonly CalendarEvent[];
  initialDisplayedMonth?: { year: number; month: number };
  displayFormat?: FormatOptions;
  onEventClick?: (event: CalendarEvent) => void;
  onDayClick?: (date: CalendarDate) => void;
  className?: string;
}

/**
 * Month event calendar. The consumer owns the event list and editing UI.
 * This component only lays events out and fires click callbacks.
 */
export function EventCalendar({
  system = 'jalali',
  locale = 'en',
  events = [],
  initialDisplayedMonth,
  displayFormat,
  onEventClick,
  onDayClick,
  className,
}: EventCalendarProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [displayed, setDisplayed] = useState(
    () => initialDisplayedMonth ?? { year: today.year, month: today.month },
  );

  const weeks = useMemo(
    () => buildCalendarGrid(system, displayed.year, displayed.month, today, null),
    [system, displayed.year, displayed.month, today],
  );
  const weekLayouts = useMemo(() => layoutMonthEvents(events, weeks), [events, weeks]);

  const monthLabel = localePack.monthNames[system].long[displayed.month - 1];
  const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
  const previousGlyph = localePack.direction === 'rtl' ? '›' : '‹';
  const nextGlyph = localePack.direction === 'rtl' ? '‹' : '›';

  return (
    <div
      className={className}
      dir={localePack.direction}
      data-jalali-calendar-root
      data-jalali-eventcalendar-root
    >
      <div data-jalali-calendar-header>
        <button
          type="button"
          data-jalali-calendar-nav="previous"
          aria-label="Previous month"
          onClick={() => setDisplayed(previousMonth(system, displayed.year, displayed.month))}
        >
          {previousGlyph}
        </button>
        <span data-jalali-calendar-title>
          {monthLabel} {yearLabel}
        </span>
        <button
          type="button"
          data-jalali-calendar-nav="next"
          aria-label="Next month"
          onClick={() => setDisplayed(nextMonth(system, displayed.year, displayed.month))}
        >
          {nextGlyph}
        </button>
      </div>
      <div role="grid" data-jalali-calendar-grid data-jalali-eventcalendar-grid>
        <div role="row" data-jalali-calendar-weekdays>
          {localePack.weekdayNames.short.map((name, index) => (
            <span key={index} role="columnheader" data-jalali-calendar-weekday>
              {name}
            </span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => {
          const segments = weekLayouts[weekIndex] ?? [];
          const laneCount = segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0);
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
                    onClick={(event) => {
                      event.stopPropagation();
                      const matched = findEventById(events, segment.eventId);
                      if (matched) onEventClick?.(matched);
                    }}
                  >
                    {segment.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
