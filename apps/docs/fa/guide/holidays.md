---
description: تعطیلات رسمی ایران، بسته‌های منطقه، و نشانه‌های انتخابگر.
---

# تعطیلات

`@jalali-js/holidays` تعطیلات رسمی ایران (`IR`) را به‌صورت آفلاین می‌فرستد. `AF` و
`TJ` رزرو شده‌اند و تا زمان ارسال آن بسته‌ها خطا می‌دهند. تاریخ‌ها فیلدهای جلالی
`{ year, month, day }` دارند.

## منطقه‌ها

```ts
import { isHoliday, SHIPPED_HOLIDAY_REGIONS } from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 }); // ایران (پیش‌فرض)
isHoliday({ year: 1403, month: 1, day: 1 }, { region: 'IR' });
SHIPPED_HOLIDAY_REGIONS; // ['IR']
```

چیدمان بسته ایران:

```
regions/ir/
  ids.ts fixed.ts lunar-table.ts holiday.ts
  names/{en,fa,ps}.ts
  index.ts
```

نام‌ها یک فایل برای هر زبان هستند، مثل `@jalali-js/i18n`. زمان اجرا همچنان
`names: { en, fa, ps }` برمی‌گرداند.

## ثابت و قمری

ایران دو تقویم را در یک بسته ترکیب می‌کند:

- `kind: 'fixed'`: روزهای شمسی جلالی (نوروز و مانند آن) در `fixed.ts`
- `kind: 'lunar'`: روزهای اسلامی که هر سال جابه‌جا می‌شوند در `data/ir/lunar/`

پوشش قمری `HOLIDAY_YEAR_RANGE` است (امروز ۱۴۰۲ تا ۱۴۲۶). بیرون از آن بازه،
روزهای ثابت همچنان حل می‌شوند.

## API

```ts
import {
  isHoliday,
  holidaysOn,
  holidaysInMonth,
  holidayName,
  holidayDayTip,
  holidayDayChrome,
  HOLIDAY_YEAR_RANGE,
} from '@jalali-js/holidays';

isHoliday({ year: 1403, month: 1, day: 1 });
holidaysOn({ year: 1403, month: 1, day: 13 });
holidayName('ashura', 'fa');
holidaysInMonth(1403, 1);
HOLIDAY_YEAR_RANGE; // { min: 1402, max: 1426 }
```

## انتخابگرها

`showHolidays` روزها را با `data-holiday` علامت می‌زند. `blockHolidays` انتخاب را هم
مسدود می‌کند. منطقه پیش‌فرض ایران است (`holidayRegion` / `holiday-region`).

با `showHolidays`، hover یا focus روی روز تعطیل یک نوک راهنما زیر شبکه نشان می‌دهد
(`data-jalali-calendar-tip`). چند تعطیل در یک روز با `·` به هم می‌پیوندند. وقتی روز
مسدود هم باشد، نوک راهنما برچسب `LocalePack.ui.closedDay` زبان را اضافه می‌کند (مثل
`Closed` / `بسته`). نام دسترس‌پذیر دکمه روز متن نوک راهنما را هم دارد.

روزهای تعطیل مسدود از `data-disabled` و `aria-disabled` به‌جای ویژگی بومی `disabled`
استفاده می‌کنند، تا hover و focus برای نوک راهنما همچنان کار کنند.

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

## نوک راهنمای روز (بدون ظاهر)

برای شبکه سفارشی، نوک راهنما و برچسب aria را با همان کمک‌تابع‌هایی بسازید که انتخابگرها
به کار می‌برند:

```ts
import { holidayDayTip, holidayDayChrome } from '@jalali-js/holidays';

holidayDayTip({ year: 1403, month: 1, day: 1 }, { locale: 'en' });
// 'Nowruz'

holidayDayTip(
  { year: 1403, month: 1, day: 1 },
  { locale: 'en', closed: true, closedLabel: 'Closed' },
);
// 'Nowruz · Closed'

holidayDayChrome('15 Mordad 1403', cell, {
  locale: 'en',
  closedLabel: 'Closed',
});
// { tip?, ariaLabel, blocked? }
```

## به‌روزرسانی داده قمری

```sh
make update-holidays YEARS=next
make update-holidays YEARS=1426
make update-holidays
```

`YEARS=next` سال بعد از بالاترین سال JSON را از emrooz.app می‌گیرد.
بدون سال یعنی فقط از JSON روی دیسک بازسازی کند. CI سالانه وقتی فایل‌ها عوض شوند
یک PR باز می‌کند.
