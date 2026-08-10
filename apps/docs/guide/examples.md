---
description: Copy-paste snippets for conversion, pickers, ranges, NLP, and theming.
---

# Examples

Short, self-contained snippets for common tasks. Each one is copy-paste ready: it shows every
import it needs. For the concepts behind them, see [Getting started](/guide/getting-started),
[Core concepts](/guide/core-concepts), and [Configuration and theming](/guide/theming).

## Convert between calendars

```ts
import { toGregorian, fromGregorian } from 'jalali-js';

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali');
// { year: 2024, month: 8, day: 5 }

fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali');
// { year: 1403, month: 5, day: 15 }
```

## Format a date for display

```ts
import { format, fa } from '@jalali-js/i18n';

const date = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

format(date, fa); // '۱۵ مرداد ۱۴۰۳'
format(date, fa, { weekday: true }); // 'دوشنبه، ۱۵ مرداد ۱۴۰۳'
format(date, fa, { numerals: 'latin' }); // '15 مرداد 1403'
```

## Parse a natural language phrase

```ts
import { parse } from '@jalali-js/nlp';

parse('tomorrow', 'en');
parse('فردا', 'fa');
parse('نن', 'ps'); // Pashto for 'today'
parse('next Farvardin', 'en');
```

## React: a date field that stores Gregorian, displays Jalali

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

function BirthDateField() {
  return (
    <DatePicker
      system="jalali"
      locale="fa"
      onChange={(value) => {
        // value is a Gregorian ISO string, e.g. '2024-08-05'. Store this.
      }}
    />
  );
}
```

## Vue: the same field, with `v-model`

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

## Vanilla / Web Components: the same field, no framework

```html
<jalali-date-picker id="birth-date" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('birth-date').addEventListener('change', (event) => {
    // event.detail.value is a Gregorian ISO string, e.g. '2024-08-05'. Store this.
  });
</script>
```

## React: a date range field

```tsx
import '@jalali-js/react/date-picker.css';
import { RangePicker } from '@jalali-js/ui-react';

<RangePicker system="jalali" locale="en" onChange={(value) => console.log(value)} />;
```

## React: an always-visible calendar, no popover

```tsx
import '@jalali-js/react/date-picker.css';
import { InlineCalendar } from '@jalali-js/ui-react';
import { useState } from 'react';
import type { CalendarDate } from 'jalali-js';

function EventDatePicker() {
  const [selected, setSelected] = useState<CalendarDate | null>(null);
  return <InlineCalendar system="jalali" locale="en" value={selected} onSelect={setSelected} />;
}
```

## A custom theme, without a theme file

`--jalali-*` custom properties inherit, so a naive override on a wrapping element can lose to a
value set directly on the picker's own root, for example if `dark.css` is imported on the same
page (see [Configuration and theming](/guide/theming)). Scope the override under a parent class
instead, on a selector that matches the root element itself:

```css
/* my-theme.css */
.my-theme [data-jalali-datepicker-root] {
  --jalali-primary: #c026d3;
  --jalali-primary-fg: #ffffff;
  --jalali-bg: #fdf4ff;
  --jalali-fg: #581c87;
  --jalali-radius: 20px;
}
```

```tsx
import '@jalali-js/react/date-picker.css';
import './my-theme.css';
import { DatePicker } from '@jalali-js/react';

<div className="my-theme">
  <DatePicker system="jalali" locale="en" />
</div>;
```
