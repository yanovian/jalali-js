# jalali-js

[![npm version](https://img.shields.io/npm/v/jalali-js.svg)](https://www.npmjs.com/package/jalali-js)
[![Bundle size](https://deno.bundlejs.com/badge?q=jalali-js)](https://bundlejs.com/?q=jalali-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/)

Jalali (Persian, Shamsi) to Gregorian conversion core. TypeScript-native, zero runtime
dependencies, framework-agnostic.

## Contents

- [Install](#install)
- [Compatibility](#compatibility)
- [Quick start](#quick-start)
- [API](#api)
- [Options](#options)
- [Theming](#theming)
- [Links](#links)
- [License](#license)

## Install

```sh
npm install jalali-js
```

## Compatibility

| Item         | Support                                       |
| ------------ | --------------------------------------------- |
| Runtime      | Modern Node and browsers                      |
| Node         | 22 and 24 (CI matrix)                         |
| TypeScript   | First-class types, no `@types` package        |
| Dependencies | None at runtime                               |
| Frameworks   | None required. Bindings are separate packages |

## Quick start

```ts
import { createCalendar, toGregorian, fromGregorian } from 'jalali-js';

const jalali = createCalendar({ system: 'jalali' });
jalali.today(); // { year, month, day }

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali');
// { year: 2024, month: 8, day: 5 }

fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali');
// { year: 1403, month: 5, day: 15 }
```

## API

### Conversion and factory

- `createCalendar({ system, precision?, timeZone?, valueFormat?, engine? })`
- `toGregorian(date, system, options?)` / `fromGregorian(date, system, options?)`
- `engine: 'astronomical'` opts into Tehran-meridian Nowruz (Meeus). Arithmetic is the default.

### Date math and queries

`addDays`, `addMonths`, `addYears`, `diffDates`, `startOf`, `endOf`, `isBefore`,
`isAfter`, `isSameDay`, `isBetween`, `isToday`, `dayOfWeek`.

### Grid, selection, storage, time

- `buildCalendarGrid`, `nextMonth`, `previousMonth`
- `SelectionRules`, `isDateSelectable`, `isRangeSelectable`
- `toStorageValue` and `valueFormat` (`gregorian-iso` default, plus `date`, `epoch`, Jalali shapes)
- Time helpers: `listHours`, `listMinutes`, `withTime`
- Event layout helpers: `layoutMonthEvents`, `layoutWeekEvents`, `layoutDayTimedEvents`

Full signatures: [API reference](https://jalali-js.yanovian.com/api/jalali-js/).

## Options

| Option        | Values (main)                               | Default           | Notes                                       |
| ------------- | ------------------------------------------- | ----------------- | ------------------------------------------- |
| `system`      | `'jalali' \| 'gregorian'`                   | required          | Display / conversion calendar               |
| `precision`   | `'date' \| 'datetime' \| 'zoned-datetime'`  | `'date'`          | Matching TC39 Temporal-style tiers          |
| `valueFormat` | `'gregorian-iso' \| 'date' \| 'epoch' \| …` | `'gregorian-iso'` | Shape of stored values from pickers         |
| `engine`      | `'arithmetic' \| 'astronomical'`            | `'arithmetic'`    | Leap and Nowruz rule                        |
| `timeZone`    | IANA id or `'auto'`                         | -                 | For `zoned-datetime` (`'auto'` is SSR-safe) |

Display stays Jalali when you ask for it. Storage stays Gregorian by default, like
`<input type="date">`.

## Theming

This package has no UI. Theme pickers through CSS variables in
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react),
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue), or
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web).

## Links

- [Docs](https://jalali-js.yanovian.com/guide/getting-started)
- [Playground](https://jalali-js.yanovian.com/playground/react/)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)
- Bindings: [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) ·
  [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) ·
  [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web)
- Optional: [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) ·
  [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) ·
  [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays)

## License

MIT
