# @jalali-js/i18n

[![npm version](https://img.shields.io/npm/v/@jalali-js/i18n.svg)](https://www.npmjs.com/package/@jalali-js/i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/i18n)

Locale packs and display formatting for jalali-js: English, Farsi, and Pashto, relative time,
format templates, strict parsing, numerals, and RTL.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/react/) · [Documentation](https://jalali-js.yanovian.com/guide/i18n)

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
npm install @jalali-js/i18n
```

## Compatibility

| Item         | Support                  |
| ------------ | ------------------------ |
| Locales      | `en`, `fa`, `ps`         |
| Dependencies | `jalali-js` only         |
| Runtime      | Modern Node and browsers |
| Node         | 22 and 24 (CI matrix)    |

React, Vue, and Web bindings already depend on this package through a `locale` prop. Use it
directly when you format dates outside a component.

## Quick start

```ts
import { format, formatRelative, parseTemplate, en, fa, ps } from '@jalali-js/i18n';

const date = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

format(date, en); // '15 Mordad 1403'
format(date, fa); // '۱۵ مرداد ۱۴۰۳'
format(date, ps); // Pashto with Afghanistan month names

formatRelative({ ...date, day: 12 }, date, fa); // '۳ روز پیش'
format(date, en, { template: 'YYYY/MM/DD' }); // '1403/05/15'
parseTemplate('1403/05/15', 'YYYY/MM/DD', en); // date, or null
```

## API

| Export             | Role                                                     |
| ------------------ | -------------------------------------------------------- |
| `en` / `fa` / `ps` | Locale packs (months, weekdays, digits, `ui`, direction) |
| `format`           | Display string from a calendar date                      |
| `formatRelative`   | "3 days ago", "۳ روز پیش", "in 2 months"                 |
| `parseTemplate`    | Strict parse with `YYYY` / `MM` / `DD` tokens            |
| `formatNumber`     | Digits in the locale numeral style                       |
| `localePackFor`    | Resolve a pack from a locale code                        |

Each pack's `ui` object holds control `aria-label`s, including `closedDay` for
blocked holiday tips.

## Options

Key `format` options:

| Option     | Values / tokens                          | Default | Notes           |
| ---------- | ---------------------------------------- | ------- | --------------- |
| `style`    | `'long' \| 'short'`                      | -       | Preset wording  |
| `weekday`  | `boolean`                                | -       | Include weekday |
| `numerals` | `'latn' \| 'arabext'` (and pack default) | pack    | Digit style     |
| `template` | `YYYY` `MM` `M` `DD` `D` `MMMM` …        | -       | Custom pattern  |

Guide: [i18n](https://jalali-js.yanovian.com/guide/i18n).

## Theming

This package has no UI. Theme pickers in the binding packages with `--jalali-*` CSS variables.

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/react/)
- [Documentation](https://jalali-js.yanovian.com/guide/i18n)
- npm ecosystem: [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)
- [API reference](https://jalali-js.yanovian.com/api/@jalali-js/i18n/)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
