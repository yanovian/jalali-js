import { formatNumber } from '@jalali-js/i18n';
import type { TimeOfDay } from 'jalali-js';
import { listHours, listMinutes, snapMinute } from 'jalali-js';
import { useMemo, useState } from 'react';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

export interface TimePickerProps {
  /** The selected time. When set, the picker is controlled. */
  value?: TimeOfDay | undefined;
  /** The initial time when `value` is unset. Default: midnight. */
  defaultValue?: TimeOfDay;
  /** Minute options step (1, 5, 15, 30, ...). Default: 1. */
  minuteStep?: number;
  /** Hours that do not appear in the hour list (0-23). */
  disabledHours?: readonly number[] | undefined;
  /** Which language the digit characters use. Default: 'en'. */
  locale?: LocaleCode;
  onChange?: (time: TimeOfDay) => void;
  className?: string | undefined;
}

/**
 * A headless hour and minute picker. It renders two `<select>`s with
 * `data-jalali-timepicker-*` attributes and no required CSS. Import
 * `@jalali-js/react/date-picker.css` for the default look, the same stylesheet
 * `DatePicker` uses.
 */
export function TimePicker({
  value,
  defaultValue = { hour: 0, minute: 0 },
  minuteStep = 1,
  disabledHours,
  locale = 'en',
  onChange,
  className,
}: TimePickerProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const [internal, setInternal] = useState<TimeOfDay>(() => ({
    hour: defaultValue.hour,
    minute: snapMinute(defaultValue.minute, minuteStep),
  }));
  const time = value ?? internal;
  const hours = useMemo(() => listHours(disabledHours), [disabledHours]);
  const minutes = useMemo(() => listMinutes(minuteStep), [minuteStep]);
  const digit = (n: number) => formatNumber(n, localePack.defaultNumerals, localePack.digits, 2);

  function emit(next: TimeOfDay) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className={className} dir={localePack.direction} data-jalali-timepicker-root>
      <select
        aria-label={localePack.ui.hour}
        data-jalali-timepicker-field="hour"
        value={time.hour}
        onChange={(event) => emit({ ...time, hour: Number(event.target.value) })}
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {digit(hour)}
          </option>
        ))}
      </select>
      <span data-jalali-timepicker-separator aria-hidden="true">
        :
      </span>
      <select
        aria-label={localePack.ui.minute}
        data-jalali-timepicker-field="minute"
        value={snapMinute(time.minute, minuteStep)}
        onChange={(event) => emit({ ...time, minute: Number(event.target.value) })}
      >
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {digit(minute)}
          </option>
        ))}
      </select>
    </div>
  );
}
