---
description: Install the core or a framework binding, then convert a date or render a picker.
---

# Getting started

## Install

```sh
npm install jalali-js
# React
npm install @jalali-js/react
# Vue
npm install @jalali-js/vue
# No framework: plain Web Components
npm install @jalali-js/web
```

`jalali-js` is the core package: pure TypeScript, no framework dependency, no runtime
dependency of its own. `@jalali-js/react`, `@jalali-js/vue`, and `@jalali-js/web` all depend on
it. `@jalali-js/web` needs no framework at all: it is plain Web Components, usable from plain
HTML/JS or dropped into any framework the same way any other HTML element is (see
[Vanilla / Web Components](/guide/web-components)). `@jalali-js/i18n` (locale data and
formatting), `@jalali-js/nlp` (natural language date parsing), and `@jalali-js/holidays`
(official Iran public holidays today) are separate packages you install only if you need them
directly. Every binding already depends on `@jalali-js/i18n` itself, and the pickers can mark
Iran holidays through `showHolidays` (see [Holidays](/guide/holidays)).

## Convert a date

```ts
import { createCalendar, toGregorian, fromGregorian } from 'jalali-js';

const jalali = createCalendar({ system: 'jalali' });
jalali.today(); // { year: 1403, month: 5, day: 15 }

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali');
// { year: 2024, month: 8, day: 5 }

fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali');
// { year: 1403, month: 5, day: 15 }
```

`system` is `'jalali'` or `'gregorian'`. Gregorian-to-Gregorian is the identity conversion, on
purpose: it lets application code treat "calendar system" as one setting instead of a special
case (see [Core concepts](/guide/core-concepts)).

## Render a picker (React)

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

function BirthDateField() {
  return (
    <DatePicker
      system="jalali"
      locale="fa"
      onChange={(value) => {
        // value is a Gregorian ISO string by default: '2024-08-05'.
        // See "Display value vs. storage value" for why, and how to opt out.
      }}
    />
  );
}
```

## Render a picker (Vue)

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

## Render a picker (no framework)

```html
<jalali-date-picker id="birth-date" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('birth-date').addEventListener('change', (event) => {
    // event.detail.value is a Gregorian ISO string by default: '2024-08-05'.
  });
</script>
```

Next: [Core concepts](/guide/core-concepts) covers the precision tiers and the
display/storage split these examples all lean on.
