---
description: سامانه تقویم، لایه‌های دقت، موتور تبدیل، و بسته‌های زبان.
---

# مفاهیم اصلی

## سامانه تقویم یک تنظیم نمایش است

`jalali-js` روی یک سامانه تقویم متمرکز است: جلالی (هجری شمسی). میلادی تنها سامانه دیگر
است و یک ویژگی هم‌رده نیست: یک نیاز ساختاری است، سمت ذخیره قرارداد «نمایش جلالی، ذخیره
میلادی» که هر مؤلفه به‌صورت پیش‌فرض از آن پیروی می‌کند (ببینید
[مقدار نمایش در برابر مقدار ذخیره](/fa/guide/display-vs-storage)). `system: 'gregorian'` روی
`createCalendar()` یا هر مؤلفه تبدیل هویت است: تا کد برنامه «کدام تقویم» را یک تنظیم
بداند، نه اینکه همه‌جا میلادی را حالت خاص کند.

## لایه‌های دقت، نه فیلدهای اختیاری

`jalali-js` همان سه لایه پیشنهاد TC39 `Temporal` را به کار می‌برد، روی هر سامانه تقویم
فعالی:

| نوع                     | فیلدها                                             | آگاه از منطقه زمانی؟ |
| ----------------------- | -------------------------------------------------- | -------------------- |
| `CalendarDate`          | `year`، `month`، `day`                             | خیر                  |
| `CalendarDateTime`      | به‌علاوه `hour`، `minute`، `second`، `millisecond` | خیر (ساعت دیواری)    |
| `ZonedCalendarDateTime` | به‌علاوه نام IANA `timeZone`                       | بله                  |

هر لایه نوع TypeScript خودش را دارد، نه یک نوع با فیلدهای اختیاری. کدی که روی
`CalendarDate` نوشته شده هرگز به‌اشتباه فیلد `hour` خوانده‌نشده را نمی‌خواند. لایه را با
گزینه `precision` در `createCalendar()` برگزینید؛ overloadهای TypeScript برای هر دقت،
`today()` را با نوع برگشت درست می‌دهند:

```ts
createCalendar({ system: 'jalali' }); // precision: 'date' (پیش‌فرض)
createCalendar({ system: 'jalali', precision: 'datetime' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'auto' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'Asia/Tehran' });
```

`timeZone: 'auto'` مقدار `Intl.DateTimeFormat().resolvedOptions().timeZone` را می‌خواند.
زیر SSR (Next.js، Nuxt)، در رندر سرور به `'UTC'` می‌رسد چون هنوز `window` نیست؛ هوک یا
composable با نام `useResolvedTimeZone()` پس از mount منطقه زمانی واقعی مرورگر را دوباره
حل می‌کند، بدون mismatch هیدراسیون. راهنماهای [React](/fa/guide/react) و
[Vue](/fa/guide/vue) را ببینید.

## موتور تبدیل

تبدیل جلالی به میلادی از Julian Day Number می‌گذرد (شمارش پیوسته روز بدون تقویم خودش)
به‌عنوان تنها مسیر بین دو سامانه، پشت یک رابط کوچک `CalendarEngine`.

موتور پیش‌فرض از قاعده حسابی سال کبیسه در چرخه ۳۳ ساله اعتبارسنجی‌شده استفاده می‌کند
(Kazimierz M. Borkowski). برای بازه‌ای که برنامه‌های واقعی نیاز دارند با تقویم نجومی
هم‌خوان است، در زمان ثابت اجرا می‌شود، و وابستگی زمان اجرا ندارد. در برابر تقویم پارسی
ICU در Node و یک جدول کبیسه ۱۲۱ ساله منتشرشده بررسی شده است.

یک موتور نجومی اختیاری هم هست. نوروز را از اعتدال مارس در نصف‌النهار تهران (۵۲٫۵° شرقی)
با طول خورشیدی کم‌دقت Jean Meeus پیدا می‌کند. وقتی کبیسه‌های مبتنی بر اعتدال خیلی بیرون
از بازه هم‌خوانی حسابی لازم دارید از آن استفاده کنید. از پیش‌فرض کندتر است.

```ts
createCalendar({ system: 'jalali', engine: 'astronomical' });
toGregorian({ year: 1403, month: 1, day: 1 }, 'jalali', { engine: 'astronomical' });
fromGregorian({ year: 2024, month: 3, day: 20 }, 'jalali', { engine: 'astronomical' });
```

`engine` را حذف کنید، یا `'arithmetic'` بدهید، برای پیش‌فرض.

## ریاضی تاریخ و پرس‌وجو

هسته کنار موتور تبدیل، کمک‌تابع‌های تاریخ می‌فرستد. هر کدام روی سامانه تقویم کار می‌کند،
با صفر وابستگی زمان اجرا:

