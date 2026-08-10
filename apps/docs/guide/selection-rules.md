---
description: Limit what a person can pick, min/max bounds, blocked dates and weekdays, in every picker.
---

# Selection rules

Every picker takes a `rules` object (a `SelectionRules` from `jalali-js`) that limits what a
person can select. Blocked days render as disabled buttons with a `data-disabled` attribute:
clicks do nothing, and the Tab order skips them. The same rules work on `Calendar`,
`DatePicker`, and `RangePicker`, in React, Vue, and the Web Components, since all of them read
the rules through the shared `buildCalendarGrid()`.

```ts
interface SelectionRules {
  minDate?: { year: number; month: number; day: number };
  maxDate?: { year: number; month: number; day: number };
  enabledDates?: { year: number; month: number; day: number }[];
  disabledDates?: { year: number; month: number; day: number }[];
  disabledWeekdays?: number[]; // 0 is Sunday, 6 is Saturday
}
```

Rule dates are plain `{ year, month, day }` fields, read in the picker's own calendar system.

The priority order, resolved by `isDateSelectable(date, rules)`:

1. `enabledDates`, when set, decides alone. This list wins over every other rule.
2. `disabledDates` blocks a listed date.
3. `disabledWeekdays` blocks a listed weekday.
4. `minDate` and `maxDate` block dates outside the bounds (bounds included).

## Min/max bounds

Limit a booking form to the next 30 days:

```tsx
import { DatePicker } from '@jalali-js/react';
import { addDays, createCalendar } from 'jalali-js';

const today = createCalendar({ system: 'jalali' }).today();

<DatePicker
  system="jalali"
  locale="fa"
  rules={{ minDate: today, maxDate: addDays(today, 30, 'jalali') }}
/>;
```

## Weekend blocking (Thursday and Friday)

The Iranian weekend is Thursday and Friday, weekday indices 4 and 5:

```tsx
<DatePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />
```

## A whitelist of open dates

When only a known set of dates is valid, list them in `enabledDates`. Every other date is
blocked, and the other rules are ignored:

```tsx
<DatePicker
  system="jalali"
  locale="fa"
  rules={{
    enabledDates: [
      { year: 1403, month: 5, day: 10 },
      { year: 1403, month: 5, day: 12 },
      { year: 1403, month: 5, day: 17 },
    ],
  }}
/>
```

## Vue and Web Components

The Vue components take the same `rules` prop:

```vue
<DatePicker system="jalali" locale="fa" :rules="{ disabledWeekdays: [4, 5] }" />
```

On the Web Components, `rules` is a property (an object), not an attribute:

```js
const picker = document.querySelector('jalali-date-picker');
picker.rules = { disabledWeekdays: [4, 5] };
```

## Range pickers

`RangePicker` uses the same `rules`. A candidate range that crosses a blocked day does not
complete: the second click starts a new range at the clicked day instead. That choice is
shared across React, Vue, and Web through `isRangeSelectable(start, end, rules)`.

```tsx
import { RangePicker } from '@jalali-js/ui-react';

<RangePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />;
```
