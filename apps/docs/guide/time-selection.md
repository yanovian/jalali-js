---
description: Pick a time of day, or a date with a time, in React, Vue, and Web Components.
---

# Time selection

The core already models `date + time` (Phase 2). This guide covers the components that expose
that model in the UI.

## `TimePicker`

Hour and minute selects. Headless first: style through `data-jalali-timepicker-*`, or import
the same `date-picker.css` that `DatePicker` uses.

```tsx
import { TimePicker } from '@jalali-js/react';

<TimePicker
  locale="fa"
  defaultValue={{ hour: 14, minute: 30 }}
  minuteStep={15}
  disabledHours={[0, 1, 2, 3, 4, 5]}
  onChange={(time) => console.log(time)}
/>;
```

| Prop            | Type             | Default                  | Meaning              |
| --------------- | ---------------- | ------------------------ | -------------------- |
| `value`         | `TimeOfDay`      | -                        | Controlled time      |
| `defaultValue`  | `TimeOfDay`      | `{ hour: 0, minute: 0 }` | Uncontrolled seed    |
| `minuteStep`    | `number`         | `1`                      | Minute options step  |
| `disabledHours` | `number[]`       | -                        | Hidden hours 0-23    |
| `locale`        | `LocaleCode`     | `'en'`                   | Digits and direction |
| `onChange`      | `(time) => void` | -                        | Time changed (React) |

Vue uses `@change`. Web: `<jalali-time-picker>`, attrs `minute-step` and `disabled-hours`,
prop `.value`.

## `DatePicker` with `precision="datetime"`

Add a time panel under the grid. The emitted storage value carries the time through the
existing Phase 2 contract (`2024-08-05T14:30:00.000` by default).

```tsx
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  precision="datetime"
  minuteStep={15}
  onChange={(value, date) => console.log(value, date)}
/>;
```

When `precision` is `'datetime'`, picking a day keeps the popover open so the person can set
the time. Closing still works through Escape or a click outside.

## `TimeRangePicker`

Two `TimePicker`s side by side, in the `ui-*` packages next to `RangePicker`.

```tsx
import { TimeRangePicker } from '@jalali-js/ui-react';

<TimeRangePicker
  locale="fa"
  minuteStep={15}
  onChange={(range) => console.log(range.start, range.end)}
/>;
```

Vue: `@change`. Web: `<jalali-time-range-picker>`, listen for `change`.
