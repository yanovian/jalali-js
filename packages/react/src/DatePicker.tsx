import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  ValueFormat,
} from 'jalali-js';
import { createCalendar, toStorageValue } from 'jalali-js';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar } from './Calendar.js';
import { DropdownDateFields } from './DropdownDateFields.js';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

export interface DatePickerProps {
  /** Which calendar system the picker displays and selects in. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language the picker's text reads in. Default: 'en'. */
  locale?: LocaleCode;
  /**
   * The initial selection. Default: today, in `system`. Pass `null` for no initial selection,
   * so the picker opens empty and shows `placeholder` until a person picks a date.
   */
  defaultDate?: CalendarDate | null;
  /**
   * Let a person click the month or year in the grid popover's header to jump straight to a
   * month grid or a year grid. Default: true. Has no effect on the dropdown variant.
   */
  quickNav?: boolean;
  /**
   * Called with the selection, in both forms: `value`, shaped by `valueFormat` (what an app
   * should store), and `date`, the raw `CalendarDate` (what an app should keep displaying).
   * See architecture.md's "Display value against storage value" for why these can differ.
   */
  onChange?: (value: StorageValue, date: CalendarDate) => void;
  /** How `value` (above) is shaped. Default: 'gregorian-iso', a calendar-agnostic value. */
  valueFormat?: ValueFormat;
  /** How the date reads inside the picker's own text input / month title. */
  displayFormat?: FormatOptions;
  /** 'grid': a calendar-grid popup (default). 'dropdown': three year/month/day `<select>`s,
   * better suited to narrow, known-range entry such as a date of birth. */
  variant?: 'grid' | 'dropdown';
  /** Limits on what a person can select. Grid variant only; see `CalendarProps.rules`. */
  rules?: SelectionRules | undefined;
  placeholder?: string;
  className?: string;
}

function emitChange(
  date: CalendarDate,
  valueFormat: ValueFormat,
  onChange?: DatePickerProps['onChange'],
): void {
  onChange?.(toStorageValue(date, valueFormat), date);
}

/**
 * A working, default-styled date picker built on `Calendar` (the headless primitive) and
 * `DropdownDateFields`. Import `@jalali-js/react/date-picker.css` for its default appearance,
 * or style `[data-jalali-datepicker-*]` yourself; nothing about the component requires the
 * stylesheet to function.
 */
export function DatePicker({
  system = 'jalali',
  locale = 'en',
  defaultDate,
  quickNav,
  onChange,
  valueFormat = 'gregorian-iso',
  displayFormat,
  variant = 'grid',
  rules,
  placeholder,
  className,
}: DatePickerProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [date, setDate] = useState<CalendarDate | null>(() =>
    defaultDate === null ? null : (defaultDate ?? today),
  );
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

  function selectDate(next: CalendarDate) {
    setDate(next);
    emitChange(next, valueFormat, onChange);
  }

  if (variant === 'dropdown') {
    return (
      <DropdownDateFields
        system={system}
        locale={locale}
        date={date ?? today}
        onChange={selectDate}
        className={className}
      />
    );
  }

  return (
    <div className={className} dir={localePack.direction} data-jalali-datepicker-root ref={rootRef}>
      <input
        type="text"
        readOnly
        role="combobox"
        data-jalali-datepicker-input
        placeholder={placeholder ?? localePack.datePickerPlaceholder}
        value={date ? formatDate(date, localePack, displayFormat) : ''}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
      />
      {open && (
        <div id={popoverId} data-jalali-datepicker-popover role="dialog" aria-label="Choose a date">
          <Calendar
            system={system}
            locale={locale}
            value={date}
            quickNav={quickNav}
            rules={rules}
            onSelect={(next) => {
              selectDate(next);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
