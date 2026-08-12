---
description: تقویم‌های رویداد ماه، هفته، روز و timeline با رویدادهای متعلق به مصرف‌کننده.
---

# تقویم رویداد

رویدادهای خودتان را روی تقویم نشان دهید. کتابخانه رویدادها را می‌چیند. ذخیره و ویرایش مال شماست.

## محدوده

- `view` برابر `'month'` (پیش‌فرض)، `'week'`، `'day'`، یا `'timeline'` است.
- در `@jalali-js/ui-react`، `@jalali-js/ui-vue` و `@jalali-js/ui-web` ارسال می‌شود.
- قواعد تکرار داخل کتابخانه باز نمی‌شوند. آن‌ها را باز کنید، سپس ردیف‌های تخت `CalendarEvent` را بدهید.

## مدل رویداد

`CalendarEvent` در `jalali-js` (هسته) زندگی می‌کند:

| فیلد                    | معنا                                               |
| ----------------------- | -------------------------------------------------- |
| `id`                    | شناسه پایدار برای کلیک و کلیدهای چیدمان.           |
| `title`                 | برچسب روی تراشه رویداد یا کارت timeline.           |
| `start` / `end`         | فیلدهای تاریخ شامل در سامانه تقویم نمایش‌داده‌شده. |
| `allDay`                | اختیاری. وقتی زمان گذاشته نشود پیش‌فرض true است.   |
| `startTime` / `endTime` | زمان روز اختیاری برای رویدادهای زمان‌دار.          |
| `description`           | متن بدنه اختیاری برای کارت‌های timeline.           |
| `color`                 | رنگ CSS اختیاری برای تأکید timeline.               |
| `icon`                  | نشانگر کوتاه اختیاری (ایموجی یا متن).              |

کمک‌تابع‌های چیدمان (`layoutMonthEvents`، `layoutWeekEvents`، `layoutDayTimedEvents`،
`eventsForTimeline` و مرتبط) تابع خالص هستند، کنار `buildCalendarGrid()`.

## نماها

- **ماه**: تراشه‌های سبک تمام‌روز روی شبکه ماه.
- **هفته** / **روز**: یک ردیف تمام‌روز به‌همراه شبکه زمان‌دار ۲۴ ساعته. رویدادهای زمان‌دار از
  `startTime` / `endTime` استفاده می‌کنند. هم‌پوشانی‌ها خطوط کنارهم می‌گیرند.
- **Timeline**: فهرست زمانی با ریل، نشانگر، و کارت تأکید.
  تاریخ و زمان از `@jalali-js/i18n` استفاده می‌کنند (`format`، `formatNumber`، رقم‌های زبان،
  و `displayFormat.numerals`). چیدمان کارت را با `timeline.layout` برگزینید (پایین را ببینید).

لنگر را با `initialDisplayedMonth` (ماه) یا `initialDate` (هفته و روز) بگذارید.
Timeline از ناوبری ماه قبل/بعد استفاده نمی‌کند.

## گزینه‌های Timeline

وقتی `view` برابر `'timeline'` است، یک شیء `timeline` بدهید:

| فیلد          | نوع                                      | پیش‌فرض      | معنا                                                                                  |
| ------------- | ---------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `direction`   | `'vertical' \| 'horizontal'`             | `'vertical'` | جهت ریل                                                                               |
| `markerShape` | `'circular' \| 'square'`                 | `'circular'` | شکل نشانگر                                                                            |
| `showIcons`   | `boolean`                                | `true`       | نشان دادن `event.icon` در نشانگر                                                      |
| `layout`      | `'single' \| 'alternating' \| 'roadmap'` | `'single'`   | جای کارت کنار ریل                                                                     |
| `alternating` | `boolean`                                | `false`      | نام مستعار قدیمی: وقتی `layout` نباشد، `true` به `layout: 'alternating'` نگاشت می‌شود |
| `markerSize`  | `number`                                 | پیش‌فرض CSS  | قطر نشانگر به پیکسل CSS                                                               |

مقدارهای `layout`:

- **`single`**: همه کارت‌ها یک طرف ریل مستقیم (پیش‌فرض).
- **`alternating`**: کارت‌ها دو طرف ریل مستقیم مرکزی.
- **`roadmap`**: جاده مارپیچ خط‌چین با نشانگر روی قله منحنی‌ها.
  `direction` افقی از `roadmap` به `alternating` برمی‌گردد.

رقم بومی از بسته زبان (`fa` / `ps`) یا از `displayFormat.numerals` (`'native'` یا `'latin'`)
می‌آید.

