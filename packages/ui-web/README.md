# @jalali-js/ui-web

[![npm version](https://img.shields.io/npm/v/@jalali-js/ui-web.svg)](https://www.npmjs.com/package/@jalali-js/ui-web)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/web-components)

Higher-level Web Components on `@jalali-js/web`: range, inline, event, and time-range
pickers, plus extra themes.

**Start here:** [Live demo](https://jalali-js.yanovian.com/playground/vanilla/) · [Documentation](https://jalali-js.yanovian.com/guide/web-components)

**npm ecosystem:** [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)

## Contents

- [Install](#install)
- [Compatibility](#compatibility)
- [Quick start](#quick-start)
- [Elements](#elements)
- [Options](#options)
- [Theming](#theming)
- [Links](#links)
- [License](#license)

## Install

```sh
npm install @jalali-js/ui-web @jalali-js/web
```

```ts
import '@jalali-js/web';
import '@jalali-js/ui-web';
import '@jalali-js/web/date-picker.css';
```

## Compatibility

| Item     | Support                                        |
| -------- | ---------------------------------------------- |
| Runtime  | Modern browsers with Custom Elements           |
| Peers    | None (`@jalali-js/web` is a normal dependency) |
| Node     | 22 and 24 (CI matrix)                          |
| Verified | Chromium, Firefox, WebKit in e2e               |

## Quick start

```html
<script type="module">
  import '@jalali-js/web';
  import '@jalali-js/ui-web';
  import '@jalali-js/web/date-picker.css';
</script>

<jalali-range-picker system="jalali" locale="fa"></jalali-range-picker>
```

## Elements

| Element                      | Role                                 |
| ---------------------------- | ------------------------------------ |
| `<jalali-range-picker>`      | Start and end dates                  |
| `<jalali-inline-calendar>`   | Always-visible month grid            |
| `<jalali-event-calendar>`    | Month / week / day / timeline events |
| `<jalali-time-range-picker>` | Start and end times                  |

## Options

Key `<jalali-range-picker>` attributes:

| Attribute       | Values                 | Default         | Notes            |
| --------------- | ---------------------- | --------------- | ---------------- |
| `system`        | `jalali` / `gregorian` | `jalali`        | Display calendar |
| `locale`        | `en` / `fa` / `ps`     | `en`            | UI language      |
| `value-format`  | `gregorian-iso` / …    | `gregorian-iso` | Storage shape    |
| `show-holidays` | boolean attribute      | off             | Mark holidays    |

`EventCalendar`: `view` (`month` / `week` / `day` / `timeline`), `events` and
`timeline` (properties), `event-click` event. Timeline `layout` is `single`,
`alternating`, or `roadmap`.

Full tables: [Web Components guide](https://jalali-js.yanovian.com/guide/web-components#attribute-and-property-tables).

## Theming

```css
[data-jalali-datepicker-root] {
  --jalali-primary: #0f766e;
  --jalali-radius: 12px;
}
```

See [Theming](https://jalali-js.yanovian.com/guide/theming).

## Links

- [Live demo](https://jalali-js.yanovian.com/playground/vanilla/)
- [Documentation](https://jalali-js.yanovian.com/guide/web-components)
- npm ecosystem: [`jalali-js`](https://www.npmjs.com/package/jalali-js) · [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) · [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) · [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) · [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) · [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) · [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) · [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) · [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) · [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
