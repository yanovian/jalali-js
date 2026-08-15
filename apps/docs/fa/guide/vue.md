---
description: بایندینگ Vue، DatePicker، Calendar بدون ظاهر، و نکته‌های SSR در Nuxt.
---

# Vue

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/vue
```

== pnpm

```sh
pnpm add @jalali-js/vue
```

== yarn

```sh
yarn add @jalali-js/vue
```

:::

## `useCalendar()`

composable سطح پایین: یک **ref** برای `date` (نه جفت `[date, setDate]` مثل هوک React؛
Vue اصطلاحی مستقیم ref را می‌خواند و می‌نویسد)، به‌همراه `format()` بسته‌شده به زبان
composable، و `isLeapYear()` / `daysInMonth()` / `today()` سامانه تقویم.

```vue
<script setup lang="ts">
import { useCalendar } from '@jalali-js/vue';

const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
</script>

<template>
  <p>امروز: {{ jalali.format(jalali.today(), { style: 'long', weekday: true }) }}</p>
</template>
```

امضای کامل: [مرجع API](/api/@jalali-js/vue/).

## `Calendar`: پریمیتیو بدون ظاهر

شبکه ماه با ویژگی‌های `data-jalali-calendar-*` و بدون CSS اجباری.

```vue
<script setup lang="ts">
import { Calendar } from '@jalali-js/vue';
</script>

<template>
  <Calendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
</template>
```

یک scoped slot با نام `day` نشانه‌گذاری سلول را یکسره عوض می‌کند، کنار همان ویژگی‌های
`data-jalali-calendar-*`، برای مصرف‌کننده‌ای که فقط می‌خواهد ظاهر را عوض کند نه اینکه
جایگزین کامل بسازد.

## `DatePicker`: انتخابگر کارآمد با ظاهر پیش‌فرض

`v-model` مقدار **ذخیره** را حمل می‌کند (شکل‌گرفته با `valueFormat`)، نه `CalendarDate` خام،
پس یک کانال نوشتن مؤثر است: انتخاب تاریخ مقدار بسته‌شده را مستقیم به‌روز می‌کند. مقدار را
دوباره نمی‌خواند (برگرداندن هر `valueFormat` به `CalendarDate` خارج از محدوده است)؛ برای
مقدار انتخاب اولیه به‌جای آن از `defaultDate` استفاده کنید.

```vue
<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
</script>

<template>
  <DatePicker v-model="stored" system="jalali" locale="fa" />
</template>
```

`variant="dropdown"` پاپ‌آپ شبکه تقویم را با سه `<select>` ساده سال/ماه/روز عوض می‌کند:

```vue
<DatePicker system="jalali" locale="en" variant="dropdown" />
```

در پاپ‌آپ شبکه (و مستقیم در `Calendar`)، شخص می‌تواند ماه یا سال سربرگ را کلیک کند تا مستقیم
به شبکه ماه یا شبکه سال برود، به‌جای ورق زدن ماه به ماه. این به‌صورت پیش‌فرض روشن است؛ برای
خاموش کردن `:quick-nav="false"` بدهید. برای بدون انتخاب اولیه `:default-date="null"` بدهید،
تا انتخابگر خالی باز شود و جایگاه‌نما را نشان دهد تا کسی تاریخ انتخاب کند.

## `useResolvedTimeZone()`

با تقویم `'zoned-datetime'` و `timeZone: 'auto'` زیر SSR جفت می‌شود. برخلاف Next.js، Nuxt
مفهوم جدا «مؤلفه کلاینت» برای opt-in ندارد: هر مؤلفه به‌صورت پیش‌فرض سرور-رندر و سپس
hydrate می‌شود، پس پیچیدن اضافه لازم نیست. `onMounted` داخلی composable پس از mount منطقه
زمانی واقعی مرورگر را دوباره حل می‌کند، بدون هشدار هیدراسیون.

```vue
<script setup lang="ts">
import { useResolvedTimeZone } from '@jalali-js/vue';

const timeZone = useResolvedTimeZone('auto'); // هنگام SSR برابر 'UTC'، پس از mount منطقه واقعی
</script>
```

## انتخابگر بازه، تقویم رویداد، و تقویم درون‌خطی

`@jalali-js/ui-vue` مقادیر `RangePicker`، `EventCalendar` و `InlineCalendar` را روی همان
پریمیتیوها اضافه می‌کند؛ ببینید
[پیکربندی و قالب ظاهری](/fa/guide/theming#range-picker-event-calendar-and-inline-calendar)
و [تقویم رویداد](/fa/guide/event-calendar).

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/ui-vue
```

== pnpm

```sh
pnpm add @jalali-js/ui-vue
```

== yarn

```sh
yarn add @jalali-js/ui-vue
```

:::

```vue
<script setup lang="ts">
import { EventCalendar, InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import { ref } from 'vue';

const storedRange = ref<RangeStorageValue>();
</script>

<template>
  <InlineCalendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
  <RangePicker v-model="storedRange" system="jalali" locale="en" />
  <EventCalendar system="jalali" locale="en" :events="events" @event-click="onEvent" />
</template>
```

## جدول‌های prop

SFCهای `.vue` در API تولیدشده نیستند. این جدول‌ها با `defineProps` در منبع هم‌خوانی دارند.

نکته اتصال: `DatePicker` و `RangePicker` برای مقدار ذخیره از `v-model` استفاده می‌کنند (کانال
نوشتن). با `defaultDate` / `defaultRange` مقدار اولیه بدهید. `Calendar` از `:value` و `@select`
استفاده می‌کند. `TimePicker` / `TimeRangePicker` رویداد `change` می‌فرستند. `EventCalendar`
رویدادهای `eventClick` و `dayClick` می‌فرستد.

