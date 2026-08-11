import type { HolidayRegion } from '@jalali-js/holidays';
import type { FormatOptions, LocalePack } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarDateTime,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  TimeOfDay,
  ValueFormat,
} from 'jalali-js';
import { createCalendar, timeOfDay, toStorageValue, withTime } from 'jalali-js';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Calendar } from './Calendar.js';
import { DropdownDateFields } from './DropdownDateFields.js';
import { positionPopover } from './position-popover.js';
import { TimePicker } from './TimePicker.js';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

export type DatePickerPrecision = 'date' | 'datetime';

export interface DatePickerProps {
  /** Which calendar system the picker displays and selects in. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language the picker's text reads in. Default: 'en'. */
  locale?: LocaleCode;
  /**
   * The initial selection. Default: today, in `system`. Pass `null` for no initial selection,
   * so the picker opens empty and shows `placeholder` until a person picks a date.
   */
  defaultDate?: CalendarDate | CalendarDateTime | null;
  /**
   * `'date'` (default) selects a day only. `'datetime'` adds a time panel under the grid and
   * emits a `CalendarDateTime` through the storage-value contract.
   */
  precision?: DatePickerPrecision;
  /** Minute options step for the time panel. Default: 1. Used only when `precision` is `'datetime'`. */
  minuteStep?: number;
  /** Hours that do not appear in the time panel (0-23). Used only when `precision` is `'datetime'`. */
  disabledHours?: readonly number[] | undefined;
  /**
   * Let a person click the month or year in the grid popover's header to jump straight to a
   * month grid or a year grid. Default: true. Has no effect on the dropdown variant.
   */
  quickNav?: boolean;
  /**
   * Called with the selection, in both forms: `value`, shaped by `valueFormat` (what an app
   * should store), and `date`, the raw calendar value (what an app should keep displaying).
   * See architecture.md's "Display value against storage value" for why these can differ.
   */
  onChange?: (value: StorageValue, date: CalendarDate | CalendarDateTime) => void;
  /** How `value` (above) is shaped. Default: 'gregorian-iso', a calendar-agnostic value. */
  valueFormat?: ValueFormat;
  /** How the date reads inside the picker's own text input / month title. */
  displayFormat?: FormatOptions;
  /** 'grid': a calendar-grid popup (default). 'dropdown': three year/month/day `<select>`s,
   * better suited to narrow, known-range entry such as a date of birth. */
  variant?: 'grid' | 'dropdown';
  /** Limits on what a person can select. Grid variant only; see `CalendarProps.rules`. */
  rules?: SelectionRules | undefined;
  /** Mark official holidays with `data-holiday`. Grid variant, Jalali only. Default region: Iran. */
  showHolidays?: boolean;
  /** Also block holiday days. Grid variant, Jalali only. */
  blockHolidays?: boolean;
  /** Whose official holiday list to use. Default: `'IR'` (Iran). */
  holidayRegion?: HolidayRegion;
  placeholder?: string;
  className?: string;
}

function displayValue(
  date: CalendarDate | CalendarDateTime,
  localePack: LocalePack,
  displayFormat: FormatOptions | undefined,
): string {
  const datePart = formatDate(date, localePack, displayFormat);
  if (date.precision === 'date') return datePart;
  const hour = formatNumber(date.hour, localePack.defaultNumerals, localePack.digits, 2);
  const minute = formatNumber(date.minute, localePack.defaultNumerals, localePack.digits, 2);
  return `${datePart} ${hour}:${minute}`;
}

function toPickerValue(
  date: CalendarDate,
  time: TimeOfDay,
  precision: DatePickerPrecision,
): CalendarDate | CalendarDateTime {
  return precision === 'datetime' ? withTime(date, time) : date;
}

/**
 * A working, default-styled date picker built on `Calendar` (the headless primitive) and
 * `DropdownDateFields`. With `precision: 'datetime'`, a `TimePicker` sits under the grid.
 * Import `@jalali-js/react/date-picker.css` for its default appearance, or style
 * `[data-jalali-datepicker-*]` yourself; nothing about the component requires the stylesheet
 * to function.
 */
export function DatePicker({
  system = 'jalali',
  locale = 'en',
  defaultDate,
  precision = 'date',
  minuteStep = 1,
  disabledHours,
  quickNav,
  onChange,
  valueFormat = 'gregorian-iso',
  displayFormat,
  variant = 'grid',
  rules,
  showHolidays = false,
  blockHolidays = false,
  holidayRegion = 'IR',
  placeholder,
  className,
}: DatePickerProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [date, setDate] = useState<CalendarDate | CalendarDateTime | null>(() => {
    if (defaultDate === null) return null;
    const seed = defaultDate ?? today;
    if (precision === 'date') {
      return {
        precision: 'date',
        system: seed.system,
        year: seed.year,
        month: seed.month,
        day: seed.day,
      };
    }
    return seed.precision === 'datetime' ? seed : withTime(seed, { hour: 0, minute: 0 });
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
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

  useLayoutEffect(() => {
    if (!open || !inputRef.current || !popoverRef.current) return;
    const anchor = inputRef.current;
    const popover = popoverRef.current;
    const update = () => positionPopover(anchor, popover);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, date, precision]);

  function emit(next: CalendarDate | CalendarDateTime) {
    setDate(next);
    onChange?.(toStorageValue(next, valueFormat), next);
  }

  function selectDay(next: CalendarDate) {
    const time = date ? timeOfDay(date) : { hour: 0, minute: 0 };
    emit(toPickerValue(next, time, precision));
    if (precision === 'date') setOpen(false);
  }

  function selectTime(time: TimeOfDay) {
    emit(withTime(date ?? today, time));
  }

  if (variant === 'dropdown') {
    const day: CalendarDate = date
      ? {
          precision: 'date',
          system: date.system,
          year: date.year,
          month: date.month,
          day: date.day,
        }
      : today;
    return (
      <div className={className} dir={localePack.direction} data-jalali-datepicker-root>
        <DropdownDateFields system={system} locale={locale} date={day} onChange={selectDay} />
        {precision === 'datetime' && (
          <TimePicker
            locale={locale}
            value={date ? timeOfDay(date) : { hour: 0, minute: 0 }}
            minuteStep={minuteStep}
            disabledHours={disabledHours}
            onChange={selectTime}
          />
        )}
      </div>
    );
  }

  return (
    <div className={className} dir={localePack.direction} data-jalali-datepicker-root ref={rootRef}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        role="combobox"
        data-jalali-datepicker-input
        placeholder={placeholder ?? localePack.datePickerPlaceholder}
        value={date ? displayValue(date, localePack, displayFormat) : ''}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
      />
      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          data-jalali-datepicker-popover
          role="dialog"
          aria-label={
            precision === 'datetime' ? localePack.ui.chooseDateAndTime : localePack.ui.chooseDate
          }
        >
          <Calendar
            system={system}
            locale={locale}
            value={
              date
                ? {
                    precision: 'date',
                    system: date.system,
                    year: date.year,
                    month: date.month,
                    day: date.day,
                  }
                : null
            }
            quickNav={quickNav}
            rules={rules}
            showHolidays={showHolidays}
            blockHolidays={blockHolidays}
            holidayRegion={holidayRegion}
            onSelect={selectDay}
          />
          {precision === 'datetime' && (
            <TimePicker
              locale={locale}
              value={date ? timeOfDay(date) : { hour: 0, minute: 0 }}
              minuteStep={minuteStep}
              disabledHours={disabledHours}
              onChange={selectTime}
            />
          )}
        </div>
      )}
    </div>
  );
}
