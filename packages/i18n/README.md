# @jalali-js/i18n

Locale data and display formatting for [jalali-js](https://github.com/yanovian/jalali-js).

```sh
npm install @jalali-js/i18n
```

```ts
import { format, formatRelative, parseTemplate, en, fa, ps } from '@jalali-js/i18n';

const date = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};
const earlier = { ...date, day: 12 };

format(date, en); // '15 Mordad 1403'
format(date, fa); // '۱۵ مرداد ۱۴۰۳'
format(date, ps); // '۱۵ زمری ۱۴۰۳' (Pashto, with Afghanistan's month names)

formatRelative(earlier, date, fa); // '۳ روز پیش'
format(date, en, { template: 'YYYY/MM/DD' }); // '1403/05/15'
parseTemplate('1403/05/15', 'YYYY/MM/DD', en); // the date above, or null on a mismatch
```

Three locales ship today, `en`, `fa`, and `ps`, each covering both calendar systems' month
names (English transliterations of the Jalali months, Persian transliterations of the Gregorian
ones, Afghanistan's zodiac-based month names in Pashto), weekday names, digit style, and text
direction.
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react),
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue), and
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) already depend on this package
and wire it up through a `locale` prop or attribute; reach for it directly only when formatting
a date outside a component.

[Guide and API reference](https://jalali-js.yanovian.com/) ·
[Examples](https://jalali-js.yanovian.com/guide/examples) ·
[Playground](https://jalali-js.yanovian.com/playground/react/)

MIT licensed.
