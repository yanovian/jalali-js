---
description: انتخابگرهای Web Components بدون فریم‌ورک برای HTML ساده یا هر فریم‌ورک میزبان.
---

# Vanilla / Web Components

```sh
npm install @jalali-js/web
```

`@jalali-js/web` به فریم‌ورک نیاز ندارد.
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) ساده
(custom element) می‌فرستد، پس در HTML و JavaScript ساده کار می‌کند، و مثل هر عنصر HTML دیگر
در React، Vue، Svelte، Angular یا هر فریم‌ورک دیگر می‌نشیند.

## `<jalali-calendar>`: پریمیتیو بدون ظاهر

شبکه ماه با ویژگی‌های `data-jalali-calendar-*` و بدون CSS اجباری.

```html
<jalali-calendar id="cal" system="jalali" locale="en"></jalali-calendar>
<script type="module">
  import '@jalali-js/web';

  const cal = document.getElementById('cal');
  cal.addEventListener('select', (event) => {
    console.log(event.detail.date);
  });
</script>
```

`system`، `locale` و `quick-nav` ویژگی‌های HTML ساده هستند. `.value` (انتخاب جاری، یا `null`)
فقط property است، چون `CalendarDate` به‌صورت رشته ویژگی ساده قابل نمایش نیست.

## `<jalali-date-picker>`: انتخابگر کارآمد با ظاهر پیش‌فرض

```html
<jalali-date-picker id="picker" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('picker').addEventListener('change', (event) => {
    // event.detail: { value, date }. value: مقدار ذخیره (پیش‌فرض ISO میلادی)؛ ببینید
    // «مقدار نمایشی در برابر مقدار ذخیره‌سازی». date: CalendarDate خام.
  });
</script>
```

`variant="dropdown"` پاپ‌آپ شبکه تقویم را با سه `<select>` ساده سال/ماه/روز عوض می‌کند، برای
ورود بازه شناخته‌شده باریک مثل تاریخ تولد:

```html
<jalali-date-picker system="jalali" locale="en" variant="dropdown"></jalali-date-picker>
```

شخص می‌تواند ماه یا سال سربرگ پاپ‌آپ شبکه را کلیک کند تا مستقیم به شبکه ماه یا شبکه سال
برود، به‌جای ورق زدن ماه به ماه. این به‌صورت پیش‌فرض روشن است؛ برای خاموش کردن
`quick-nav="false"` بگذارید. برای بدون انتخاب اولیه `.defaultDate = null` بگذارید (یک
property، نه attribute)، تا انتخابگر خالی باز شود و جایگاه‌نما را نشان دهد تا کسی تاریخ
انتخاب کند؛ اگر نگذارید تاریخ امروز است.

فهرست کامل property و رویداد:
[`JalaliDatePickerElement`](/api/@jalali-js/web/classes/JalaliDatePickerElement).

## انتخابگر بازه، تقویم رویداد، و تقویم درون‌خطی

