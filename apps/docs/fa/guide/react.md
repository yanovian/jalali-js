---
description: بایندینگ React، DatePicker، Calendar بدون ظاهر، و نکته‌های SSR در Next.js.
---

# React

```sh
npm install @jalali-js/react
```

## `useCalendar()`

هوک سطح پایین: وضعیت `date`، `format()` بسته‌شده به زبان خود هوک، و
`isLeapYear()` / `daysInMonth()` / `today()` سامانه تقویم. بقیه این بسته روی آن یا روی
همان پریمیتیوهایی که می‌پوشاند ساخته شده است.

```tsx
import { useCalendar } from '@jalali-js/react';

function Summary() {
  const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
  return <p>امروز: {jalali.format(jalali.today(), { style: 'long', weekday: true })}</p>;
}
```

ورودی `{ system?, locale?, initialDate? }`، خروجی `{ date, setDate, format, today, isLeapYear,
daysInMonth, locale }`. امضای کامل: [مرجع API](/api/@jalali-js/react/).

## `Calendar`: پریمیتیو بدون ظاهر

شبکه ماه با ویژگی‌های `data-jalali-calendar-*` و بدون CSS اجباری. `DatePicker` (پایین) همین
مؤلفه با stylesheet پیش‌فرض و popover دور آن است؛ برای شبکه همیشه دیده‌شده، یا برای ساختن
popover یا dialog خودتان دور آن، مستقیم `Calendar` را به کار ببرید.

```tsx
import { Calendar } from '@jalali-js/react';

<Calendar system="jalali" locale="en" value={selected} onSelect={setSelected} />;
```

یک render prop با نام `day` نشانه‌گذاری سلول را یکسره عوض می‌کند، اگر ویژگی‌های data به‌تنهایی
کنترل کافی ندهند.

## `DatePicker`: انتخابگر کارآمد با ظاهر پیش‌فرض

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  valueFormat="gregorian-iso" // پیش‌فرض؛ «مقدار نمایش در برابر مقدار ذخیره» را ببینید
  onChange={(value, date) => {
    /* value: مقدار ذخیره؛ date: CalendarDate خام */
  }}
/>;
```

`variant="dropdown"` پاپ‌آپ شبکه تقویم را با سه `<select>` ساده سال/ماه/روز عوض می‌کند، برای
ورود بازه شناخته‌شده باریک مثل تاریخ تولد:

```tsx
<DatePicker system="jalali" locale="en" variant="dropdown" />
```

در پاپ‌آپ شبکه (و مستقیم در `Calendar`)، شخص می‌تواند ماه یا سال سربرگ را کلیک کند تا مستقیم
به شبکه ماه یا شبکه سال برود، به‌جای ورق زدن ماه به ماه. این به‌صورت پیش‌فرض روشن است؛ برای
خاموش کردن `quickNav={false}` بدهید. برای بدون انتخاب اولیه `defaultDate={null}` بدهید، تا
انتخابگر خالی باز شود و جایگاه‌نما را نشان دهد تا کسی تاریخ انتخاب کند.

فهرست کامل prop: [`DatePickerProps`](/api/@jalali-js/react/interfaces/DatePickerProps).

## `useResolvedTimeZone()`

با تقویم `'zoned-datetime'` و `timeZone: 'auto'` زیر SSR جفت می‌شود. رندر سرور (و اولین رندر
هیدراسیون کلاینت) همیشه `'UTC'` می‌خواند، چون هنوز `window` نیست؛ این هوک پس از mount منطقه
زمانی واقعی مرورگر را دوباره حل می‌کند، بدون هشدار هیدراسیون.

```tsx
import { useResolvedTimeZone } from '@jalali-js/react';

