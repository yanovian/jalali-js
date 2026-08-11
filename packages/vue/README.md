# @jalali-js/vue

[![npm version](https://img.shields.io/npm/v/@jalali-js/vue.svg)](https://www.npmjs.com/package/@jalali-js/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/vue)

Vue bindings for jalali-js: `useCalendar`, headless `Calendar`, styled `DatePicker` and
`TimePicker`, and SSR-safe timezone resolution.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/vue/) · [Documentation](https://jalali-js.yanovian.com/guide/vue)

**npm ecosystem:** [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)

## Contents

- [Install](#install)
- [Compatibility](#compatibility)
- [Quick start](#quick-start)
- [Components](#components)
- [Options](#options)
- [Theming](#theming)
- [Links](#links)
- [License](#license)

## Install

```sh
npm install @jalali-js/vue
```

```ts
import '@jalali-js/vue/date-picker.css';
```

## Compatibility

| Item  | Support                 |
| ----- | ----------------------- |
| Vue   | 3.4+ (CI matrix: Vue 3) |
| Nuxt  | 3 and 4 (CI matrix)     |
| Peers | `vue` `>=3.4`           |
| Node  | 22 and 24 (CI matrix)   |

## Quick start

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

## Components

### `DatePicker`

Styled input plus popover grid (default), or `variant="dropdown"`. Use
`precision="datetime"` for a time panel. `v-model` holds the storage value.

### `Calendar`

Headless month grid (`data-jalali-*` attributes, no required CSS).

### `TimePicker`

Hour and minute lists (`minuteStep`, `disabledHours`).

### `useCalendar` / `useResolvedTimeZone`

Composables matching the React hooks. Use `useResolvedTimeZone()` with
`zoned-datetime` and `timeZone: 'auto'` under Nuxt SSR.

Range, inline, event, and time-range UIs live in
[`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue).

## Options

Key `DatePicker` props:

| Prop           | Type                      | Default           | Notes                         |
| -------------- | ------------------------- | ----------------- | ----------------------------- |
| `system`       | `'jalali' \| 'gregorian'` | `'jalali'`        | Display calendar              |
| `locale`       | `'en' \| 'fa' \| 'ps'`    | `'en'`            | UI language                   |
| `valueFormat`  | `ValueFormat`             | `'gregorian-iso'` | Stored `v-model` shape        |
| `variant`      | `'grid' \| 'dropdown'`    | `'grid'`          | Popover grid or Y/M/D selects |
| `precision`    | `'date' \| 'datetime'`    | `'date'`          | Add a time panel              |
| `rules`        | `SelectionRules`          | -                 | Min/max and blocked days      |
| `showHolidays` | `boolean`                 | `false`           | Needs `@jalali-js/holidays`   |

Full tables: [Vue guide](https://jalali-js.yanovian.com/guide/vue#prop-tables).

## Theming

```css
[data-jalali-datepicker-root] {
  --jalali-primary: #2563eb;
  --jalali-radius: 8px;
  --jalali-bg: #ffffff;
  --jalali-fg: #1a1a1a;
}
```

See [Theming](https://jalali-js.yanovian.com/guide/theming).

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/vue/)
- [Documentation](https://jalali-js.yanovian.com/guide/vue)
- npm ecosystem: [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)
- [Recipes](https://jalali-js.yanovian.com/guide/recipes)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