`@jalali-js/ui-web` عناصر `<jalali-range-picker>`، `<jalali-event-calendar>` و
`<jalali-inline-calendar>` را روی همان پریمیتیوها اضافه می‌کند؛ ببینید
[پیکربندی و قالب ظاهری](/fa/guide/theming#range-picker-event-calendar-and-inline-calendar) و
[تقویم رویداد](/fa/guide/event-calendar).

```sh
npm install @jalali-js/ui-web
```

```html
<jalali-inline-calendar system="jalali" locale="en"></jalali-inline-calendar>
<jalali-range-picker system="jalali" locale="en"></jalali-range-picker>
<jalali-event-calendar system="jalali" locale="en"></jalali-event-calendar>
<script type="module">
  import '@jalali-js/ui-web';
</script>
```

## جدول‌های attribute و property

ویژگی‌های بولی با حضور روشن می‌شوند. برای خاموش کردن `"false"` بگذارید. اشیاء
(`rules`، `defaultDate`، `events`) فقط property جاوااسکریپت هستند.

### `<jalali-date-picker>`

| نام              | نوع   | پیش‌فرض         | معنا                                          |
| ---------------- | ----- | --------------- | --------------------------------------------- |
| `system`         | attr  | `jalali`        | تقویم نمایش                                   |
| `locale`         | attr  | `en`            | زبان UI                                       |
| `variant`        | attr  | `grid`          | `grid` یا `dropdown`                          |
| `precision`      | attr  | `date`          | `date` یا `datetime`                          |
| `minute-step`    | attr  | `1`             | گام دقیقه                                     |
| `disabled-hours` | attr  | -               | ساعت‌های جداشده با ویرگول                     |
| `value-format`   | attr  | `gregorian-iso` | شکل ذخیره                                     |
| `placeholder`    | attr  | بسته زبان       | متن ورودی خالی                                |
| `quick-nav`      | attr  | روشن            | شبکه‌های پرش ماه و سال                        |
| `show-holidays`  | attr  | خاموش           | علامت تعطیلات                                 |
| `block-holidays` | attr  | خاموش           | مسدود کردن تعطیلات                            |
| `holiday-region` | attr  | `IR`            | بسته تعطیلات                                  |
| `defaultDate`    | prop  | امروز           | انتخاب اولیه. `null` خالی است                 |
| `rules`          | prop  | -               | حد انتخاب                                     |
| `value`          | prop  | -               | گرفتن یا گذاشتن انتخاب (set رویداد نمی‌فرستد) |
| `change`         | event | -               | `{ value, date }`                             |

### `<jalali-calendar>` / `<jalali-inline-calendar>`

| نام                     | نوع   | پیش‌فرض  | معنا                   |
| ----------------------- | ----- | -------- | ---------------------- |
| `system`                | attr  | `jalali` | تقویم نمایش            |
| `locale`                | attr  | `en`     | زبان UI                |
| `quick-nav`             | attr  | روشن     | شبکه‌های پرش ماه و سال |
| `show-holidays`         | attr  | خاموش    | علامت تعطیلات          |
| `block-holidays`        | attr  | خاموش    | مسدود کردن تعطیلات     |
| `holiday-region`        | attr  | `IR`     | بسته تعطیلات           |
| `value`                 | prop  | `null`   | روز انتخاب‌شده         |
| `rules`                 | prop  | -        | حد انتخاب              |
| `initialDisplayedMonth` | prop  | -        | ماه باز شدن            |
| `select`                | event | -        | `{ date }`             |

### `<jalali-time-picker>`

| نام              | نوع   | پیش‌فرض | معنا                      |
| ---------------- | ----- | ------- | ------------------------- |
| `locale`         | attr  | `en`    | زبان رقم‌ها               |
| `minute-step`    | attr  | `1`     | گام گزینه‌های دقیقه       |
| `disabled-hours` | attr  | -       | ساعت‌های جداشده با ویرگول |
| `value`          | prop  | نیمه‌شب | زمان جاری                 |
| `change`         | event | -       | `{ time }`                |

### `<jalali-range-picker>`

| نام                                                   | نوع   | پیش‌فرض              | معنا               |
| ----------------------------------------------------- | ----- | -------------------- | ------------------ |
| `system` / `locale` / `value-format` / `placeholder`  | attr  | مثل انتخابگر تاریخ   | ویژگی‌های مشترک    |
| `show-holidays` / `block-holidays` / `holiday-region` | attr  | خاموش / خاموش / `IR` | پرچم‌های تعطیلات   |
| `defaultRange`                                        | prop  | -                    | بازه اولیه         |
| `rules`                                               | prop  | -                    | حد روز و بازه      |
| `change`                                              | event | -                    | `{ value, range }` |

### `<jalali-time-range-picker>`

| نام              | نوع   | پیش‌فرض            | معنا                      |
| ---------------- | ----- | ------------------ | ------------------------- |
| `locale`         | attr  | `en`               | زبان رقم‌ها               |
| `minute-step`    | attr  | `1`                | گام دقیقه                 |
| `disabled-hours` | attr  | -                  | ساعت‌های جداشده با ویرگول |
| `defaultRange`   | prop  | `09:00` تا `17:00` | بازه اولیه                |
| `change`         | event | -                  | `{ range }`               |

### `<jalali-event-calendar>`

| نام                     | نوع   | پیش‌فرض  | معنا                                     |
| ----------------------- | ----- | -------- | ---------------------------------------- |
| `system`                | attr  | `jalali` | تقویم نمایش                              |
| `locale`                | attr  | `en`     | زبان UI                                  |
| `view`                  | attr  | `month`  | `month`، `week`، `day`، یا `timeline`    |
| `timeline`              | prop  | -        | گزینه‌های timeline (`layout` و مانند آن) |
| `events`                | prop  | `[]`     | رویدادها برای چیدمان                     |
| `initialDisplayedMonth` | prop  | -        | لنگر ماه                                 |
| `initialDate`           | prop  | امروز    | لنگر هفته یا روز                         |
| `event-click`           | event | -        | `{ event }`                              |
| `day-click`             | event | -        | `{ date }`                               |

## عمداً بدون shadow DOM

این عنصرها در light DOM رندر می‌شوند: بدون `attachShadow()`، بدون مرز encapsulation. همین
باعث می‌شود `@jalali-js/web/date-picker.css` (و قالب‌های `compact`/`dark` از
`@jalali-js/ui-web/themes`) دقیقاً همان stylesheetهایی باشند که بایندینگ‌های React و Vue به کار
می‌برند، و همان ویژگی‌های `[data-jalali-*]` را از هر دو مسیر قالب دهند. تیمی که از قبل یکی از
آن قالب‌ها را در React و Vue اجرا می‌کند می‌تواند یک `<jalali-date-picker>` را در صفحه HTML
ساده، یا در فریم‌ورکی که این پروژه برایش بایندینگ اختصاصی ندارد، بگذارد و با صفر CSS تازه همان
ظاهر را ببیند.