function Clock() {
  const timeZone = useResolvedTimeZone('auto');
  return <p>{timeZone}</p>; // هنگام SSR برابر 'UTC'، پس از mount منطقه واقعی
}
```

## انتخابگر بازه، تقویم رویداد، و تقویم درون‌خطی

`@jalali-js/ui-react` مقادیر `RangePicker`، `EventCalendar` و `InlineCalendar` را روی همان
پریمیتیوها اضافه می‌کند؛ ببینید
[پیکربندی و قالب ظاهری](/fa/guide/theming#range-picker-event-calendar-and-inline-calendar)
و [تقویم رویداد](/fa/guide/event-calendar).

```sh
npm install @jalali-js/ui-react
```

```tsx
import { EventCalendar, InlineCalendar, RangePicker } from '@jalali-js/ui-react';

<InlineCalendar system="jalali" locale="en" value={selected} onSelect={setSelected} />
<RangePicker system="jalali" locale="en" onChange={(value, range) => { /* ... */ }} />
<EventCalendar system="jalali" locale="en" events={events} onEventClick={setActive} />
```

## جدول‌های prop

با منبع هم‌خوانی شده. نوع‌ها کوتاه شده‌اند. امضاهای کامل در
[مرجع API](/api/@jalali-js/react/) هستند.

### `DatePicker`

| Prop            | نوع                                        | پیش‌فرض           | معنا                                          |
| --------------- | ------------------------------------------ | ----------------- | --------------------------------------------- |
| `system`        | `'jalali' \| 'gregorian'`                  | `'jalali'`        | تقویم نمایش                                   |
| `locale`        | `'en' \| 'fa' \| 'ps'`                     | `'en'`            | زبان UI                                       |
| `defaultDate`   | `CalendarDate \| CalendarDateTime \| null` | امروز             | انتخاب اولیه. `null` خالی است                 |
| `precision`     | `'date' \| 'datetime'`                     | `'date'`          | فقط روز، یا روز به‌همراه زمان                 |
| `minuteStep`    | `number`                                   | `1`               | گام دقیقه وقتی `precision` برابر datetime است |
| `disabledHours` | `number[]`                                 | -                 | ساعت‌های پنهان ۰ تا ۲۳                        |
| `quickNav`      | `boolean`                                  | `true`            | شبکه‌های پرش ماه و سال                        |
| `onChange`      | `(value, date) => void`                    | -                 | مقدار ذخیره و تاریخ خام                       |
| `valueFormat`   | `ValueFormat`                              | `'gregorian-iso'` | شکل `value` ذخیره                             |
| `displayFormat` | `FormatOptions`                            | -                 | قالب متن ورودی                                |
| `variant`       | `'grid' \| 'dropdown'`                     | `'grid'`          | popover شبکه یا selectهای Y/M/D               |
| `rules`         | `SelectionRules`                           | -                 | حداقل/حداکثر و روزهای مسدود                   |
| `showHolidays`  | `boolean`                                  | `false`           | علامت تعطیلات (جلالی)                         |
| `blockHolidays` | `boolean`                                  | `false`           | مسدود کردن تعطیلات (جلالی)                    |
| `holidayRegion` | `'IR' \| 'AF' \| 'TJ'`                     | `'IR'`            | بسته تعطیلات                                  |
| `placeholder`   | `string`                                   | بسته زبان         | متن ورودی خالی                                |
| `className`     | `string`                                   | -                 | کلاس ریشه                                     |

### `Calendar` / `InlineCalendar`

| Prop                    | نوع                    | پیش‌فرض        | معنا                        |
| ----------------------- | ---------------------- | -------------- | --------------------------- |
| `system`                | `CalendarSystem`       | `'jalali'`     | تقویم نمایش                 |
| `locale`                | `LocaleCode`           | `'en'`         | زبان UI                     |
| `value`                 | `CalendarDate \| null` | `null`         | روز انتخاب‌شده              |
| `onSelect`              | `(date) => void`       | -              | روز انتخاب شد               |
| `initialDisplayedMonth` | `{ year, month }`      | value یا امروز | ماه باز شدن                 |
| `quickNav`              | `boolean`              | `true`         | شبکه‌های پرش ماه و سال      |
| `rules`                 | `SelectionRules`       | -              | حداقل/حداکثر و روزهای مسدود |
| `showHolidays`          | `boolean`              | `false`        | علامت تعطیلات               |
| `blockHolidays`         | `boolean`              | `false`        | مسدود کردن تعطیلات          |
| `holidayRegion`         | `HolidayRegion`        | `'IR'`         | بسته تعطیلات                |
| `className`             | `string`               | -              | کلاس ریشه                   |

### `TimePicker`

| Prop            | نوع              | پیش‌فرض                  | معنا                |
| --------------- | ---------------- | ------------------------ | ------------------- |
| `value`         | `TimeOfDay`      | -                        | زمان کنترل‌شده      |
| `defaultValue`  | `TimeOfDay`      | `{ hour: 0, minute: 0 }` | دانه بدون کنترل     |
| `minuteStep`    | `number`         | `1`                      | گام گزینه‌های دقیقه |
| `disabledHours` | `number[]`       | -                        | ساعت‌های پنهان      |
| `locale`        | `LocaleCode`     | `'en'`                   | زبان رقم‌ها         |
| `onChange`      | `(time) => void` | -                        | زمان عوض شد         |
| `className`     | `string`         | -                        | کلاس ریشه           |

### `RangePicker` (`@jalali-js/ui-react`)

| Prop            | نوع                      | پیش‌فرض           | معنا                         |
| --------------- | ------------------------ | ----------------- | ---------------------------- |
| `system`        | `CalendarSystem`         | `'jalali'`        | تقویم نمایش                  |
| `locale`        | `LocaleCode`             | `'en'`            | زبان UI                      |
| `defaultRange`  | `{ start, end }`         | -                 | بازه اولیه                   |
| `onChange`      | `(value, range) => void` | -                 | وقتی هر دو انتها گذاشته شوند |
| `valueFormat`   | `ValueFormat`            | `'gregorian-iso'` | شکل ذخیره برای انتهاها       |
| `displayFormat` | `FormatOptions`          | -                 | قالب متن ورودی               |
| `rules`         | `SelectionRules`         | -                 | حد روز و بازه                |
| `showHolidays`  | `boolean`                | `false`           | علامت تعطیلات                |
| `blockHolidays` | `boolean`                | `false`           | مسدود کردن تعطیلات           |
| `holidayRegion` | `HolidayRegion`          | `'IR'`            | بسته تعطیلات                 |
| `placeholder`   | `string`                 | -                 | متن ورودی خالی               |
| `className`     | `string`                 | -                 | کلاس ریشه                    |

### `TimeRangePicker` (`@jalali-js/ui-react`)

| Prop            | نوع               | پیش‌فرض            | معنا                       |
| --------------- | ----------------- | ------------------ | -------------------------- |
| `locale`        | `LocaleCode`      | `'en'`             | زبان رقم‌ها                |
| `defaultRange`  | `{ start, end }`  | `09:00` تا `17:00` | بازه اولیه                 |
| `minuteStep`    | `number`          | `1`                | گام دقیقه برای هر دو انتها |
| `disabledHours` | `number[]`        | -                  | ساعت‌های پنهان             |
| `onChange`      | `(range) => void` | -                  | بازه عوض شد                |
| `className`     | `string`          | -                  | کلاس ریشه                  |

### `EventCalendar` (`@jalali-js/ui-react`)

برای مدل رویداد ببینید [تقویم رویداد](/fa/guide/event-calendar). Propها: `system`، `locale`،
`view` (`month` \| `week` \| `day` \| `timeline`، پیش‌فرض `month`)، `events`،
`initialDisplayedMonth`، `initialDate`، `displayFormat`، `timeline` (شامل
`layout`: `single` \| `alternating` \| `roadmap`)، `onEventClick`، `onDayClick`،
`className`.
