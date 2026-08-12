# @jalali-js/web

[![npm version](https://img.shields.io/npm/v/@jalali-js/web.svg)](https://www.npmjs.com/package/@jalali-js/web)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/web-components)

Framework-free Web Components for jalali-js: headless calendar and styled date/time pickers.
Use them from plain HTML, or drop them into any host framework.

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
npm install @jalali-js/web
```

```ts
import '@jalali-js/web';
import '@jalali-js/web/date-picker.css';
```

Importing the package registers the custom elements.

## Compatibility

| Item     | Support                                     |
| -------- | ------------------------------------------- |
| Runtime  | Modern browsers with Custom Elements        |
| Peers    | None                                        |
| Node     | 22 and 24 (CI matrix)                       |
| Verified | Chromium, Firefox, WebKit in the e2e matrix |

## Quick start

```html
<script type="module">
  import '@jalali-js/web';
  import '@jalali-js/web/date-picker.css';
</script>

<jalali-date-picker
  id="picker"
  system="jalali"
  locale="fa"
  value-format="gregorian-iso"
></jalali-date-picker>

<script type="module">
  document.getElementById('picker').addEventListener('change', (e) => {
    console.log(e.detail.value);
  });
</script>
```

## Elements

| Element                | Role                                     |
| ---------------------- | ---------------------------------------- |
| `<jalali-date-picker>` | Styled picker (grid or dropdown variant) |
| `<jalali-time-picker>` | Hour and minute selection                |
| `<jalali-calendar>`    | Headless calendar primitive              |

Range, event, and time-range elements ship in
[`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web).

Attributes use kebab-case (`value-format`, `minute-step`). Properties use camelCase in JS.
`change` events carry `{ value, date }` (or the matching payload for time).

## Options

Key `<jalali-date-picker>` attributes:

| Attribute       | Values                 | Default         | Notes                    |
| --------------- | ---------------------- | --------------- | ------------------------ |
| `system`        | `jalali` / `gregorian` | `jalali`        | Display calendar         |
| `locale`        | `en` / `fa` / `ps`     | `en`            | UI language              |
| `value-format`  | `gregorian-iso` / …    | `gregorian-iso` | Stored value shape       |
| `variant`       | `grid` / `dropdown`    | `grid`          | Popover or Y/M/D selects |
| `precision`     | `date` / `datetime`    | `date`          | Add a time panel         |
| `show-holidays` | boolean attribute      | off             | Needs holidays package   |

Full tables: [Web Components guide](https://jalali-js.yanovian.com/guide/web-components#attribute-and-property-tables).

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

- [Live demo](https://jalali-js.yanovian.com/playground/vanilla/)
- [Documentation](https://jalali-js.yanovian.com/guide/web-components)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)

## License

MIT
