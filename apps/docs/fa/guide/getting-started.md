---
description: هسته یا یک بایندینگ فریم‌ورک را نصب کنید، سپس تاریخ را تبدیل کنید یا یک انتخابگر بسازید.
---

# شروع کار

## نصب

:::tabs key:pm variant:code
== npm

```sh
npm install jalali-js
# React
npm install @jalali-js/react
# Vue
npm install @jalali-js/vue
# بدون فریم‌ورک: Web Components ساده
npm install @jalali-js/web
```

== pnpm

```sh
pnpm add jalali-js
# React
pnpm add @jalali-js/react
# Vue
pnpm add @jalali-js/vue
# بدون فریم‌ورک: Web Components ساده
pnpm add @jalali-js/web
```

== yarn

```sh
yarn add jalali-js
# React
yarn add @jalali-js/react
# Vue
yarn add @jalali-js/vue
# بدون فریم‌ورک: Web Components ساده
yarn add @jalali-js/web
```

:::

`jalali-js` بسته هسته است: TypeScript خالص، بدون وابستگی به فریم‌ورک، و بدون وابستگی
زمان اجرا. `@jalali-js/react`، `@jalali-js/vue` و `@jalali-js/web` همه به آن وابسته‌اند.
`@jalali-js/web` به هیچ فریم‌ورکی نیاز ندارد: Web Components ساده است و از HTML/JS معمولی
یا داخل هر فریم‌ورک مثل هر عنصر HTML دیگر کار می‌کند (ببینید
[Vanilla / Web Components](/fa/guide/web-components)). `@jalali-js/i18n` (داده زبان و
قالب‌بندی)، `@jalali-js/nlp` (پردازش زبان طبیعی تاریخ)، و `@jalali-js/holidays`
(تعطیلات رسمی ایران) بسته‌های جدا هستند و فقط وقتی مستقیم لازم دارید نصب می‌شوند.
هر بایندینگ خودش به `@jalali-js/i18n` وابسته است، و انتخابگرها می‌توانند تعطیلات ایران را با
`showHolidays` علامت بزنند (ببینید [تعطیلات](/fa/guide/holidays)).

## تبدیل یک تاریخ

```ts
import { createCalendar, toGregorian, fromGregorian } from 'jalali-js';

const jalali = createCalendar({ system: 'jalali' });
jalali.today(); // { year: 1403, month: 5, day: 15 }

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali');
// { year: 2024, month: 8, day: 5 }

fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali');
// { year: 1403, month: 5, day: 15 }
```

`system` برابر `'jalali'` یا `'gregorian'` است. تبدیل میلادی به میلادی تبدیل هویت است،
عمداً: تا کد برنامه «سامانه تقویم» را یک تنظیم بداند، نه یک حالت خاص (ببینید
[مفاهیم اصلی](/fa/guide/core-concepts)).

## ساخت انتخابگر (React)

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

function BirthDateField() {
  return (
    <DatePicker
      system="jalali"
      locale="fa"
      onChange={(value) => {
        // value به‌صورت پیش‌فرض یک رشته ISO میلادی است: '2024-08-05'.
        // برای دلیل و روش خروج از این رفتار، «مقدار نمایشی در برابر مقدار ذخیره‌سازی» را ببینید.
      }}
    />
  );
}
```

## ساخت انتخابگر (Vue)

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

## ساخت انتخابگر (بدون فریم‌ورک)

```html
<jalali-date-picker id="birth-date" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('birth-date').addEventListener('change', (event) => {
    // event.detail.value به‌صورت پیش‌فرض یک رشته ISO میلادی است: '2024-08-05'.
  });
</script>
```

بعدی: [مفاهیم اصلی](/fa/guide/core-concepts) لایه‌های دقت و شکاف نمایش/ذخیره را پوشش
می‌دهد که این مثال‌ها بر آن تکیه دارند.
