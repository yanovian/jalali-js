---
description: Calendar system, precision tiers, conversion engine, and locale packs.
---

# Core concepts

## Calendar system is a display setting

`jalali-js` is scoped to one calendar system: Jalali (Persian, Shamsi). Gregorian is the only
other one, and it isn't a peer feature: it's a structural requirement, the storage side of the
"display Jalali, store Gregorian" contract every component follows by default (see
[Display value vs. storage value](/guide/display-vs-storage)). `system: 'gregorian'` on
`createCalendar()` or any component is the identity conversion: it lets application code treat
"which calendar" as one setting, rather than special-casing Gregorian everywhere.

## Precision tiers, not optional fields

`jalali-js` uses the same three tiers as the TC39 `Temporal` proposal, applied to whichever
calendar system is active:

| Type                    | Fields                                         | Timezone-aware? |
| ----------------------- | ---------------------------------------------- | --------------- |
| `CalendarDate`          | `year`, `month`, `day`                         | No              |
| `CalendarDateTime`      | adds `hour`, `minute`, `second`, `millisecond` | No (wall-clock) |
| `ZonedCalendarDateTime` | adds an IANA `timeZone` name                   | Yes             |

Each tier is its own TypeScript type, not one type with optional fields. Code written against a
`CalendarDate` can never accidentally read an `hour` field that was never set. Pick a tier with
`createCalendar()`'s `precision` option; TypeScript overloads give each precision's `today()`
the matching return type:

```ts
createCalendar({ system: 'jalali' }); // precision: 'date' (default)
createCalendar({ system: 'jalali', precision: 'datetime' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'auto' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'Asia/Tehran' });
```

`timeZone: 'auto'` reads `Intl.DateTimeFormat().resolvedOptions().timeZone`. Under SSR (Next.js,
Nuxt), that resolves to `'UTC'` during the server render, since there is no `window` yet; the
`useResolvedTimeZone()` hook/composable re-resolves the real browser timezone once mounted,
without a hydration mismatch. See the [React](/guide/react) and [Vue](/guide/vue) guides.

## The conversion engine

Jalali-to-Gregorian conversion goes through a Julian Day Number (a continuous day count with no
calendar of its own) as the only path between the two systems, behind a small internal
`CalendarEngine` interface. The default engine uses a validated 33-year-cycle arithmetic
leap-year rule (Kazimierz M. Borkowski's), not an astronomical (true vernal equinox)
calculation: it matches the astronomical calendar for the full range any real application
needs, runs in constant time, and needs no runtime dependency. It's checked against Node's own
ICU (`Intl.DateTimeFormat` with the Persian calendar) with zero mismatches across a
multi-thousand-year range, and against an independent, published 121-year reference table.

## Date math and queries

The core ships date helpers next to the conversion engine. Each works per calendar system,
with zero runtime dependencies:

```ts
import {
  addDays,
  addMonths,
  addYears,
  diffDates,
  startOf,
  endOf,
  isBefore,
  isAfter,
  isSameDay,
  isBetween,
  isToday,
} from 'jalali-js';

addDays({ year: 1403, month: 12, day: 30 }, 1, 'jalali'); // 1404-01-01
addMonths({ year: 1403, month: 1, day: 31 }, 6, 'jalali'); // 1403-07-30 (day clamped)
addYears({ year: 1403, month: 12, day: 30 }, 1, 'jalali'); // 1404-12-29 (day clamped)

diffDates(a, b, 'month', 'jalali'); // signed whole months from b to a

startOf({ year: 1403, month: 5, day: 15 }, 'week', 'jalali'); // 1403-05-13, a Saturday
startOf({ year: 2024, month: 8, day: 5 }, 'week', 'gregorian', 1); // week start: 1 = Monday
endOf({ year: 1403, month: 5, day: 15 }, 'month', 'jalali'); // 1403-05-31

isBefore(a, b); // compareDates(a, b) < 0
isBetween(date, start, end); // bounds included
isToday(date, 'jalali');
```

Three rules to know:

- `addMonths()` and `addYears()` clamp the day to the target month's length. Esfand 30 of a
  leap year plus one year gives Esfand 29.
- `diffDates()` truncates toward zero: a unit counts only once it has fully passed. Units:
  `day`, `week`, `month`, `year`.
- `startOf()` and `endOf()` take the week start day as a parameter, since Jalali weeks start
  on Saturday and Gregorian weeks commonly start on Sunday or Monday. The default is the
  system's own convention (`WEEK_START_DAY`).

## Locale packs

`@jalali-js/i18n` exports `en`, `fa`, and `ps` (Pashto, with Afghanistan's own zodiac-based
names for the same Jalali months), each a `LocalePack`: month names (for both
calendar systems, so `en` includes English transliterations of the Jalali months and `fa`
includes Persian transliterations of the Gregorian ones), weekday names, digit style, and text
direction. `format()` takes a date plus a locale pack and renders it; the React, Vue, and Web
Components bindings' `locale` prop picks which pack a component uses.

`format()` also takes a `template` option (`'YYYY/MM/DD'`, `'D MMMM YYYY'`) for an exact
output shape, and `parseTemplate()` parses such a shape back into a `CalendarDate`. See
[Templates](/guide/i18n#templates) in the i18n guide.
