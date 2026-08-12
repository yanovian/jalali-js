# @jalali-js/holidays

[![npm version](https://img.shields.io/npm/v/@jalali-js/holidays.svg)](https://www.npmjs.com/package/@jalali-js/holidays)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/holidays)

Offline Iran (`IR`) public holiday data for jalali-js: fixed solar rules, lunar year tables,
and picker helpers. Zero runtime dependencies. `AF` and `TJ` are reserved region codes.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/react/) · [Documentation](https://jalali-js.yanovian.com/guide/holidays)

**npm ecosystem:** [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)

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
npm install @jalali-js/holidays
```

## Compatibility

| Item         | Support                              |
| ------------ | ------------------------------------ |
| Region today | `IR` (Iran)                          |
| Reserved     | `AF`, `TJ`                           |
| Dependencies | None at runtime                      |
| Lunar table  | Shipped years (see pack `yearRange`) |
| Node         | 22 and 24 (CI matrix)                |

## Quick start

```ts
import { isHoliday, holidaysOn, holidayName } from '@jalali-js/holidays';

const day = { year: 1403, month: 1, day: 1 };
isHoliday(day); // true on Nowruz
holidaysOn(day); // HolidayOccurrence[]
holidayName('nowruz', 'fa'); // 'نوروز'
```

In pickers, pass `showHolidays`, `blockHolidays`, and `holidayRegion` (default `'IR'`).
With `showHolidays`, hover or focus shows a day tip (`data-jalali-calendar-tip`). Blocked
holidays append `LocalePack.ui.closedDay` from `@jalali-js/i18n`.

## API

| Export                     | Role                                      |
| -------------------------- | ----------------------------------------- |
| `isHoliday` / `holidaysOn` | Query one day                             |
| `holidaysInMonth` / `Year` | List in a span                            |
| `holidayDatesAround`       | Nearby holidays                           |
| `holidayName` / `Names`    | Localized labels                          |
| `holidayDayTip` / `Chrome` | Tip text, aria label, blocked-day attrs   |
| `resolveCalendarHolidays`  | Wire holidays into a calendar grid        |
| `withHolidaysBlocked`      | Merge holiday blocks into selection rules |
| `IRAN_*_HOLIDAY_IDS`       | Fixed and lunar id lists                  |

Update lunar data: `make update-holidays YEARS=next`.

## Options

| Option / prop   | Values                 | Default | Notes                   |
| --------------- | ---------------------- | ------- | ----------------------- |
| `region`        | `'IR' \| 'AF' \| 'TJ'` | `'IR'`  | Query option on helpers |
| `showHolidays`  | `boolean`              | `false` | Picker: mark days       |
| `blockHolidays` | `boolean`              | `false` | Picker: block selection |
| `holidayRegion` | `'IR' \| 'AF' \| 'TJ'` | `'IR'`  | Picker: which pack      |

Guide: [Holidays](https://jalali-js.yanovian.com/guide/holidays).

## Theming

This package has no UI. Holiday marks use picker theme tokens such as `--jalali-event-bg` when
a binding paints them.

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/react/)
- [Documentation](https://jalali-js.yanovian.com/guide/holidays)
- [API reference](https://jalali-js.yanovian.com/api/@jalali-js/holidays/)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
