---
description: قطعه‌های آماده‌کپی برای تبدیل، انتخابگر، بازه، NLP و قالب ظاهری.
---

# مثال‌ها

قطعه‌های کوتاه و مستقل برای کارهای رایج. هر کدام آماده‌کپی است: هر واردکردنی که لازم دارد
را نشان می‌دهد. برای پاسخ‌های شکل‌وظیفه (کران، epoch، فرم، SSR)، ببینید
[دستورالعمل‌ها](/fa/guide/recipes). برای مفاهیم، ببینید [شروع کار](/fa/guide/getting-started)،
[مفاهیم اصلی](/fa/guide/core-concepts)، و [پیکربندی و قالب ظاهری](/fa/guide/theming).

## تبدیل بین تقویم‌ها

```ts
import { toGregorian, fromGregorian } from 'jalali-js';

toGregorian({ year: 1403, month: 5, day: 15 }, 'jalali');
// { year: 2024, month: 8, day: 5 }

fromGregorian({ year: 2024, month: 8, day: 5 }, 'jalali');
// { year: 1403, month: 5, day: 15 }
```

## قالب‌بندی تاریخ برای نمایش

```ts
import { format, fa } from '@jalali-js/i18n';

const date = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

format(date, fa); // '۱۵ مرداد ۱۴۰۳'
format(date, fa, { weekday: true }); // 'دوشنبه، ۱۵ مرداد ۱۴۰۳'
format(date, fa, { numerals: 'latin' }); // '15 مرداد 1403'
```

## خواندن یک عبارت زبان طبیعی

```ts
import { parse } from '@jalali-js/nlp';

parse('tomorrow', 'en');
parse('فردا', 'fa');
parse('نن', 'ps'); // پشتو برای 'today'
parse('next Farvardin', 'en');
```

## React: فیلد تاریخی که میلادی ذخیره می‌کند و جلالی نشان می‌دهد

```tsx
import '@jalali-js/react/date-picker.css';
import { DatePicker } from '@jalali-js/react';

function BirthDateField() {
  return (
    <DatePicker
      system="jalali"
      locale="fa"
      onChange={(value) => {
        // value یک رشته ISO میلادی است، مثل '2024-08-05'. همین را ذخیره کنید.
      }}
    />
  );
}
```

## Vue: همان فیلد، با `v-model`

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

## Vanilla / Web Components: همان فیلد، بدون فریم‌ورک

```html
<jalali-date-picker id="birth-date" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('birth-date').addEventListener('change', (event) => {
    // event.detail.value یک رشته ISO میلادی است، مثل '2024-08-05'. همین را ذخیره کنید.
  });
</script>
```

## React: فیلد بازه تاریخ

```tsx
import '@jalali-js/react/date-picker.css';
import { RangePicker } from '@jalali-js/ui-react';

<RangePicker system="jalali" locale="en" onChange={(value) => console.log(value)} />;
```

## React: تقویم همیشه دیده‌شده، بدون popover

```tsx
import '@jalali-js/react/date-picker.css';
import { InlineCalendar } from '@jalali-js/ui-react';
import { useState } from 'react';
import type { CalendarDate } from 'jalali-js';

function EventDatePicker() {
  const [selected, setSelected] = useState<CalendarDate | null>(null);
  return <InlineCalendar system="jalali" locale="en" value={selected} onSelect={setSelected} />;
}
```

## React: تقویم رویداد (ماه، هفته، روز، یا timeline)

```tsx
import '@jalali-js/react/date-picker.css';
import { EventCalendar } from '@jalali-js/ui-react';
import type { CalendarEvent } from 'jalali-js';

const events: CalendarEvent[] = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
  {
    id: 'meeting',
    title: 'Meeting',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
    allDay: false,
    startTime: { hour: 14, minute: 0 },
    endTime: { hour: 15, minute: 0 },
  },
];

<EventCalendar
  system="jalali"
  locale="en"
  view="week"
  initialDate={{ year: 1403, month: 5, day: 15 }}
  events={events}
  onEventClick={console.log}
/>;
```

Timeline با چیدمان roadmap:

```tsx
<EventCalendar
  system="jalali"
  locale="fa"
  view="timeline"
  timeline={{ layout: 'roadmap', showIcons: true }}
  events={events}
/>
```

## تعطیلات با نوک راهنمای روز

```tsx
<DatePicker system="jalali" locale="fa" showHolidays blockHolidays />
```

برای خواندن نوک راهنما زیر شبکه، روی روز تعطیل hover یا focus کنید. ببینید
[تعطیلات](/fa/guide/holidays#انتخابگرها).

## یک قالب ظاهری سفارشی، بدون فایل قالب

ویژگی‌های سفارشی `--jalali-*` به ارث می‌رسند، پس بازنویسی خام روی عنصر پوششی می‌تواند به
مقداری که مستقیم روی ریشه خود انتخابگر نشسته ببازد، برای مثال اگر `dark.css` در همان صفحه
وارد شده باشد (ببینید [پیکربندی و قالب ظاهری](/fa/guide/theming)). به‌جای آن بازنویسی را زیر
یک کلاس والد محدود کنید، روی گزینشگری که خود عنصر ریشه را می‌گیرد:

```css
/* my-theme.css */
.my-theme [data-jalali-datepicker-root] {
  --jalali-primary: #c026d3;
  --jalali-primary-fg: #ffffff;
  --jalali-bg: #fdf4ff;
  --jalali-fg: #581c87;
  --jalali-radius: 20px;
}
```

```tsx
import '@jalali-js/react/date-picker.css';
import './my-theme.css';
import { DatePicker } from '@jalali-js/react';

<div className="my-theme">
  <DatePicker system="jalali" locale="en" />
</div>;
```
