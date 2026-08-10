# @jalali-js/ui-react

[![npm version](https://img.shields.io/npm/v/@jalali-js/ui-react.svg)](https://www.npmjs.com/package/@jalali-js/ui-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-jalali--js.yanovian.com-1e1b4b.svg)](https://jalali-js.yanovian.com/guide/react)

Higher-level React UI on `@jalali-js/react`: `RangePicker`, `InlineCalendar`, `EventCalendar`,
and `TimeRangePicker`, plus extra themes.

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
npm install @jalali-js/ui-react @jalali-js/react
```

```ts
import '@jalali-js/react/date-picker.css';
```

## Compatibility

| Item  | Support                        |
| ----- | ------------------------------ |
| React | 18 and 19 (CI matrix)          |
| Peers | `react` and `react-dom` `>=18` |
| Node  | 22 and 24 (CI matrix)          |

## Quick start

```tsx
import '@jalali-js/react/date-picker.css';
import { RangePicker, InlineCalendar } from '@jalali-js/ui-react';

<RangePicker system="jalali" locale="fa" onChange={(value, range) => {}} />;
<InlineCalendar system="jalali" locale="fa" onSelect={setDay} />;
```

## Components

| Component         | Role                                           |
| ----------------- | ---------------------------------------------- |
| `RangePicker`     | Start and end dates, one storage value per end |
| `InlineCalendar`  | Always-visible month grid                      |
| `EventCalendar`   | Month / week / day views over your event list  |
| `TimeRangePicker` | Start and end times                            |

You own the event list and editing UI for `EventCalendar`. Expand recurring rules before
pass-in. Layout helpers live in `jalali-js`.

## Options

Key `RangePicker` props:

| Prop           | Type             | Default           | Notes                  |
| -------------- | ---------------- | ----------------- | ---------------------- |
| `system`       | `CalendarSystem` | `'jalali'`        | Display calendar       |
| `locale`       | `LocaleCode`     | `'en'`            | UI language            |
| `valueFormat`  | `ValueFormat`    | `'gregorian-iso'` | Storage shape for ends |
| `rules`        | `SelectionRules` | -                 | Day and range limits   |
| `showHolidays` | `boolean`        | `false`           | Mark holidays          |

`EventCalendar`: `view` (`month` / `week` / `day`), `events`, `onEventClick`.

Full tables: [React guide](https://jalali-js.yanovian.com/guide/react#prop-tables) and
[Event calendar](https://jalali-js.yanovian.com/guide/event-calendar).

## Theming

Same `--jalali-*` tokens as `@jalali-js/react`. Extra theme stylesheets ship under this
package when you need a preset look.

```css
[data-jalali-datepicker-root] {
  --jalali-primary: #0f766e;
  --jalali-radius: 12px;
}
```

See [Theming](https://jalali-js.yanovian.com/guide/theming).

## Links

- [React guide](https://jalali-js.yanovian.com/guide/react)
- [Event calendar](https://jalali-js.yanovian.com/guide/event-calendar)
- [Playground](https://jalali-js.yanovian.com/playground/react/)
- [Changelog](https://github.com/yanovian/jalali-js/blob/master/CHANGELOG.md)
- [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react)

## License

MIT
