---
description: قالب‌بندی بدون ظاهر، قالب‌های CSS، انتخابگر بازه، و گزینه‌های تقویم درون‌خطی.
---

# پیکربندی و قالب ظاهری

## ماتریس پیکربندی بصری

هر انتخابگر این محورهای مستقل را ترکیب می‌کند؛ هر کدام یک prop ساده یا یک stylesheet واردشده
است، نه یک fork یا مؤلفه جدا:

| محور               | مقادیر                                        | تنظیم از راه                             |
| ------------------ | --------------------------------------------- | ---------------------------------------- |
| سامانه تقویم       | `jalali`، `gregorian`                         | prop با نام `system`                     |
| زبان               | `en`، `fa`، `ps` (رقم، نام ماه/روز هفته، جهت) | prop با نام `locale`                     |
| دقت                | تاریخ، تاریخ+زمان، تاریخ+زمان+منطقه زمانی     | نوعی که وارد می‌کنید                     |
| قالب نمایش         | بلند/کوتاه، با/بدون روز هفته، رقم پارسی/لاتین | prop با نام `displayFormat`              |
| قالب مقدار (ذخیره) | ISO میلادی، شیء جلالی، و دیگرها               | prop با نام `valueFormat`                |
| گونه UI انتخابگر   | پاپ‌آپ شبکه (پیش‌فرض)، فیلدهای dropdown       | prop با نام `variant` (فقط `DatePicker`) |
| قالب ظاهری         | پیش‌فرض، `dark`، `compact`، یا هر ترکیب       | stylesheetهایی که وارد می‌کنید           |

## بدون ظاهر یا با ظاهر

`Calendar` (React و Vue) ابتدایی بدون ظاهر است: نشانه‌گذاری ساده با ویژگی‌های `data-jalali-*`
و بدون CSS اجباری، تا بتوانید ظاهر را کامل عوض کنید. `DatePicker` همان ابتدایی با popover و
stylesheet پیش‌فرض دور آن است. برای ظاهر قابل استفاده بدون کار قالب‌بندی،
`@jalali-js/react/date-picker.css` (یا معادل Vue) را وارد کنید، یا وارد نکنید و ویژگی‌های
data را خودتان قالب دهید؛ هیچ چیز در مؤلفه‌ها برای کار کردن به stylesheet وابسته نیست.

## قرارداد قالب ظاهری

`date-picker.css` هر قاعده را از طریق ویژگی‌های سفارشی `--jalali-*` بیان می‌کند، نه مقدار
لفظی. یک قالب ظاهری stylesheetی است که زیرمجموعه‌ای از این‌ها را روی همان گزینشگرها بازنویسی
می‌کند (`[data-jalali-datepicker-root]`، `[data-jalali-datepicker-dropdown]`،
`[data-jalali-timepicker-root]`، `[data-jalali-timerangepicker-root]`،
`[data-jalali-calendar-root]`)؛ هرگز یک قاعده را از نو تعریف نمی‌کند.

| متغیر                           | کنترل می‌کند                                       |
| ------------------------------- | -------------------------------------------------- |
| `--jalali-font`                 | خانواده فونت                                       |
| `--jalali-font-size`            | اندازه فونت پایه                                   |
| `--jalali-line-height`          | ارتفاع خط پایه                                     |
| `--jalali-bg`                   | رنگ پس‌زمینه (ورودی، popover)                      |
| `--jalali-fg`                   | رنگ متن                                            |
| `--jalali-muted-fg`             | رنگ متن ثانویه (سرستون روز هفته، روزهای بیرون ماه) |
| `--jalali-border`               | رنگ حاشیه                                          |
| `--jalali-radius`               | شعاع گوشه (ورودی، popover، سلول ماه/سال)           |
| `--jalali-day-radius`           | شعاع گوشه سلول روز و کنترل‌های ناوبری              |
| `--jalali-primary`              | رنگ تأکید: حلقه امروز، پر شدن انتخاب/انتهای بازه   |
| `--jalali-primary-fg`           | رنگ متن روی `--jalali-primary`                     |
| `--jalali-shadow`               | سایه popover                                       |
| `--jalali-gap`                  | فاصله بین سلول‌های شبکه                            |
| `--jalali-header-gap`           | فاصله و حاشیه در سربرگ تقویم                       |
| `--jalali-control-size`         | عرض و ارتفاع کنترل‌های ناوبری                      |
| `--jalali-input-padding`        | فاصله داخلی ورودی متن و فیلدها                     |
| `--jalali-popover-padding`      | فاصله داخلی popover و تقویم رویداد                 |
| `--jalali-cell-padding`         | فاصله داخلی سلول‌های انتخابگر ماه و سال            |
| `--jalali-day-min-size`         | حداقل عرض/ارتفاع سلول روز                          |
| `--jalali-weekday-size`         | اندازه فونت سرستون روز هفته                        |
| `--jalali-event-bg`             | پس‌زمینه تراشه رویداد                              |
| `--jalali-event-fg`             | متن تراشه رویداد                                   |
| `--jalali-holiday-fg`           | متن روز تعطیل                                      |
| `--jalali-hover-bg`             | پر شدن hover برای روزها و ناوبری                   |
| `--jalali-range-bg`             | پر شدن روز داخل بازه برای `RangePicker`            |
| `--jalali-focus-ring`           | رنگ outline برای `:focus-visible`                  |
| `--jalali-timeline-marker-size` | قطر نشانگر timeline                                |
| `--jalali-timeline-accent`      | تأکید کارت timeline                                |
| `--jalali-timeline-road-track`  | عرض جاده چیدمان roadmap                            |
| `--jalali-timeline-road-color`  | خط آسفالت roadmap                                  |
| `--jalali-timeline-road-dash`   | خط‌چین مرکزی roadmap                               |
| `--jalali-timeline-road-edge`   | خط لبه roadmap                                     |

