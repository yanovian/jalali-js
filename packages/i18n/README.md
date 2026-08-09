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
weekday names, digit style, and text direction.
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react),
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue), and
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) already depend on this package
and wire it up through a `locale` prop or attribute; reach for it directly only when formatting
a date outside a component.

[Guide and API reference](https://yanovian.github.io/jalali-js/) ·
[Examples](https://yanovian.github.io/jalali-js/guide/examples) ·
[Playground](https://yanovian.github.io/jalali-js/playground/react/)

MIT licensed.
