---
description: Month, week, and day event calendars with consumer-owned events.
---

# Event calendar

Show your own events on a calendar. The library lays events out. You own storage and editing.

## Scope

- `view` is `'month'` (default), `'week'`, or `'day'`.
- Ships in `@jalali-js/ui-react`, `@jalali-js/ui-vue`, and `@jalali-js/ui-web`.
- Recurring rules do not expand inside the library. Expand them, then pass flat `CalendarEvent` rows.

## Event model

`CalendarEvent` lives in `jalali-js` (core):

| Field                   | Meaning                                                 |
| ----------------------- | ------------------------------------------------------- |
| `id`                    | Stable id for clicks and layout keys.                   |
| `title`                 | Label on the event chip.                                |
| `start` / `end`         | Inclusive date fields in the displayed calendar system. |
| `allDay`                | Optional. Default is true when no times are set.        |
| `startTime` / `endTime` | Optional times of day for timed events.                 |

Layout helpers (`layoutMonthEvents`, `layoutWeekEvents`, `layoutDayTimedEvents`, and related)
are pure functions, next to `buildCalendarGrid()`.

## Views

- **Month**: all-day style chips on the month grid.
- **Week** / **Day**: an all-day row plus a 24-hour timed grid. Timed events use
  `startTime` / `endTime`. Overlaps get side-by-side lanes.

Set the anchor with `initialDisplayedMonth` (month) or `initialDate` (week and day).

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

## Styling

Import the same `date-picker.css` as the other pickers. Event chips use
`data-jalali-eventcalendar-*` and the `--jalali-event-bg` / `--jalali-event-fg` variables.