روی نماهای باریک، چیدمان‌های دوطرفه به ریل یک‌طرفه جمع می‌شوند.

## React

```tsx
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
  onEventClick={(event) => console.log(event.id)}
  onDayClick={(date) => console.log(date)}
/>;
```

مثال Timeline:

```tsx
<EventCalendar
  system="jalali"
  locale="fa"
  view="timeline"
  displayFormat={{ numerals: 'native', template: 'YYYY/MM/DD' }}
  timeline={{
    direction: 'vertical',
    markerShape: 'circular',
    showIcons: true,
    layout: 'roadmap',
    markerSize: 28,
  }}
  events={[
    {
      id: 'start',
      title: 'آغاز پروژه',
      description: 'شروع رسمی کار',
      start: { year: 1403, month: 10, day: 26 },
      end: { year: 1403, month: 10, day: 26 },
      startTime: { hour: 9, minute: 0 },
      color: '#22c55e',
      icon: '◎',
    },
  ]}
/>
```

## Vue

```vue
<script setup lang="ts">
import { EventCalendar } from '@jalali-js/ui-vue';
import type { CalendarEvent } from 'jalali-js';

const events: CalendarEvent[] = [
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
</script>

<template>
  <EventCalendar
    system="jalali"
    locale="en"
    view="day"
    :initial-date="{ year: 1403, month: 5, day: 15 }"
    :events="events"
    @event-click="(event) => console.log(event.id)"
    @day-click="(date) => console.log(date)"
  />
</template>
```

## Web Components

```ts
import '@jalali-js/ui-web';

const el = document.querySelector('jalali-event-calendar')!;
el.view = 'week';
el.initialDate = { year: 1403, month: 5, day: 15 };
el.events = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
];
el.addEventListener('event-click', (event) => {
  console.log(event.detail.event);
});
```

```html
<jalali-event-calendar system="jalali" locale="en" view="week"></jalali-event-calendar>
```

برای timeline، در صورت نیاز `el.view = 'timeline'`، `el.timeline = { ... }` و
`el.displayFormat = { numerals: 'native' }` را بگذارید.

## Propها (React)

| Prop                    | نوع                                        | پیش‌فرض    | معنا                  |
| ----------------------- | ------------------------------------------ | ---------- | --------------------- |
| `system`                | `CalendarSystem`                           | `'jalali'` | تقویم نمایش           |
| `locale`                | `LocaleCode`                               | `'en'`     | زبان UI               |
| `view`                  | `'month' \| 'week' \| 'day' \| 'timeline'` | `'month'`  | نمای دیده‌شده         |
| `events`                | `CalendarEvent[]`                          | `[]`       | رویدادها برای چیدمان  |
| `initialDisplayedMonth` | `{ year, month }`                          | -          | لنگر ماه (روز ۱)      |
| `initialDate`           | `{ year, month, day }`                     | امروز      | لنگر هفته یا روز      |
| `displayFormat`         | `FormatOptions`                            | -          | قالب روز و مهر زمانی  |
| `timeline`              | `TimelineOptions`                          | -          | چیدمان timeline       |
| `onEventClick`          | `(event) => void`                          | -          | کلیک روی تراشه رویداد |
| `onDayClick`            | `(date) => void`                           | -          | کلیک روی سلول روز     |
| `className`             | `string`                                   | -          | کلاس ریشه             |

Vue: همان propها، با emitهای `eventClick` و `dayClick`. Web: ویژگی‌های `system`، `locale`،
`view`؛ propهای `events`، `initialDisplayedMonth`، `initialDate`، `displayFormat`،
`timeline`؛ رویدادهای `event-click`، `day-click`.

## قالب ظاهری

همان `date-picker.css` دیگر انتخابگرها را وارد کنید. تراشه‌های رویداد از
`data-jalali-eventcalendar-*` و متغیرهای `--jalali-event-bg` / `--jalali-event-fg`
استفاده می‌کنند. Timeline از `data-jalali-timeline-*`، `data-layout`، و توکن‌هایی مثل
`--jalali-timeline-marker-size`، `--jalali-timeline-accent`، و مجموعه
`--jalali-timeline-road-*` برای `layout: 'roadmap'` استفاده می‌کند. وقتی
`timeline.markerSize` حذف شود، اندازه نشانگر پیش‌فرض stylesheet اعمال می‌شود.
فهرست کامل متغیرها را در [پیکربندی و قالب ظاهری](/fa/guide/theming) ببینید.
