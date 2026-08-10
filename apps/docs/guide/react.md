---
description: React bindings, DatePicker, headless Calendar, and Next.js SSR notes.
---

# React

```sh
npm install @jalali-js/react
```

## `useCalendar()`

The low-level hook: a `date` state, `format()` bound to the hook's own locale, and the calendar
system's `isLeapYear()`/`daysInMonth()`/`today()`. Everything else in this package is built on
it or on the same primitives it wraps.

```tsx
import { useCalendar } from '@jalali-js/react';

function Summary() {
  const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
  return <p>امروز: {jalali.format(jalali.today(), { style: 'long', weekday: true })}</p>;
}
```

`{ system?, locale?, initialDate? }` in, `{ date, setDate, format, today, isLeapYear,
daysInMonth, locale }` out. Full signature: [API reference](/api/@jalali-js/react/).

## `Calendar`: the headless primitive

A month grid with `data-jalali-calendar-*` attributes and no required CSS. `DatePicker` (below)
is this component with a default stylesheet and a popover wrapped around it; use `Calendar`
directly for an always-visible grid, or to build your own popover/dialog around it.

```tsx
import { Calendar } from '@jalali-js/react';

<Calendar system="jalali" locale="en" value={selected} onSelect={setSelected} />;
```

A `day` render prop replaces the cell markup outright, if the data attributes alone aren't
enough control.

## `DatePicker`: a working, default-styled picker

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  valueFormat="gregorian-iso" // default; see "Display value vs. storage value"
  onChange={(value, date) => {
    /* value: storage value; date: raw CalendarDate */
  }}
/>;
```

`variant="dropdown"` swaps the calendar-grid popup for three plain year/month/day `<select>`s,
for narrow, known-range entry such as a date of birth:

```tsx
<DatePicker system="jalali" locale="en" variant="dropdown" />
```

In the grid popup (and in `Calendar` directly), a person can click the month or year in the
header to jump straight to a month grid or a year grid, instead of paging one month at a time.
This is on by default; pass `quickNav={false}` to turn it off. Pass `defaultDate={null}` for no
initial selection, so the picker opens empty and shows its placeholder until someone picks a
date.

Full prop list: [`DatePickerProps`](/api/@jalali-js/react/interfaces/DatePickerProps).

## `useResolvedTimeZone()`

Pairs with a `'zoned-datetime'` calendar's `timeZone: 'auto'` under SSR. The server render (and
the client's first, hydrating render) always reads `'UTC'`, since there is no `window` yet; this
hook re-resolves the real browser timezone once mounted, with no hydration warning.

```tsx
import { useResolvedTimeZone } from '@jalali-js/react';

function Clock() {
  const timeZone = useResolvedTimeZone('auto');
  return <p>{timeZone}</p>; // 'UTC' during SSR, the real zone after mount
}
```

## Range picker, event calendar, and inline calendar

`@jalali-js/ui-react` adds `RangePicker`, `EventCalendar`, and `InlineCalendar` on the same
primitives; see [Configuration and theming](/guide/theming#range-picker-event-calendar-and-inline-calendar)
and [Event calendar](/guide/event-calendar).

```sh
npm install @jalali-js/ui-react
```

```tsx
import { EventCalendar, InlineCalendar, RangePicker } from '@jalali-js/ui-react';

<InlineCalendar system="jalali" locale="en" value={selected} onSelect={setSelected} />
<RangePicker system="jalali" locale="en" onChange={(value, range) => { /* ... */ }} />
<EventCalendar system="jalali" locale="en" events={events} onEventClick={setActive} />
```
