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

## Locale packs

`@jalali-js/i18n` exports `en` and `fa`, each a `LocalePack`: month names (for both calendar
systems, so `en` includes English transliterations of the Jalali months and `fa` includes
Persian transliterations of the Gregorian ones), weekday names, digit style, and text direction.
`format()` takes a date plus a locale pack and renders it; the React and Vue bindings' `locale`
prop picks which pack a component uses.
