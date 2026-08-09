import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { LocaleCode } from '@jalali-js/react';
import { localePackFor } from '@jalali-js/react';
import type { CalendarDate, CalendarSystem, StorageValue, ValueFormat } from 'jalali-js';
import {
  buildCalendarGrid,
  compareDates,
  createCalendar,
  nextMonth,
  previousMonth,
  toStorageValue,
} from 'jalali-js';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface RangeStorageValue {
  start: StorageValue;
  end: StorageValue;
}

export interface RangePickerProps {
  /** Which calendar system the picker displays and selects in. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language the picker's text reads in. Default: 'en'. */
  locale?: LocaleCode;
  /** The initial range. Default: none (the picker opens with nothing selected). */
  defaultRange?: DateRange;
  /**
   * Called once both ends of the range are picked, with `value` (both ends shaped by
   * `valueFormat`) and `range` (the raw `CalendarDate` pair). See @jalali-js/react's
   * `DatePicker` for why these are two separate shapes.
   */
  onChange?: (value: RangeStorageValue, range: DateRange) => void;
  valueFormat?: ValueFormat;
  displayFormat?: FormatOptions;
  placeholder?: string;
  className?: string;
}

function emitChange(
  range: DateRange,
  valueFormat: ValueFormat,
  onChange?: RangePickerProps['onChange'],
): void {
  onChange?.(
    {
      start: toStorageValue(range.start, valueFormat),
      end: toStorageValue(range.end, valueFormat),
    },
    range,
  );
}

/**
 * A calendar-grid popup for picking a start and end date, built on the same
 * `buildCalendarGrid()` (from `jalali-js`) that `@jalali-js/react`'s headless `Calendar` uses,
 * with its own range-aware cell rendering (`data-range-start`, `data-range-end`,
 * `data-in-range`) rather than reusing `Calendar` directly, since a single date's `isSelected`
 * and a range's start/end/between are genuinely different per-cell shapes.
 *
 * Selection is two clicks: the first sets the range's start, the second sets its end (picking
 * an end earlier than the current start restarts the range from there instead). A light hover
 * preview shows the range that would result from completing it at the hovered day.
 */
export function RangePicker({
  system = 'jalali',
  locale = 'en',
  defaultRange,
  onChange,
  valueFormat = 'gregorian-iso',
  displayFormat,
  placeholder,
  className,
}: RangePickerProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [start, setStart] = useState<CalendarDate | null>(defaultRange?.start ?? null);
  const [end, setEnd] = useState<CalendarDate | null>(defaultRange?.end ?? null);
  const [hoverDate, setHoverDate] = useState<CalendarDate | null>(null);
  const [displayed, setDisplayed] = useState(() => {
    const anchor = defaultRange?.start ?? today;
    return { year: anchor.year, month: anchor.month };
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const weeks = useMemo(
    () => buildCalendarGrid(system, displayed.year, displayed.month, today, null),
    [system, displayed.year, displayed.month, today],
  );

  function selectDay(date: CalendarDate): void {
    if (!start || end) {
      setStart(date);
      setEnd(null);
      return;
    }
    if (compareDates(date, start) < 0) {
      setStart(date);
      setEnd(null);
      return;
    }
    setEnd(date);
    emitChange({ start, end: date }, valueFormat, onChange);
    setOpen(false);
  }

  const displayText = start
    ? end
      ? `${formatDate(start, localePack, displayFormat)} – ${formatDate(end, localePack, displayFormat)}`
      : formatDate(start, localePack, displayFormat)
    : '';

  const monthLabel = localePack.monthNames[system].long[displayed.month - 1];
  const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
  const previewEnd = end ?? hoverDate;

  return (
    <div className={className} dir={localePack.direction} data-jalali-datepicker-root ref={rootRef}>
      <input
        type="text"
        readOnly
        role="combobox"
        data-jalali-datepicker-input
        placeholder={placeholder ?? localePack.rangePickerPlaceholder}
        value={displayText}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
      />
      {open && (
        <div
          id={popoverId}
          data-jalali-datepicker-popover
          role="dialog"
          aria-label="Choose a date range"
        >
          <div dir={localePack.direction} data-jalali-calendar-root>
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
                  {week.map((cell) => {
                    const isRangeStart = start !== null && compareDates(cell.date, start) === 0;
                    const isRangeEnd =
                      previewEnd !== null && compareDates(cell.date, previewEnd) === 0;
                    const isInRange =
                      start !== null &&
                      previewEnd !== null &&
                      compareDates(cell.date, start) > 0 &&
                      compareDates(cell.date, previewEnd) < 0;
                    return (
                      <button
                        key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                        type="button"
                        role="gridcell"
                        data-jalali-calendar-day
                        data-today={cell.isToday ? '' : undefined}
                        data-outside-month={cell.isCurrentMonth ? undefined : ''}
                        data-range-start={isRangeStart ? '' : undefined}
                        data-range-end={isRangeEnd ? '' : undefined}
                        data-in-range={isInRange ? '' : undefined}
                        aria-current={cell.isToday ? 'date' : undefined}
                        aria-label={formatDate(cell.date, localePack, { style: 'long' })}
                        onClick={() => selectDay(cell.date)}
                        onMouseEnter={() => setHoverDate(cell.date)}
                        onMouseLeave={() => setHoverDate(null)}
                      >
                        {formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