متن نوک راهنمای تعطیل از `[data-jalali-calendar-tip]` زیر شبکه ماه استفاده می‌کند. تعطیلی
که مسدود هم باشد `--jalali-holiday-fg` و پر شدن نرم تعطیل را نگه می‌دارد.

توکن‌های پیش‌فرض و قالب `dark` برای کنتراست متن WCAG 2.2 AA و حدود ۳:۱ برای حاشیه‌ها هدف
می‌گیرند. stylesheet همچنین به `prefers-contrast: more` و `forced-colors: active` پاسخ
می‌دهد. سلول‌های روز همان شعاع گوشه نرم پوسته تقویم را دارند. چگالی پیش‌فرض روی گوشی و
لپ‌تاپ از قبل فشرده است. فقط وقتی مقیاس داشبورد متراکم‌تر لازم دارید `themes/compact.css`
را وارد کنید.

چون ویژگی‌های سفارشی CSS به ارث می‌رسند، وقتی stylesheet یک قالب وارد شود روی هر انتخابگر
صفحه اعمال می‌شود: قالب ظاهری انتخاب کل برنامه است، نه یک prop برای هر نمونه. برای یک بخش
قالب‌دار، بازنویسی خود را زیر گزینشگر والد محدود کنید، با همان الگو (متغیرها را بازنویسی
کنید، با قواعد نجنگید).

## قالب‌های اضافه

`@jalali-js/ui-react` و `@jalali-js/ui-vue` دو قالب آماده می‌فرستند؛ هر کدام مجموعه جدا از
متغیرها را بازنویسی می‌کند تا با وارد کردن هر دو ترکیب شوند:

```ts
import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/dark.css'; // رنگ‌ها
import '@jalali-js/ui-react/themes/compact.css'; // فاصله و اندازه
```

## انتخابگر بازه، تقویم رویداد، و تقویم درون‌خطی

`@jalali-js/ui-react` (و `@jalali-js/ui-vue`) مؤلفه‌های بیشتری روی همان ابتدایی‌های بدون ظاهر
اضافه می‌کنند:

- **`RangePicker`**: انتخابگر بازه تاریخ شروع/پایان. انتخاب دوکلیکی (کلیک اول شروع را
  می‌گذارد، کلیک دوم پایان را می‌گذارد و popover را می‌بندد)؛ کلیک قبل از شروع جاری بازه را
  از نقطه تازه شروع می‌کند، به‌جای خطا. پس از انتخاب شروع، hover بازه‌ای را که انتخاب کامل
  می‌سازد پیش‌نمایش می‌کند.
- **`EventCalendar`**: نماهای ماه، هفته، روز و timeline برای رویدادهای متعلق به
  مصرف‌کننده، شامل مقدارهای `layout` با نام‌های `single`، `alternating` و `roadmap`.
  ببینید [تقویم رویداد](/fa/guide/event-calendar).
- **`InlineCalendar`**: `Calendar` با نامی قابل‌کشف‌تر دوباره صادر شده، برای شبکه همیشه
  دیده‌شده بدون popover دور آن.

برای فهرست کامل propها راهنماهای [React](/fa/guide/react) و [Vue](/fa/guide/vue) را ببینید، و
برای نوع‌های تولیدشده `@jalali-js/ui-react` به [مرجع API](/api/@jalali-js/ui-react/) مراجعه
کنید.
