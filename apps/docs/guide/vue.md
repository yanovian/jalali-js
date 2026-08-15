---
description: Vue bindings, DatePicker, headless Calendar, and Nuxt SSR notes.
---

# Vue

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/vue
```

== pnpm

```sh
pnpm add @jalali-js/vue
```

== yarn

```sh
yarn add @jalali-js/vue
```

:::

## `useCalendar()`

The low-level composable: a `date` **ref** (not a `[date, setDate]` pair like the React hook;
idiomatic Vue reads and writes the ref directly), plus `format()` bound to the composable's
locale, and the calendar system's `isLeapYear()`/`daysInMonth()`/`today()`.

```vue
<script setup lang="ts">
import { useCalendar } from '@jalali-js/vue';

const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
</script>

<template>
  <p>امروز: {{ jalali.format(jalali.today(), { style: 'long', weekday: true }) }}</p>
</template>
```

Full signature: [API reference](/api/@jalali-js/vue/).

## `Calendar`: the headless primitive

A month grid with `data-jalali-calendar-*` attributes and no required CSS.

```vue
<script setup lang="ts">
import { Calendar } from '@jalali-js/vue';
</script>

<template>
  <Calendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
</template>
```

A `day` scoped slot replaces the cell markup outright, alongside the same
`data-jalali-calendar-*` attributes, for a consumer who only wants to restyle rather than
replace.

## `DatePicker`: a working, default-styled picker

`v-model` carries the **storage** value (shaped by `valueFormat`), not the raw `CalendarDate`,
so it's an effective write channel: picking a date updates the bound value directly. It doesn't
read a value back in (inverting every `valueFormat` back to a `CalendarDate` is out of scope);
use `defaultDate` to seed the initial selection instead.

```vue
<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
</script>

<template>
  <DatePicker v-model="stored" system="jalali" locale="fa" />
</template>
```

`variant="dropdown"` swaps the calendar-grid popup for three plain year/month/day `<select>`s:

```vue
<DatePicker system="jalali" locale="en" variant="dropdown" />
```

In the grid popup (and in `Calendar` directly), a person can click the month or year in the
header to jump straight to a month grid or a year grid, instead of paging one month at a time.
This is on by default; pass `:quick-nav="false"` to turn it off. Pass `:default-date="null"` for
no initial selection, so the picker opens empty and shows its placeholder until someone picks a
date.

## `useResolvedTimeZone()`

Pairs with a `'zoned-datetime'` calendar's `timeZone: 'auto'` under SSR. Unlike Next.js, Nuxt has
no separate "client component" concept to opt into: every component is server-rendered then
hydrated by default, so no extra wrapping is needed. The composable's internal `onMounted`
re-resolves the real browser timezone once mounted, with no hydration warning.

```vue
<script setup lang="ts">
import { useResolvedTimeZone } from '@jalali-js/vue';

const timeZone = useResolvedTimeZone('auto'); // 'UTC' during SSR, the real zone after mount
</script>
```

## Range picker, event calendar, and inline calendar

`@jalali-js/ui-vue` adds `RangePicker`, `EventCalendar`, and `InlineCalendar` on the same
primitives; see [Configuration and theming](/guide/theming#range-picker-event-calendar-and-inline-calendar)
and [Event calendar](/guide/event-calendar).

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/ui-vue
```

== pnpm

```sh
pnpm add @jalali-js/ui-vue
```

== yarn

```sh
yarn add @jalali-js/ui-vue
```

:::

```vue
<script setup lang="ts">
import { EventCalendar, InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import { ref } from 'vue';

const storedRange = ref<RangeStorageValue>();
</script>

<template>
  <InlineCalendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
  <RangePicker v-model="storedRange" system="jalali" locale="en" />
  <EventCalendar system="jalali" locale="en" :events="events" @event-click="onEvent" />
</template>
```

## Prop tables

`.vue` SFCs are not in the generated API. These tables match `defineProps` in source.

Binding note: `DatePicker` and `RangePicker` use `v-model` for the storage value (write
channel). Seed with `defaultDate` / `defaultRange`. `Calendar` uses `:value` and `@select`.
`TimePicker` / `TimeRangePicker` emit `change`. `EventCalendar` emits `eventClick` and
`dayClick`.

### `DatePicker`

