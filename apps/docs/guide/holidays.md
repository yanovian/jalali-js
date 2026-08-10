---
description: Iran public holidays, region packs, and picker markers.
---

# Holidays

`@jalali-js/holidays` ships offline Iran (`IR`) public holidays. `AF` and
`TJ` are reserved and throw until those packs ship. Dates use Jalali
`{ year, month, day }` fields.

## Regions

```ts
import { isHoliday, SHIPPED_HOLIDAY_REGIONS } from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // Iran (default)
isHoliday({ year: 1403, month: 1, day: 1 }, { region: 'IR' });
SHIPPED_HOLIDAY_REGIONS; // ['IR']
```

Iran pack layout:

```
regions/ir/
  ids.ts fixed.ts lunar-table.ts holiday.ts
  names/{en,fa,ps}.ts
  index.ts
```

Names are one file per language, like `@jalali-js/i18n`. Runtime still
returns `names: { en, fa, ps }`.

## Fixed and lunar

Iran combines two calendars in one pack:

- `kind: 'fixed'`: solar Jalali days (Nowruz, and so on) in `fixed.ts`
- `kind: 'lunar'`: Islamic days that shift each year in `data/ir/lunar/`

Lunar coverage is `HOLIDAY_YEAR_RANGE` (1402-1426 today). Outside that
range, fixed days still resolve.

## API

```ts
import {
  isHoliday,
  holidaysOn,
  holidaysInMonth,
  holidayName,
  HOLIDAY_YEAR_RANGE,
} from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 });
holidaysOn({ year: 1403, month: 1, day: 13 });
holidayName('ashura', 'fa');
holidaysInMonth(1403, 1);
HOLIDAY_YEAR_RANGE; // { min: 1402, max: 1426 }
```

## Pickers

`showHolidays` marks days with `data-holiday`. `blockHolidays` also blocks
selection. Default region is Iran (`holidayRegion` / `holiday-region`).

```tsx
<DatePicker system="jalali" locale="fa" showHolidays />
<DatePicker system="jalali" locale="fa" showHolidays blockHolidays />
```

```vue
<DatePicker system="jalali" locale="fa" show-holidays />
```

```html
<jalali-date-picker system="jalali" locale="fa" show-holidays></jalali-date-picker>
```

## Update lunar data

```sh
make update-holidays YEARS=next
make update-holidays YEARS=1426
make update-holidays
```

`YEARS=next` fetches the year after the highest JSON year from emrooz.app.
No years means rebuild from JSON on disk only. Yearly CI opens a PR when
files change.