```ts
import {
  addDays,
  addMonths,
  addYears,
  diffDates,
  startOf,
  endOf,
  isBefore,
  isAfter,
  isSameDay,
  isBetween,
  isToday,
} from 'jalali-js';

addDays({ year: 1403, month: 12, day: 30 }, 1, 'jalali'); // 1404-01-01
addMonths({ year: 1403, month: 1, day: 31 }, 6, 'jalali'); // 1403-07-30 (روز محدود شده)
addYears({ year: 1403, month: 12, day: 30 }, 1, 'jalali'); // 1404-12-29 (روز محدود شده)

diffDates(a, b, 'month', 'jalali'); // ماه‌های کامل علامت‌دار از b تا a

startOf({ year: 1403, month: 5, day: 15 }, 'week', 'jalali'); // 1403-05-13، شنبه
startOf({ year: 2024, month: 8, day: 5 }, 'week', 'gregorian', 1); // شروع هفته: 1 = دوشنبه
endOf({ year: 1403, month: 5, day: 15 }, 'month', 'jalali'); // 1403-05-31

isBefore(a, b); // compareDates(a, b) < 0
isBetween(date, start, end); // کران‌ها شامل
isToday(date, 'jalali');
```

سه قاعده مهم:

- `addMonths()` و `addYears()` روز را به طول ماه هدف محدود می‌کنند. ۳۰ اسفند سال کبیسه
  به‌علاوه یک سال می‌شود ۲۹ اسفند.
- `diffDates()` به‌سوی صفر قطع می‌کند: واحد فقط وقتی کامل گذشته باشد شمرده می‌شود. واحدها:
  `day`، `week`، `month`، `year`.
- `startOf()` و `endOf()` روز شروع هفته را به‌عنوان پارامتر می‌گیرند، چون هفته جلالی از
  شنبه شروع می‌شود و هفته میلادی معمولاً از یکشنبه یا دوشنبه. پیش‌فرض قرارداد خود سامانه
  است (`WEEK_START_DAY`).

## قواعد انتخاب

`SelectionRules` محدود می‌کند انتخابگر تاریخ چه چیزی را بپذیرد. `isDateSelectable(date, rules)`
یک ترتیب اولویت را حل می‌کند:

1. وقتی `enabledDates` تنظیم شود، به‌تنهایی تصمیم می‌گیرد.
2. `disabledDates` تاریخ فهرست‌شده را مسدود می‌کند.
3. `disabledWeekdays` روز هفته فهرست‌شده را مسدود می‌کند (۰ یکشنبه، ۶ شنبه).
4. `minDate` و `maxDate` تاریخ‌های بیرون از کران را مسدود می‌کنند (کران‌ها شامل).

تاریخ‌های قاعده فیلدهای ساده `{ year, month, day }` هستند و در سامانه تقویم خود تاریخ
خوانده می‌شوند. هر انتخابگر prop با نام `rules` می‌گیرد و آن را از طریق
`buildCalendarGrid()` می‌خواند. ببینید [قواعد انتخاب](/fa/guide/selection-rules).

## زمان روز

`TimeOfDay` برابر `{ hour, minute }` است. `withTime(date, time)` یک `CalendarDateTime`
می‌سازد. `TimePicker` انتخابگر ساعت و دقیقه را نشان می‌دهد. `DatePicker` با
`precision: 'datetime'` یک پنل زمان زیر شبکه اضافه می‌کند. ببینید
[انتخاب زمان](/fa/guide/time-selection).

## بسته‌های زبان

`@jalali-js/i18n` مقادیر `en`، `fa` و `ps` (پشتو، با نام‌های زودیاکی افغانستان برای همان
ماه‌های جلالی) را صادر می‌کند؛ هر کدام یک `LocalePack`: نام ماه (برای هر دو سامانه
تقویم، پس `en` آوانویسی انگلیسی ماه‌های جلالی را دارد و `fa` آوانویسی پارسی ماه‌های
میلادی را)، نام روز هفته، سبک رقم، و جهت متن. `format()` یک تاریخ به‌همراه بسته زبان
می‌گیرد و آن را رندر می‌کند؛ prop با نام `locale` در رابط‌های React، Vue و Web Components
مشخص می‌کند مؤلفه کدام بسته را به کار ببرد.

`format()` همچنین گزینه `template` می‌گیرد (`'YYYY/MM/DD'`، `'D MMMM YYYY'`) برای شکل
خروجی دقیق، و `parseTemplate()` چنین شکلی را دوباره به `CalendarDate` می‌خواند. ببینید
[قالب‌ها](/fa/guide/i18n#templates) در راهنمای i18n.
