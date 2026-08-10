---
description: Official Iran public holidays, region packs, and picker markers.
---

# Holidays

`@jalali-js/holidays` ships official public holiday data for the Jalali
calendar. The package is offline and versioned with the rest of the library.
It makes no network calls at runtime. It has zero runtime dependencies.

**Today this package ships Iran (`region: 'IR'`) only.** Afghanistan (`AF`)
and Tajikistan (`TJ`) use the Jalali calendar too, but their official holiday
lists differ. Those region codes are reserved. Calling them throws until their
packs ship.

Dates use plain Jalali `{ year, month, day }` fields. That shape matches the
date fields `jalali-js` already uses, so you can pass a `CalendarDate` without
an extra conversion step.

## Regions

Pass `region` on every query. The default is `'IR'` (Iran).

```ts
import { isHoliday, HOLIDAY_REGIONS, SHIPPED_HOLIDAY_REGIONS } from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // Iran (default)
isHoliday({ year: 1403, month: 1, day: 1 }, { region: 'IR' });

HOLIDAY_REGIONS; // ['IR', 'AF', 'TJ']
SHIPPED_HOLIDAY_REGIONS; // ['IR']
```

Iran data lives under `packages/holidays/src/regions/ir/`. A later Afghanistan
or Tajikistan pack will follow the same layout under `regions/af/` or
`regions/tj/`.

```
regions/ir/
  ids.ts              # fixed and lunar id lists
  fixed.ts            # solar Jalali rules
  lunar-table.ts      # generated from data/ir/lunar/*.json
  holiday.ts          # build one Holiday from id + kind
  names/{en,fa,ps}.ts # one file per language
  index.ts            # iranHolidayPack
```

## Names per language

Holiday display names follow the same per-language file pattern as
`@jalali-js/i18n` (`en.ts`, `fa.ts`, `ps.ts`). For Iran they live under
`regions/ir/names/`. Names stay in the name files. Kind and dates stay in
`fixed.ts` and the lunar table.

The runtime API still returns one `names` object with all three locales, so a
caller can pick `names.fa` without a second lookup.

## What Iran covers

Iran's official list is two calendars in one pack. Both kinds return from the
same API. Each holiday has `kind: 'fixed'` or `kind: 'lunar'`.

**Fixed solar holidays** (`kind: 'fixed'`) follow the Jalali year. They keep
the same month and day every year. Examples: Nowruz (Farvardin 1-4), Sizdah
Bedar, Jomhoori Eslami, and other national days on fixed Jalali dates. These
live in `regions/ir/fixed.ts` as rules.

**Lunar Islamic holidays** (`kind: 'lunar'`) follow the lunar calendar, so
their Jalali date shifts each year. Examples: Eyd-e Fetr, Ashura, and other
observed Islamic days on the official Iran list. Those Jalali dates live in a
per-year table under `data/ir/lunar/`.

The covered Jalali year range for lunar rows is `HOLIDAY_YEAR_RANGE` (today:
1402 through 1425). Outside that range, fixed solar holidays still resolve.
Lunar holidays do not.

The lunar table is sourced from the published official calendar (University of
Tehran Calendar Centre, via the emrooz.app holiday lists). Later years follow
that published projection. When a year calendar is revised, refresh the JSON
for that year and run `make update-holidays`.

## API

```ts
import {
  isHoliday,
  holidaysOn,
  holidaysInMonth,
  holidaysInYear,
  holidayName,
  HOLIDAY_YEAR_RANGE,
} from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // true (Nowruz, Iran)

holidaysOn({ year: 1403, month: 1, day: 13 });
// Sizdah Bedar and Shahadat-e Imam Ali share that day in 1403.
// Each entry has `id`, `kind` ('fixed' | 'lunar'), and `names` in en, fa, and ps.

holidayName('ashura', 'fa'); // 'عاشورا'
holidayName('ashura', 'ps'); // 'عاشورا'
holidayName('eyd-fetr', 'ps'); // 'کوچنی اختر'

holidaysInMonth(1403, 1);
holidaysInYear(1403);

HOLIDAY_YEAR_RANGE; // { min: 1402, max: 1425 }
```

Every holiday carries names for the three locales this monorepo ships: English
(`en`), Farsi (`fa`), and Pashto (`ps`). Pick the field that matches your UI
locale, or call `holidayName(id, locale)`.

## Mark holidays in a picker

Every grid picker takes `showHolidays` and `blockHolidays`. Those options work
when the calendar system is Jalali. Holiday days get a `data-holiday`
attribute. The default stylesheet colors them through `--jalali-holiday-fg`.
With `blockHolidays`, the same days also become unselectable through Phase 16
selection rules (`disabledDates`).

The default list is Iran. Pass `holidayRegion` (React and Vue) or
`holiday-region` (Web Components) to choose a region when more packs ship.

```tsx
import { DatePicker } from '@jalali-js/react';

<DatePicker system="jalali" locale="fa" showHolidays />;
<DatePicker system="jalali" locale="fa" showHolidays holidayRegion="IR" />;
<DatePicker system="jalali" locale="fa" showHolidays blockHolidays />;
```

```vue
<DatePicker system="jalali" locale="fa" show-holidays />
<DatePicker system="jalali" locale="fa" show-holidays holiday-region="IR" />
<DatePicker system="jalali" locale="fa" show-holidays block-holidays />
```

```html
<jalali-date-picker system="jalali" locale="fa" show-holidays></jalali-date-picker>
<jalali-date-picker
  system="jalali"
  locale="fa"
  show-holidays
  holiday-region="IR"
></jalali-date-picker>
```

`Calendar`, `InlineCalendar`, and `RangePicker` take the same options.

## Refresh the Iran lunar table

To add a new Jalali year for Iran:

1. Create `packages/holidays/data/ir/lunar/<year>.json` with lunar entries only.
2. Run `make update-holidays` (or `node scripts/update-holidays.mjs`).
3. Run the holidays unit tests.
4. Open a small pull request.

Fixed solar holidays stay in `packages/holidays/src/regions/ir/fixed.ts`. Do
not put them in the JSON files. Names stay in
`packages/holidays/src/regions/ir/names/{en,fa,ps}.ts`.
