# @jalali-js/i18n

Locale data and display formatting for [jalali-js](https://github.com/yanovian/jalali-js).

```sh
npm install @jalali-js/i18n
```

```ts
import { format, en, fa } from '@jalali-js/i18n';

const date = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

format(date, en); // '15 Mordad 1403'
format(date, fa); // '۱۵ مرداد ۱۴۰۳'
```

Two locales ship today, `en` and `fa`, each covering both calendar systems' month names
(English transliterations of the Jalali months, Persian transliterations of the Gregorian ones),
weekday names, digit style, and text direction. `@jalali-js/react` and `@jalali-js/vue` already
depend on this package and wire it up through a `locale` prop; reach for it directly only when
formatting a date outside a component.

Full guide and API reference: [yanovian.github.io/jalali-js](https://yanovian.github.io/jalali-js/).

MIT licensed.
