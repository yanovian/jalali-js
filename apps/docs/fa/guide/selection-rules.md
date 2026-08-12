---
description: محدود کردن انتخاب، کران حداقل/حداکثر، تاریخ‌ها و روزهای هفته مسدود، در هر انتخابگر.
---

# قواعد انتخاب

هر انتخابگر یک شیء `rules` می‌گیرد (`SelectionRules` از `jalali-js`) که محدود می‌کند شخص
چه چیزی را بگزیند. روزهای مسدود به‌صورت دکمه‌های غیرفعال با ویژگی `data-disabled` رندر
می‌شوند: کلیک کاری نمی‌کند، و ترتیب Tab از آن‌ها می‌گذرد. همان قواعد روی `Calendar`،
`DatePicker` و `RangePicker` در React، Vue و Web Components کار می‌کنند، چون همه قواعد را
از طریق `buildCalendarGrid()` مشترک می‌خوانند.

```ts
interface SelectionRules {
  minDate?: { year: number; month: number; day: number };
  maxDate?: { year: number; month: number; day: number };
  enabledDates?: { year: number; month: number; day: number }[];
  disabledDates?: { year: number; month: number; day: number }[];
  disabledWeekdays?: number[]; // 0 یکشنبه است، 6 شنبه
}
```

تاریخ‌های قاعده فیلدهای ساده `{ year, month, day }` هستند و در سامانه تقویم خود انتخابگر
خوانده می‌شوند.

ترتیب اولویت، که `isDateSelectable(date, rules)` حل می‌کند:

1. وقتی `enabledDates` تنظیم شود، به‌تنهایی تصمیم می‌گیرد. این فهرست بر هر قاعده دیگر می‌برد.
2. `disabledDates` تاریخ فهرست‌شده را مسدود می‌کند.
3. `disabledWeekdays` روز هفته فهرست‌شده را مسدود می‌کند.
4. `minDate` و `maxDate` تاریخ‌های بیرون از کران را مسدود می‌کنند (کران‌ها شامل).

## کران حداقل/حداکثر

یک فرم رزرو را به ۳۰ روز آینده محدود کنید:

```tsx
import { DatePicker } from '@jalali-js/react';
import { addDays, createCalendar } from 'jalali-js';

const today = createCalendar({ system: 'jalali' }).today();

<DatePicker
  system="jalali"
  locale="fa"
  rules={{ minDate: today, maxDate: addDays(today, 30, 'jalali') }}
/>;
```

## مسدود کردن آخر هفته (پنجشنبه و جمعه)

آخر هفته ایران پنجشنبه و جمعه است، شاخص‌های روز هفته ۴ و ۵:

```tsx
<DatePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />
```

## فهرست سفید تاریخ‌های باز

وقتی فقط مجموعه شناخته‌شده‌ای از تاریخ‌ها معتبر است، آن‌ها را در `enabledDates` فهرست کنید.
هر تاریخ دیگر مسدود است، و بقیه قواعد نادیده گرفته می‌شوند:

```tsx
<DatePicker
  system="jalali"
  locale="fa"
  rules={{
    enabledDates: [
      { year: 1403, month: 5, day: 10 },
      { year: 1403, month: 5, day: 12 },
      { year: 1403, month: 5, day: 17 },
    ],
  }}
/>
```

## Vue و Web Components

مؤلفه‌های Vue همان prop با نام `rules` را می‌گیرند:

```vue
<DatePicker system="jalali" locale="fa" :rules="{ disabledWeekdays: [4, 5] }" />
```

روی Web Components، `rules` یک property است (یک شیء)، نه یک attribute:

```js
const picker = document.querySelector('jalali-date-picker');
picker.rules = { disabledWeekdays: [4, 5] };
```

## انتخابگر بازه

`RangePicker` همان `rules` را به کار می‌برد. بازه نامزدی که از روز مسدود عبور کند کامل
نمی‌شود: کلیک دوم بازه تازه را از روز کلیک‌شده شروع می‌کند. آن انتخاب در React، Vue و
Web از طریق `isRangeSelectable(start, end, rules)` مشترک است.

```tsx
import { RangePicker } from '@jalali-js/ui-react';

<RangePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />;
```
