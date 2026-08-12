# @jalali-js/react

[![npm version](https://img.shields.io/npm/v/@jalali-js/react.svg)](https://www.npmjs.com/package/@jalali-js/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/react)

React bindings for jalali-js: `useCalendar`, headless `Calendar`, styled `DatePicker` and
`TimePicker`, and SSR-safe timezone resolution.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/react/) · [Documentation](https://jalali-js.yanovian.com/guide/react)

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
npm install @jalali-js/react
```

Import the default stylesheet once for the styled pickers:

```ts
import '@jalali-js/react/date-picker.css';
```

## Compatibility

| Item    | Support                                      |
| ------- | -------------------------------------------- |
| React   | 18 and 19 (CI matrix)                        |
| Next.js | 15 and 16 (CI matrix). Use client components |
| Peers   | `react` and `react-dom` `>=18`               |
| Node    | 22 and 24 (CI matrix)                        |

## Quick start

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  onChange={(value, date) => {
    // value: Gregorian ISO by default; date: CalendarDate
  }}
/>;
```

## Components

### `DatePicker`

Styled input plus popover grid (default), or `variant="dropdown"` year/month/day selects.
Set `precision="datetime"` for a time panel. Emits a storage value through `onChange`.

### `Calendar`

Headless month grid (`data-jalali-*` attributes, no required CSS). Use it for an always-visible
calendar or your own chrome around the grid.

### `TimePicker`

Hour and minute lists (`minuteStep`, `disabledHours`).

### `useCalendar` / `useResolvedTimeZone`

- `useCalendar({ system, locale, initialDate? })` for format helpers and today.
- `useResolvedTimeZone()` with `precision: 'zoned-datetime'` and `timeZone: 'auto'` under
  Next.js SSR (server and first client render stay `UTC`, then the real zone mounts cleanly).

Range, inline, event, and time-range UIs live in
[`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react).

## Options

Key `DatePicker` props:

| Prop           | Type                      | Default           | Notes                         |
| -------------- | ------------------------- | ----------------- | ----------------------------- |
| `system`       | `'jalali' \| 'gregorian'` | `'jalali'`        | Display calendar              |
| `locale`       | `'en' \| 'fa' \| 'ps'`    | `'en'`            | UI language                   |
| `valueFormat`  | `ValueFormat`             | `'gregorian-iso'` | Stored `onChange` value shape |
| `variant`      | `'grid' \| 'dropdown'`    | `'grid'`          | Popover grid or Y/M/D selects |
| `precision`    | `'date' \| 'datetime'`    | `'date'`          | Add a time panel              |
| `rules`        | `SelectionRules`          | -                 | Min/max and blocked days      |
| `showHolidays` | `boolean`                 | `false`           | Needs `@jalali-js/holidays`   |

Full tables: [React guide](https://jalali-js.yanovian.com/guide/react#prop-tables).

## Theming

Override CSS variables on a parent (or the root):

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

- [Live demo](https://jalali-js.yanovian.com/playground/react/)
- [Documentation](https://jalali-js.yanovian.com/guide/react)
- [Recipes](https://jalali-js.yanovian.com/guide/recipes)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
