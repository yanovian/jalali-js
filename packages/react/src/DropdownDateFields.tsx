import { formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { getCalendarEngine } from 'jalali-js';
import { useMemo } from 'react';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

export interface DropdownDateFieldsProps {
  system: CalendarSystem;
  locale: LocaleCode;
  date: CalendarDate;
  onChange: (date: CalendarDate) => void;
  /** Inclusive year range for the year `<select>`. Default: 100 years back, 10 years forward. */
  yearRange?: readonly [number, number];
  className?: string | undefined;
}

/**
 * The `variant: 'dropdown'` alternative to the calendar-grid popup: three plain `<select>`
 * elements. Better suited than a grid to narrow, known-range entry such as a date of birth
 * (see architecture.md's open decision on the default `DatePicker` variant).
 */
export function DropdownDateFields({
  system,
  locale,
  date,
  onChange,
  yearRange,
  className,
}: DropdownDateFieldsProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const engine = useMemo(() => getCalendarEngine(system), [system]);
  const [minYear, maxYear] = yearRange ?? [date.year - 100, date.year + 10];

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= minYear; year--) list.push(year);
    return list;
  }, [minYear, maxYear]);

  const daysInSelectedMonth = engine.daysInMonth(date.year, date.month);

  return (
    <div className={className} dir={localePack.direction} data-jalali-datepicker-dropdown>
      <select
        aria-label={localePack.ui.year}
        data-jalali-datepicker-field="year"
        value={date.year}
        onChange={(event) => {
          const year = Number(event.target.value);
          const day = Math.min(date.day, engine.daysInMonth(year, date.month));
          onChange({ ...date, year, day });
        }}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {formatNumber(year, localePack.defaultNumerals, localePack.digits)}
          </option>
        ))}
      </select>
      <select
        aria-label={localePack.ui.month}
        data-jalali-datepicker-field="month"
        value={date.month}
        onChange={(event) => {
          const month = Number(event.target.value);
          const day = Math.min(date.day, engine.daysInMonth(date.year, month));
          onChange({ ...date, month, day });
        }}
      >
        {localePack.monthNames[system].long.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={localePack.ui.day}
        data-jalali-datepicker-field="day"
        value={date.day}
        onChange={(event) => onChange({ ...date, day: Number(event.target.value) })}
      >
        {Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1).map((day) => (
          <option key={day} value={day}>
            {formatNumber(day, localePack.defaultNumerals, localePack.digits)}
          </option>
        ))}
      </select>
    </div>
  );
}
