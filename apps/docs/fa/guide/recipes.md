---
description: پاسخ‌های کوتاه آماده‌کپی برای کارهای رایج DatePicker.
---

# دستورالعمل‌ها

یک مثال کوتاه برای هر کار. مثال‌ها از React استفاده می‌کنند. نکته‌های Vue و Web وقتی
بایندینگ فرق دارد زیر هر دستورالعمل آمده است. همچنین ببینید [مثال‌ها](/fa/guide/examples).

## پیش‌فرض امروز

امروز دانه پیش‌فرض است. چیزی ندهید، یا امروز را صریح بدهید.

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

<DatePicker system="jalali" locale="fa" onChange={(value) => console.log(value)} />;
```

شروع خالی: `defaultDate={null}` (Vue با `:default-date="null"`، Web با `.defaultDate = null`).

## کران حداقل و حداکثر

```tsx
import { DatePicker } from '@jalali-js/react';

<DatePicker
  system="jalali"
  locale="en"
  rules={{
    minDate: { year: 1403, month: 1, day: 1 },
    maxDate: { year: 1403, month: 12, day: 29 },
  }}
/>;
```

## مسدود کردن آخر هفته

روزهای هفته جلالی یکشنبه = ۰ … شنبه = ۶. آخر هفته پنجشنبه/جمعه:

```tsx
<DatePicker system="jalali" locale="fa" rules={{ disabledWeekdays: [4, 5] }} />
```

## Epoch برای یک API

```tsx
<DatePicker
  system="jalali"
  locale="en"
  valueFormat="epoch"
  onChange={(value) => {
    // value یک عدد Unix epoch است (میلی‌ثانیه)
    fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ at: value }) });
  }}
/>
```

## ارسال فرم

```tsx
function BookingForm() {
  const [stored, setStored] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (stored) submitBooking(stored);
      }}
    >
      <DatePicker system="jalali" locale="fa" onChange={(value) => setStored(value)} />
      <button type="submit" disabled={!stored}>
        Book
      </button>
    </form>
  );
}
```

Vue: `v-model` را به مقدار ذخیره ببندید و همان ref را ارسال کنید. Web: از رویداد `change`
مقدار `event.detail.value` را بخوانید، یا `.value` عنصر را بخوانید.

## تنظیم، خواندن و پاک کردن برنامه‌ای

### React

`DatePicker` برای انتخاب بدون کنترل است. با `defaultDate` دانه بگذارید. برای خواندن وضعیت
خودتان را از `onChange` نگه دارید. برای پاک کردن یا بازنشانی با `key` تازه remount کنید.

```tsx
function ControlledShell() {
  const [seed, setSeed] = useState<CalendarDate | null>(null);
  const [stored, setStored] = useState<StorageValue | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() =>
          setSeed({ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 })
        }
      >
        Set 15 Mordad
      </button>
      <button type="button" onClick={() => setSeed(null)}>
        Clear
      </button>
      <DatePicker
        key={seed === null ? 'empty' : `${seed.year}-${seed.month}-${seed.day}`}
        system="jalali"
        locale="en"
        defaultDate={seed}
        onChange={(value) => setStored(value)}
      />
      <pre>{JSON.stringify(stored)}</pre>
    </>
  );
}
```

`Calendar` / `InlineCalendar` کنترل‌شده‌اند: `value` و `onSelect` را بدهید.

### Vue

`DatePicker` مقدار ذخیره را از طریق `v-model` می‌نویسد. با `defaultDate` دانه بگذارید. برای
پاک کردن با `:key` remount کنید. `Calendar` از `:value` و `@select` استفاده می‌کند.

```vue
<script setup lang="ts">
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
const seedKey = ref(0);
function clear() {
  stored.value = undefined;
  seedKey.value += 1;
}
</script>

<template>
  <DatePicker :key="seedKey" v-model="stored" system="jalali" locale="fa" :default-date="null" />
  <button type="button" @click="clear">Clear</button>
</template>
```

### Web Components

برای خواندن یا نوشتن انتخاب بدون ارسال رویداد، `.value` را تنظیم کنید. قبل از connect برای
دانه، `.defaultDate` را بگذارید. برای انتخاب کاربر به `change` گوش دهید.

```ts
const el = document.querySelector('jalali-date-picker')!;
el.defaultDate = null; // خالی تا کاربر انتخاب کند
el.addEventListener('change', (event) => {
  console.log(event.detail.value);
});
// بعداً
el.value = null; // پاک کردن، بدون رویداد change
console.log(el.value);
```

## SSR (Next.js / Nuxt)

CSS را در مرز کلاینت وارد کنید. برای propهایی که از سرور عبور می‌کنند، رشته‌های `valueFormat`
را بر اشیاء `Date` ترجیح دهید.

```tsx
'use client';
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

export function ClientPicker() {
  return <DatePicker system="jalali" locale="fa" />;
}
```

برای `'zoned-datetime'` با `timeZone: 'auto'`، از `useResolvedTimeZone('auto')` استفاده کنید
تا SSR و اولین رنگ کلاینت روی `'UTC'` بمانند. راهنماهای [React](/fa/guide/react) و
[Vue](/fa/guide/vue) را ببینید.
