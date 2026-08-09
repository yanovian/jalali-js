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
calendar instead of the Gregorian default. Full guide and API reference:
[yanovian.github.io/jalali-js](https://yanovian.github.io/jalali-js/).

Part of the [jalali-js](https://github.com/yanovian/jalali-js) toolkit. `@jalali-js/react` and
`@jalali-js/vue` build framework bindings on top of this package; `@jalali-js/i18n` and
`@jalali-js/nlp` are separate, optional packages for display formatting and natural language
parsing.

MIT licensed.
