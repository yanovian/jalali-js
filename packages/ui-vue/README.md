# @jalali-js/ui-vue

[![npm version](https://img.shields.io/npm/v/@jalali-js/ui-vue.svg)](https://www.npmjs.com/package/@jalali-js/ui-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/vue)

Higher-level Vue UI on `@jalali-js/vue`: `RangePicker`, `InlineCalendar`, `EventCalendar`,
and `TimeRangePicker`, plus extra themes.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/vue/) · [Documentation](https://jalali-js.yanovian.com/guide/event-calendar)

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
npm install @jalali-js/ui-vue @jalali-js/vue
```

```ts
import '@jalali-js/vue/date-picker.css';
```

## Compatibility

| Item  | Support               |
| ----- | --------------------- |
| Vue   | 3.4+ (CI: Vue 3)      |
| Peers | `vue` `>=3.4`         |
| Node  | 22 and 24 (CI matrix) |

## Quick start

```vue
<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import { RangePicker } from '@jalali-js/ui-vue';
import { ref } from 'vue';

const range = ref();
</script>

<template>
  <RangePicker v-model="range" system="jalali" locale="fa" />
</template>
```

## Components

| Component         | Role                                          |
| ----------------- | --------------------------------------------- |
| `RangePicker`     | Start and end dates                           |
| `InlineCalendar`  | Always-visible month grid                     |
| `EventCalendar`   | Month / week / day views over your event list |
| `TimeRangePicker` | Start and end times                           |

You own the event list and editing UI for `EventCalendar`.

## Options

Key `RangePicker` props:

| Prop           | Type             | Default           | Notes                  |
| -------------- | ---------------- | ----------------- | ---------------------- |
| `system`       | `CalendarSystem` | `'jalali'`        | Display calendar       |
| `locale`       | `LocaleCode`     | `'en'`            | UI language            |
| `valueFormat`  | `ValueFormat`    | `'gregorian-iso'` | Storage shape for ends |
| `rules`        | `SelectionRules` | -                 | Day and range limits   |
| `showHolidays` | `boolean`        | `false`           | Mark holidays          |

Full tables: [Vue guide](https://jalali-js.yanovian.com/guide/vue#prop-tables) and
[Event calendar](https://jalali-js.yanovian.com/guide/event-calendar).

## Theming

```css
[data-jalali-datepicker-root] {
  --jalali-primary: #0f766e;
  --jalali-radius: 12px;
}
```

See [Theming](https://jalali-js.yanovian.com/guide/theming).

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/vue/)
- [Documentation](https://jalali-js.yanovian.com/guide/event-calendar)
- npm ecosystem: [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)
- [Vue guide](https://jalali-js.yanovian.com/guide/vue)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
