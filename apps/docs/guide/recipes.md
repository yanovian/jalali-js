---
description: Short copy-paste answers for common DatePicker tasks.
---

# Recipes

One short example per job. Examples use React. Vue and Web notes sit under each recipe when
the binding differs. See also [Examples](/guide/examples).

## Default to today

Today is the default seed. Pass nothing, or pass today explicitly.

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker system="jalali" locale="fa" onChange={(value) => console.log(value)} />;
```

Empty start: `defaultDate={null}` (Vue `:default-date="null"`, Web `.defaultDate = null`).

## Min and max bounds

```tsx
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="en"
  rules={{
    minDate: { year: 1403, month: 1, day: 1 },
    maxDate: { year: 1403, month: 12, day: 29 },
  }}
/>;
```

## Block a weekend

Jalali weekdays use Sunday = 0 … Saturday = 6. Thursday/Friday weekend:

```tsx
<DatePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />
```

## Epoch for an API

```tsx
<DatePicker
  system="jalali"
  locale="en"
  valueFormat="epoch"
  onChange={(value) => {
    // value is a Unix epoch number (ms)
    fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ at: value }) });
  }}
/>
```

## Form submission

```tsx
function BookingForm() {
  const [stored, setStored] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (stored) submitBooking(stored);
      }}
    >
      <DatePicker system="jalali" locale="fa" onChange={(value) => setStored(value)} />
      <button type="submit" disabled={!stored}>
        Book
      </button>
    </form>
  );
}
```

Vue: bind `v-model` to the storage value and submit that ref. Web: read
`event.detail.value` from `change`, or read `.value` on the element.

## Programmatic set, read, and clear

### React

`DatePicker` is uncontrolled for selection. Seed with `defaultDate`. Keep your own state from
`onChange` to read. Remount with a new `key` to clear or reset.

```tsx
function ControlledShell() {
  const [seed, setSeed] = useState<CalendarDate | null>(null);
  const [stored, setStored] = useState<StorageValue | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() =>
          setSeed({ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 })
        }
      >
        Set 15 Mordad
      </button>
      <button type="button" onClick={() => setSeed(null)}>
        Clear
      </button>
      <DatePicker
        key={seed === null ? 'empty' : `${seed.year}-${seed.month}-${seed.day}`}
        system="jalali"
        locale="en"
        defaultDate={seed}
        onChange={(value) => setStored(value)}
      />
      <pre>{JSON.stringify(stored)}</pre>
    </>
  );
}
```

`Calendar` / `InlineCalendar` are controlled: pass `value` and `onSelect`.

### Vue

`DatePicker` writes storage through `v-model`. Seed with `defaultDate`. Remount with `:key` to
clear. `Calendar` uses `:value` and `@select`.

```vue
<script setup lang="ts">
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
const seedKey = ref(0);
function clear() {
  stored.value = undefined;
  seedKey.value += 1;
}
</script>

<template>
  <DatePicker :key="seedKey" v-model="stored" system="jalali" locale="fa" :default-date="null" />
  <button type="button" @click="clear">Clear</button>
</template>
```

### Web Components

Set `.value` to read or write the selection without emitting. Set `.defaultDate` before connect
to seed. Listen for `change` for user picks.

```ts
const el = document.querySelector('jalali-date-picker')!;
el.defaultDate = null; // empty until the user picks
el.addEventListener('change', (event) => {
  console.log(event.detail.value);
});
// later
el.value = null; // clear, no change event
console.log(el.value);
```

## SSR (Next.js / Nuxt)

Import CSS in a client boundary. Prefer `valueFormat` strings over `Date` objects for props that
cross the server.

```tsx
'use client';
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

export function ClientPicker() {
  return <DatePicker system="jalali" locale="fa" />;
}
```

For `'zoned-datetime'` with `timeZone: 'auto'`, use `useResolvedTimeZone('auto')` so SSR and the
first client paint stay on `'UTC'`. See the [React](/guide/react) and [Vue](/guide/vue) guides.
