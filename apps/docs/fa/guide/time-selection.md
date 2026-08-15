---
description: زمان روز، یا تاریخ به‌همراه زمان را در React، Vue و Web Components انتخاب کنید.
---

# انتخاب زمان

هسته از قبل مدل `date + time` را دارد (فاز ۲). این راهنما مؤلفه‌هایی را پوشش می‌دهد که
آن مدل را در UI نشان می‌دهند.

## `TimePicker`

انتخابگر ساعت و دقیقه. اول بدون ظاهر: با `data-jalali-timepicker-*` قالب بدهید، یا همان
`date-picker.css` که `DatePicker` استفاده می‌کند را وارد کنید.

```tsx
import { TimePicker } from '@jalali-js/react';

<TimePicker
  locale="fa"
  defaultValue={{ hour: 14, minute: 30 }}
  minuteStep={15}
  disabledHours={[0, 1, 2, 3, 4, 5]}
  onChange={(time) => console.log(time)}
/>;
```

| Prop            | نوع              | پیش‌فرض                  | معنا                   |
| --------------- | ---------------- | ------------------------ | ---------------------- |
| `value`         | `TimeOfDay`      | -                        | زمان کنترل‌شده         |
| `defaultValue`  | `TimeOfDay`      | `{ hour: 0, minute: 0 }` | مقدار اولیه بدون کنترل |
| `minuteStep`    | `number`         | `1`                      | گام گزینه‌های دقیقه    |
| `disabledHours` | `number[]`       | -                        | ساعت‌های پنهان ۰ تا ۲۳ |
| `locale`        | `LocaleCode`     | `'en'`                   | رقم‌ها و جهت           |
| `onChange`      | `(time) => void` | -                        | تغییر زمان (React)     |

Vue از `@change` استفاده می‌کند. Web: `<jalali-time-picker>`، ویژگی‌های `minute-step` و
`disabled-hours`، و prop با `.value`.

## `DatePicker` با `precision="datetime"`

یک پنل زمان زیر شبکه اضافه کنید. مقدار ذخیره ارسال‌شده زمان را از قرارداد موجود فاز ۲
حمل می‌کند (`2024-08-05T14:30:00.000` به‌صورت پیش‌فرض).

```tsx
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="fa"
  precision="datetime"
  minuteStep={15}
  onChange={(value, date) => console.log(value, date)}
/>;
```

وقتی `precision` برابر `'datetime'` است، انتخاب روز popover را باز نگه می‌دارد تا شخص
زمان را تنظیم کند. بستن همچنان با Escape یا کلیک بیرون کار می‌کند.

## `TimeRangePicker`

دو `TimePicker` کنار هم، در بسته‌های `ui-*` کنار `RangePicker`.

```tsx
import { TimeRangePicker } from '@jalali-js/ui-react';

<TimeRangePicker
  locale="fa"
  minuteStep={15}
  onChange={(range) => console.log(range.start, range.end)}
/>;
```

Vue: `@change`. Web: `<jalali-time-range-picker>`، به رویداد `change` گوش دهید.
