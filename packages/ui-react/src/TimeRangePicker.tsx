import type { LocaleCode } from '@jalali-js/react';
import { localePackFor, TimePicker } from '@jalali-js/react';
import type { TimeOfDay } from 'jalali-js';
import { useMemo, useState } from 'react';

export interface TimeRange {
  start: TimeOfDay;
  end: TimeOfDay;
}

export interface TimeRangePickerProps {
  /** Which language the digit characters use. Default: 'en'. */
  locale?: LocaleCode;
  /** The initial range. Default: 09:00 to 17:00. */
  defaultRange?: TimeRange;
  /** Minute options step for both ends. Default: 1. */
  minuteStep?: number;
  /** Hours that do not appear in either hour list (0-23). */
  disabledHours?: readonly number[] | undefined;
  onChange?: (range: TimeRange) => void;
  className?: string | undefined;
}

const DEFAULT_RANGE: TimeRange = {
  start: { hour: 9, minute: 0 },
  end: { hour: 17, minute: 0 },
};

/**
 * Two `TimePicker`s side by side for a start and end time. Built on `@jalali-js/react`'s
 * headless `TimePicker`. Import `@jalali-js/react/date-picker.css` for the default look.
 */
export function TimeRangePicker({
  locale = 'en',
  defaultRange = DEFAULT_RANGE,
  minuteStep = 1,
  disabledHours,
  onChange,
  className,
}: TimeRangePickerProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const [range, setRange] = useState<TimeRange>(defaultRange);

  function update(next: TimeRange) {
    setRange(next);
    onChange?.(next);
  }

  return (
    <div className={className} dir={localePack.direction} data-jalali-timerangepicker-root>
      <TimePicker
        locale={locale}
        value={range.start}
        minuteStep={minuteStep}
        disabledHours={disabledHours}
        onChange={(start) => update({ ...range, start })}
      />
      <span data-jalali-timerangepicker-separator aria-hidden="true">
        –
      </span>
      <TimePicker
        locale={locale}
        value={range.end}
        minuteStep={minuteStep}
        disabledHours={disabledHours}
        onChange={(end) => update({ ...range, end })}
      />
    </div>
  );
}
