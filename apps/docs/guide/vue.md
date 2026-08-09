# Vue

```sh
npm install @jalali-js/vue
```

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

## Range picker and inline calendar

`@jalali-js/ui-vue` adds `RangePicker` and `InlineCalendar` on the same primitives; see
[Configuration and theming](/guide/theming#range-picker-and-inline-calendar).

```sh
npm install @jalali-js/ui-vue
```

```vue
<script setup lang="ts">
import { InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import { ref } from 'vue';

const storedRange = ref<RangeStorageValue>();
</script>

<template>
  <InlineCalendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
  <RangePicker v-model="storedRange" system="jalali" locale="en" />
</template>
```

## Component API reference

`@jalali-js/vue`'s and `@jalali-js/ui-vue`'s `.vue` single-file components aren't in the
[generated API reference](/api/@jalali-js/vue/) (only their plain-TypeScript composables are):
TypeDoc's TypeScript-based parser has no `.vue` SFC support, the same reason the wider Vue
ecosystem (VueUse, Vuetify) hand-documents component APIs rather than auto-generating them. The
prop tables on this page are that hand-written documentation, kept in sync with each component's
own `defineProps<...>()` by hand.