| Prop            | Type                                       | Default           | Meaning                            |
| --------------- | ------------------------------------------ | ----------------- | ---------------------------------- |
| `system`        | `'jalali' \| 'gregorian'`                  | `'jalali'`        | Display calendar                   |
| `locale`        | `'en' \| 'fa' \| 'ps'`                     | `'en'`            | UI language                        |
| `defaultDate`   | `CalendarDate \| CalendarDateTime \| null` | today             | Initial selection. `null` is empty |
| `precision`     | `'date' \| 'datetime'`                     | `'date'`          | Day only, or day plus time         |
| `minuteStep`    | `number`                                   | `1`               | Minute step when datetime          |
| `disabledHours` | `number[]`                                 | -                 | Hidden hours 0-23                  |
| `quickNav`      | `boolean`                                  | `true`            | Month and year jump grids          |
| `valueFormat`   | `ValueFormat`                              | `'gregorian-iso'` | Shape of `v-model`                 |
| `displayFormat` | `FormatOptions`                            | -                 | Input text format                  |
| `variant`       | `'grid' \| 'dropdown'`                     | `'grid'`          | Grid popover or Y/M/D selects      |
| `rules`         | `SelectionRules`                           | -                 | Min/max and blocked days           |
| `showHolidays`  | `boolean`                                  | `false`           | Mark holidays (Jalali)             |
| `blockHolidays` | `boolean`                                  | `false`           | Block holidays (Jalali)            |
| `holidayRegion` | `'IR' \| 'AF' \| 'TJ'`                     | `'IR'`            | Holiday pack                       |
| `placeholder`   | `string`                                   | locale pack       | Empty input text                   |

### `Calendar` / `InlineCalendar`

| Prop                    | Type                   | Default        | Meaning                   |
| ----------------------- | ---------------------- | -------------- | ------------------------- |
| `system`                | `CalendarSystem`       | `'jalali'`     | Display calendar          |
| `locale`                | `LocaleCode`           | `'en'`         | UI language               |
| `value`                 | `CalendarDate \| null` | `null`         | Selected day              |
| `initialDisplayedMonth` | `{ year, month }`      | value or today | Opening month             |
| `quickNav`              | `boolean`              | `true`         | Month and year jump grids |
| `rules`                 | `SelectionRules`       | -              | Min/max and blocked days  |
| `showHolidays`          | `boolean`              | `false`        | Mark holidays             |
| `blockHolidays`         | `boolean`              | `false`        | Block holidays            |
| `holidayRegion`         | `HolidayRegion`        | `'IR'`         | Holiday pack              |

Emit: `select` with the picked `CalendarDate`.

### `TimePicker`

| Prop            | Type         | Default                  | Meaning             |
| --------------- | ------------ | ------------------------ | ------------------- |
| `value`         | `TimeOfDay`  | -                        | Controlled time     |
| `defaultValue`  | `TimeOfDay`  | `{ hour: 0, minute: 0 }` | Uncontrolled seed   |
| `minuteStep`    | `number`     | `1`                      | Minute options step |
| `disabledHours` | `number[]`   | -                        | Hidden hours        |
| `locale`        | `LocaleCode` | `'en'`                   | Digits language     |

Emit: `change` with `TimeOfDay`.

### `RangePicker` (`@jalali-js/ui-vue`)

| Prop            | Type             | Default           | Meaning              |
| --------------- | ---------------- | ----------------- | -------------------- |
| `system`        | `CalendarSystem` | `'jalali'`        | Display calendar     |
| `locale`        | `LocaleCode`     | `'en'`            | UI language          |
| `defaultRange`  | `{ start, end }` | -                 | Initial range        |
| `valueFormat`   | `ValueFormat`    | `'gregorian-iso'` | Shape of `v-model`   |
| `displayFormat` | `FormatOptions`  | -                 | Input text format    |
| `rules`         | `SelectionRules` | -                 | Day and range limits |
| `showHolidays`  | `boolean`        | `false`           | Mark holidays        |
| `blockHolidays` | `boolean`        | `false`           | Block holidays       |
| `holidayRegion` | `HolidayRegion`  | `'IR'`            | Holiday pack         |
| `placeholder`   | `string`         | -                 | Empty input text     |

### `TimeRangePicker` (`@jalali-js/ui-vue`)

| Prop            | Type             | Default            | Meaning                   |
| --------------- | ---------------- | ------------------ | ------------------------- |
| `locale`        | `LocaleCode`     | `'en'`             | Digits language           |
| `defaultRange`  | `{ start, end }` | `09:00` to `17:00` | Initial range             |
| `minuteStep`    | `number`         | `1`                | Minute step for both ends |
| `disabledHours` | `number[]`       | -                  | Hidden hours              |

Emit: `change` with the time range.

### `EventCalendar` (`@jalali-js/ui-vue`)

See [Event calendar](/guide/event-calendar). Props match React except callbacks are emits
`eventClick` and `dayClick`.
