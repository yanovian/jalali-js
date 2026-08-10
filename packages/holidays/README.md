# @jalali-js/holidays

Offline Iran (`IR`) public holidays for
[jalali-js](https://github.com/yanovian/jalali-js). `AF` and `TJ` are
reserved. Fixed solar days use rules. Lunar days use a per-year table.
Zero runtime dependencies.

```sh
npm install @jalali-js/holidays
```

```ts
import { isHoliday, holidaysOn } from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // Nowruz (Iran)
holidaysOn({ year: 1403, month: 1, day: 1 }, { region: 'IR' });
```

Layout:

- `regions/ir/fixed.ts`: solar Jalali rules
- `data/ir/lunar/*.json`: lunar rows (codegen to `lunar-table.ts`)
- `regions/ir/names/{en,fa,ps}.ts`: one language per file
- `regions/ir/ids.ts`: fixed and lunar ids

Pickers take `showHolidays`, `blockHolidays`, and `holidayRegion`
(default `'IR'`).

```sh
make update-holidays YEARS=next
make update-holidays
```

[Guide](https://jalali-js.yanovian.com/guide/holidays) ·
[Playground](https://jalali-js.yanovian.com/playground/react/)

MIT licensed.
