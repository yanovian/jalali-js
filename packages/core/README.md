# jalali-js

The Jalali (Persian, Shamsi) to Gregorian conversion core. TypeScript-native, zero runtime
dependencies, framework-agnostic.

```sh
npm install jalali-js
```

```ts
import { createCalendar, toGregorian, fromGregorian } from 'jalali-js';

const jalali = createCalendar({ system: 'jalali' });
jalali.today(); // { year: 1403, month: 5, day: 15 }

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali'); // { year: 2024, month: 8, day: 5 }
```

Three precision tiers (`CalendarDate`, `CalendarDateTime`, `ZonedCalendarDateTime`, matching TC39
`Temporal`'s own tiers), and a `valueFormat` option for opting a stored value into the Jalali
calendar instead of the Gregorian default.

[Guide and API reference](https://yanovian.github.io/jalali-js/) ·
[Examples](https://yanovian.github.io/jalali-js/guide/examples) ·
[Playground](https://yanovian.github.io/jalali-js/playground/react/)

Part of the [jalali-js](https://github.com/yanovian/jalali-js) toolkit:
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react),
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue), and
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) (plain Web Components, no
framework required) build bindings on top of this package;
[`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) and
[`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) are separate, optional packages
for display formatting and natural language parsing.

## Used by

- [kissed.app](https://kissed.app)

MIT licensed.
