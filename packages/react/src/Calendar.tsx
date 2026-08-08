import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { buildCalendarGrid, createCalendar, nextMonth, previousMonth } from 'jalali-js';
import { useMemo, useState } from 'react';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

export interface CalendarProps {
  /** Which calendar system to display. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language the month title and weekday headers read in. Default: 'en'. */
  locale?: LocaleCode;
  /** The selected date, or `null` for none. */
  value?: CalendarDate | null;
  onSelect?: (date: CalendarDate) => void;
  /** The year/month the grid opens on. Default: `value`'s month, or today's. */
  initialDisplayedMonth?: { year: number; month: number };
  className?: string;
}

/**
 * A headless month grid: it renders plain markup with data attributes (`data-selected`,
 * `data-today`, `data-outside-month`) and no required CSS, so a consumer can restyle it
 * completely. `DatePicker` is this same component with a default stylesheet and a popover
 * wrapped around it.
 */
export function Calendar({
  system = 'jalali',
  locale = 'en',
  value = null,
  onSelect,
  initialDisplayedMonth,
  className,
}: CalendarProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [displayed, setDisplayed] = useState(
    () =>
      initialDisplayedMonth ??
      (value ? { year: value.year, month: value.month } : { year: today.year, month: today.month }),
  );

  const weeks = useMemo(
    () => buildCalendarGrid(system, displayed.year, displayed.month, today, value),
    [system, displayed.year, displayed.month, today, value],
  );

  const monthLabel = localePack.monthNames[system].long[displayed.month - 1];
  const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);

  return (
    <div className={className} dir={localePack.direction} data-jalali-calendar-root>
      <div data-jalali-calendar-header>
        <button
          type="button"
          data-jalali-calendar-nav="previous"
          aria-label="Previous month"
          onClick={() => setDisplayed(previousMonth(system, displayed.year, displayed.month))}
        >
          {localePack.direction === 'rtl' ? '›' : '‹'}
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
          {localePack.direction === 'rtl' ? '‹' : '›'}
        </button>
      </div>
      <div role="grid" data-jalali-calendar-grid>
        <div role="row" data-jalali-calendar-weekdays>
          {localePack.weekdayNames.short.map((name, index) => (
            <span key={index} role="columnheader" data-jalali-calendar-weekday>
              {name}
            </span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" data-jalali-calendar-week>
            {week.map((cell) => (
              <button
                key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                type="button"
                role="gridcell"
                data-jalali-calendar-day
                data-selected={cell.isSelected ? '' : undefined}
                data-today={cell.isToday ? '' : undefined}
                data-outside-month={cell.isCurrentMonth ? undefined : ''}
                aria-selected={cell.isSelected}
                aria-current={cell.isToday ? 'date' : undefined}
                aria-label={formatDate(cell.date, localePack, { style: 'long' })}
                onClick={() => onSelect?.(cell.date)}
              >
                {formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