### `DatePicker`

| Prop            | نوع                                        | پیش‌فرض           | معنا                            |
| --------------- | ------------------------------------------ | ----------------- | ------------------------------- |
| `system`        | `'jalali' \| 'gregorian'`                  | `'jalali'`        | تقویم نمایش                     |
| `locale`        | `'en' \| 'fa' \| 'ps'`                     | `'en'`            | زبان UI                         |
| `defaultDate`   | `CalendarDate \| CalendarDateTime \| null` | امروز             | انتخاب اولیه. `null` خالی است   |
| `precision`     | `'date' \| 'datetime'`                     | `'date'`          | فقط روز، یا روز به‌همراه زمان   |
| `minuteStep`    | `number`                                   | `1`               | گام دقیقه وقتی datetime است     |
| `disabledHours` | `number[]`                                 | -                 | ساعت‌های پنهان ۰ تا ۲۳          |
| `quickNav`      | `boolean`                                  | `true`            | شبکه‌های پرش ماه و سال          |
| `valueFormat`   | `ValueFormat`                              | `'gregorian-iso'` | شکل `v-model`                   |
| `displayFormat` | `FormatOptions`                            | -                 | قالب متن ورودی                  |
| `variant`       | `'grid' \| 'dropdown'`                     | `'grid'`          | popover شبکه یا selectهای Y/M/D |
| `rules`         | `SelectionRules`                           | -                 | حداقل/حداکثر و روزهای مسدود     |
| `showHolidays`  | `boolean`                                  | `false`           | علامت تعطیلات (جلالی)           |
| `blockHolidays` | `boolean`                                  | `false`           | مسدود کردن تعطیلات (جلالی)      |
| `holidayRegion` | `'IR' \| 'AF' \| 'TJ'`                     | `'IR'`            | بسته تعطیلات                    |
| `placeholder`   | `string`                                   | بسته زبان         | متن ورودی خالی                  |

### `Calendar` / `InlineCalendar`

| Prop                    | نوع                    | پیش‌فرض        | معنا                        |
| ----------------------- | ---------------------- | -------------- | --------------------------- |
| `system`                | `CalendarSystem`       | `'jalali'`     | تقویم نمایش                 |
| `locale`                | `LocaleCode`           | `'en'`         | زبان UI                     |
| `value`                 | `CalendarDate \| null` | `null`         | روز انتخاب‌شده              |
| `initialDisplayedMonth` | `{ year, month }`      | value یا امروز | ماه باز شدن                 |
| `quickNav`              | `boolean`              | `true`         | شبکه‌های پرش ماه و سال      |
| `rules`                 | `SelectionRules`       | -              | حداقل/حداکثر و روزهای مسدود |
| `showHolidays`          | `boolean`              | `false`        | علامت تعطیلات               |
| `blockHolidays`         | `boolean`              | `false`        | مسدود کردن تعطیلات          |
| `holidayRegion`         | `HolidayRegion`        | `'IR'`         | بسته تعطیلات                |

Emit: `select` با `CalendarDate` انتخاب‌شده.

### `TimePicker`

| Prop            | نوع          | پیش‌فرض                  | معنا                   |
| --------------- | ------------ | ------------------------ | ---------------------- |
| `value`         | `TimeOfDay`  | -                        | زمان کنترل‌شده         |
| `defaultValue`  | `TimeOfDay`  | `{ hour: 0, minute: 0 }` | مقدار اولیه بدون کنترل |
| `minuteStep`    | `number`     | `1`                      | گام گزینه‌های دقیقه    |
| `disabledHours` | `number[]`   | -                        | ساعت‌های پنهان         |
| `locale`        | `LocaleCode` | `'en'`                   | زبان رقم‌ها            |

Emit: `change` با `TimeOfDay`.

### `RangePicker` (`@jalali-js/ui-vue`)

| Prop            | نوع              | پیش‌فرض           | معنا               |
| --------------- | ---------------- | ----------------- | ------------------ |
| `system`        | `CalendarSystem` | `'jalali'`        | تقویم نمایش        |
| `locale`        | `LocaleCode`     | `'en'`            | زبان UI            |
| `defaultRange`  | `{ start, end }` | -                 | بازه اولیه         |
| `valueFormat`   | `ValueFormat`    | `'gregorian-iso'` | شکل `v-model`      |
| `displayFormat` | `FormatOptions`  | -                 | قالب متن ورودی     |
| `rules`         | `SelectionRules` | -                 | حد روز و بازه      |
| `showHolidays`  | `boolean`        | `false`           | علامت تعطیلات      |
| `blockHolidays` | `boolean`        | `false`           | مسدود کردن تعطیلات |
| `holidayRegion` | `HolidayRegion`  | `'IR'`            | بسته تعطیلات       |
| `placeholder`   | `string`         | -                 | متن ورودی خالی     |

### `TimeRangePicker` (`@jalali-js/ui-vue`)

| Prop            | نوع              | پیش‌فرض            | معنا                       |
| --------------- | ---------------- | ------------------ | -------------------------- |
| `locale`        | `LocaleCode`     | `'en'`             | زبان رقم‌ها                |
| `defaultRange`  | `{ start, end }` | `09:00` تا `17:00` | بازه اولیه                 |
| `minuteStep`    | `number`         | `1`                | گام دقیقه برای هر دو انتها |
| `disabledHours` | `number[]`       | -                  | ساعت‌های پنهان             |

Emit: `change` با بازه زمان.

### `EventCalendar` (`@jalali-js/ui-vue`)

ببینید [تقویم رویداد](/fa/guide/event-calendar). Propها با React هم‌خوان هستند، جز اینکه
callbackها به‌صورت emitهای `eventClick` و `dayClick` هستند.
