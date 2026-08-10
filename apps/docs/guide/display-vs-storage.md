---
description: Why components show Jalali by default and emit a Gregorian storage value.
---

# Display value vs. storage value

The calendar system is a display setting. It is not a storage setting. A component can show a
user the Jalali calendar and still hand the application a value that has nothing
calendar-specific in it.

## Default behavior

Every component and every core conversion function returns a Gregorian, calendar-agnostic value
by default. The shape follows the active precision tier:

| Precision tier          | Default value shape                                              |
| ----------------------- | ---------------------------------------------------------------- |
| `CalendarDate`          | Gregorian ISO date string, `YYYY-MM-DD`                          |
| `CalendarDateTime`      | Gregorian ISO datetime string, no offset                         |
| `ZonedCalendarDateTime` | Gregorian ISO datetime string with offset, or epoch milliseconds |

This matches how a native `<input type="date">` behaves: no matter what calendar the operating
system displays, its value is always a Gregorian ISO string. `jalali-js` keeps that same split
by design, rather than tying the stored value to whichever calendar is on screen. An existing
Persian-calendar picker for React, `react-multi-date-picker`, does tie the two together:
configure it to show the Persian calendar, and the value it returns is also in the Persian
calendar, needing an explicit `.convert()` call to get a Gregorian value back out. That coupling
makes it easy to wire a picker's raw output straight into a form or a database field without
adding a conversion step. `jalali-js` avoids that by keeping the default output Gregorian,
regardless of the display calendar.

## Opting into a Jalali-native value

Some applications do need to store a Jalali value as-is (a government or legal record system
that keeps dates in Jalali form, for example). The `valueFormat` option, available anywhere a
component or `toStorageValue()` accepts one, covers this:

```ts
import { toStorageValue } from 'jalali-js';

const date = { year: 1403, month: 5, day: 15 };

toStorageValue(date, 'gregorian-iso'); // '2024-08-05' (default)
toStorageValue(date, 'date'); // native JS Date
toStorageValue(date, 'epoch'); // epoch milliseconds
toStorageValue(date, 'jalali-iso'); // '1403-05-15'
toStorageValue(date, 'jalali-object'); // { year: 1403, month: 5, day: 15 }
```

`'jalali-iso'` and `'jalali-object'` aren't actually Jalali-specific despite the name: they give
whatever calendar system the date's own `system` is, unconverted, rather than the Gregorian
equivalent. Named for the original use case (persisting Jalali dates as such), they work the
same way for a Gregorian-system date too.

This doesn't change what `jalali-js` decides about your own schema. It only decides what value
a component hands back, and makes the calendar-agnostic value the default, so the correct
choice needs no extra thought.

## The full round trip

A typical app: read the stored value (Gregorian by default) → convert to the display calendar
only for rendering → let the user pick a new date → convert back to the stored value on change.
`DatePicker`'s `onChange` already hands back both forms in one call, so most apps never write
this conversion by hand:

```tsx
<DatePicker
  system="jalali"
  locale="fa"
  onChange={(value, date) => {
    // value: the storage value, shaped by valueFormat (what you save)
    // date: the raw CalendarDate (what you'd keep in local UI state, if you need to)
  }}
/>
```
