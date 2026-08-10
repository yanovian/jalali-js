# @jalali-js/holidays

Official public holiday data for [jalali-js](https://github.com/yanovian/jalali-js).
**Today this package ships Iran (`IR`) only.** Afghanistan (`AF`) and
Tajikistan (`TJ`) are reserved region codes. Their packs are not shipped yet.

Iran's official list combines two calendars: fixed solar (Jalali) national
days such as Nowruz, and lunar Islamic observances whose Jalali date shifts
each year. Fixed days come from rules. Lunar days come from a per-year table.
The package is offline, bundled, and has zero runtime dependencies.

```sh
npm install @jalali-js/holidays
```

```ts
import { isHoliday, holidaysOn, holidaysInMonth } from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // true (Nowruz, Iran)
isHoliday({ year: 1403, month: 1, day: 1 }, { region: 'IR' });
holidaysOn({ year: 1403, month: 1, day: 1 });
// [{ id: 'nowruz', names: { en: 'Nowruz', fa: 'نوروز', ps: 'نوروز' }, ... }]
holidaysInMonth(1403, 1);
```

Every holiday includes names in English, Farsi, and Pashto (`names.en`,
`names.fa`, `names.ps`), matching the locales `@jalali-js/i18n` ships.
Layout keeps each concern in one place:

- `regions/ir/fixed.ts` — solar Jalali rules
- `data/ir/lunar/*.json` — lunar year rows (codegen to `lunar-table.ts`)
- `regions/ir/names/{en,fa,ps}.ts` — one language per file
- `regions/ir/ids.ts` — fixed and lunar id lists

Dates are plain Jalali `{ year, month, day }` fields. Lunar coverage is a
stated year range (see `HOLIDAY_YEAR_RANGE`, Jalali years 1402-1425 today).
Fixed holidays still resolve outside that range.

Pickers in `@jalali-js/react`, `@jalali-js/vue`, and `@jalali-js/web` take
`showHolidays`, `blockHolidays`, and `holidayRegion` (default `'IR'`).

To refresh the Iran lunar table for a new year, add a JSON file under
`packages/holidays/data/ir/lunar/` and run `node scripts/update-holidays.mjs`.
See the [holidays guide](https://jalali-js.yanovian.com/guide/holidays).

[Guide and API reference](https://jalali-js.yanovian.com/) ·
[Playground](https://jalali-js.yanovian.com/playground/react/)

MIT licensed.
