# @jalali-js/nlp

[![npm version](https://img.shields.io/npm/v/@jalali-js/nlp.svg)](https://www.npmjs.com/package/@jalali-js/nlp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/nlp)

Natural language date parsing for jalali-js in English, Farsi, and Pashto.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/react/) · [Documentation](https://jalali-js.yanovian.com/guide/nlp)

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
npm install @jalali-js/nlp
```

## Compatibility

| Item         | Support                        |
| ------------ | ------------------------------ |
| Locales      | `en`, `fa`, `ps`               |
| Dependencies | `jalali-js`, `@jalali-js/i18n` |
| Node         | 22 and 24 (CI matrix)          |

## Quick start

```ts
import { parse } from '@jalali-js/nlp';

parse('tomorrow', 'en'); // CalendarDate | null
parse('فردا', 'fa');
parse('نن', 'ps');
parse('next Farvardin', 'en');
parse('۱۵ مرداد ۱۴۰۳', 'fa');
```

Returns a `CalendarDate`, or `null` when the input is unclear.

## API

| Export        | Role                                 |
| ------------- | ------------------------------------ |
| `parse`       | Parse a phrase into a `CalendarDate` |
| `getWordList` | Locale word list used by the parser  |

Relative words (`today`, `tomorrow`, `next week`), month names, and numeric dates are covered
per locale. Farsi uses Persian script. English accepts transliterated Jalali month names
(`Mehr`, `Aban`).

## Options

```ts
parse(input, locale, { system?: 'jalali' | 'gregorian' });
```

| Option   | Values                    | Default    | Notes                |
| -------- | ------------------------- | ---------- | -------------------- |
| `locale` | `'en' \| 'fa' \| 'ps'`    | required   | Word list and digits |
| `system` | `'jalali' \| 'gregorian'` | `'jalali'` | Calendar for result  |

Guide: [NLP](https://jalali-js.yanovian.com/guide/nlp).

## Theming

This package has no UI.

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/react/)
- [Documentation](https://jalali-js.yanovian.com/guide/nlp)
- npm ecosystem: [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)
- [API reference](https://jalali-js.yanovian.com/api/@jalali-js/nlp/)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)
- [`jalali-js`](https://www.npmjs.com/package/jalali-js) ·
  [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n)

## License

MIT
