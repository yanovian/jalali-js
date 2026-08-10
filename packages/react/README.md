# @jalali-js/react

React bindings for [jalali-js](https://github.com/yanovian/jalali-js): a `useCalendar` hook, a
headless `Calendar` grid, a working default-styled `DatePicker`, and SSR-safe timezone
resolution.

```sh
npm install @jalali-js/react
```

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  onChange={(value, date) => {
    // value: a Gregorian ISO string by default ('2024-08-05'); date: the raw CalendarDate
  }}
/>;
```

`Calendar` is the headless primitive underneath `DatePicker` (plain markup, `data-jalali-*`
attributes, no required CSS), for full styling control. `variant="dropdown"` swaps the
calendar-grid popup for three plain `<select>`s, for narrow, known-range entry such as a date of
birth. `useResolvedTimeZone()` pairs with a `'zoned-datetime'` calendar under Next.js SSR with no
hydration mismatch.

[`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) adds a `RangePicker`,
an `InlineCalendar`, and extra themes on the same primitives.

[Guide and API reference](https://jalali-js.yanovian.com/) ·
[Examples](https://jalali-js.yanovian.com/guide/examples) ·
[Playground](https://jalali-js.yanovian.com/playground/react/)

MIT licensed.
