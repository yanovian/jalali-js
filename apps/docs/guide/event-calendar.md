---
description: Month, week, day, and timeline event calendars with consumer-owned events.
---

# Event calendar

Show your own events on a calendar. The library lays events out. You own storage and editing.

## Scope

- `view` is `'month'` (default), `'week'`, `'day'`, or `'timeline'`.
- Ships in `@jalali-js/ui-react`, `@jalali-js/ui-vue`, and `@jalali-js/ui-web`.
- Recurring rules do not expand inside the library. Expand them, then pass flat `CalendarEvent` rows.

## Event model

`CalendarEvent` lives in `jalali-js` (core):

| Field                   | Meaning                                                 |
| ----------------------- | ------------------------------------------------------- |
| `id`                    | Stable id for clicks and layout keys.                   |
| `title`                 | Label on the event chip or timeline card.               |
| `start` / `end`         | Inclusive date fields in the displayed calendar system. |
| `allDay`                | Optional. Default is true when no times are set.        |
| `startTime` / `endTime` | Optional times of day for timed events.                 |
| `description`           | Optional body text for timeline cards.                  |
| `color`                 | Optional CSS color for timeline accent.                 |
| `icon`                  | Optional short marker icon (emoji or text).             |

Layout helpers (`layoutMonthEvents`, `layoutWeekEvents`, `layoutDayTimedEvents`,
`eventsForTimeline`, and related) are pure functions, next to `buildCalendarGrid()`.

## Views

- **Month**: all-day style chips on the month grid.
- **Week** / **Day**: an all-day row plus a 24-hour timed grid. Timed events use
  `startTime` / `endTime`. Overlaps get side-by-side lanes.
- **Timeline**: a chronological list with a rail, marker, and accent card.
  Dates and times use `@jalali-js/i18n` (`format`, `formatNumber`, locale
  digits, and `displayFormat.numerals`). Pick a card layout with
  `timeline.layout` (see below).

Set the anchor with `initialDisplayedMonth` (month) or `initialDate` (week and day).
Timeline does not use prev/next month navigation.

## Timeline options

Pass a `timeline` object when `view` is `'timeline'`:

| Field         | Type                                     | Default      | Meaning                                                                       |
| ------------- | ---------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `direction`   | `'vertical' \| 'horizontal'`             | `'vertical'` | Rail orientation                                                              |
| `markerShape` | `'circular' \| 'square'`                 | `'circular'` | Marker shape                                                                  |
| `showIcons`   | `boolean`                                | `true`       | Show `event.icon` in the marker                                               |
| `layout`      | `'single' \| 'alternating' \| 'roadmap'` | `'single'`   | Card placement beside the rail                                                |
| `alternating` | `boolean`                                | `false`      | Legacy alias: `true` maps to `layout: 'alternating'` when `layout` is omitted |
| `markerSize`  | `number`                                 | CSS default  | Marker diameter in CSS pixels                                                 |

`layout` values:

- **`single`**: every card on one side of a straight rail (default).
- **`alternating`**: cards on both sides of a straight center rail.
- **`roadmap`**: serpentine dashed road with markers on the curve peaks.
  Horizontal `direction` falls back from `roadmap` to `alternating`.

Native digits come from the locale pack (`fa` / `ps`) or from
`displayFormat.numerals` (`'native'` or `'latin'`).

On narrow viewports, both-sided layouts collapse to a single-sided rail.

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

Timeline example:

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

For timeline, set `el.view = 'timeline'`, `el.timeline = { ... }`, and
`el.displayFormat = { numerals: 'native' }` as needed.

## Props (React)

| Prop                    | Type                                       | Default    | Meaning              |
| ----------------------- | ------------------------------------------ | ---------- | -------------------- |
| `system`                | `CalendarSystem`                           | `'jalali'` | Display calendar     |
| `locale`                | `LocaleCode`                               | `'en'`     | UI language          |
| `view`                  | `'month' \| 'week' \| 'day' \| 'timeline'` | `'month'`  | Visible view         |
| `events`                | `CalendarEvent[]`                          | `[]`       | Events to layout     |
| `initialDisplayedMonth` | `{ year, month }`                          | -          | Month anchor (day 1) |
| `initialDate`           | `{ year, month, day }`                     | today      | Week or day anchor   |
| `displayFormat`         | `FormatOptions`                            | -          | Day and stamp format |
| `timeline`              | `TimelineOptions`                          | -          | Timeline layout      |
| `onEventClick`          | `(event) => void`                          | -          | Event chip clicked   |
| `onDayClick`            | `(date) => void`                           | -          | Day cell clicked     |
| `className`             | `string`                                   | -          | Root class           |

Vue: same props, emits `eventClick` and `dayClick`. Web: attrs `system`, `locale`,
`view`; props `events`, `initialDisplayedMonth`, `initialDate`, `displayFormat`,
`timeline`; events `event-click`, `day-click`.

## Styling

Import the same `date-picker.css` as the other pickers. Event chips use
`data-jalali-eventcalendar-*` and the `--jalali-event-bg` / `--jalali-event-fg`
variables. Timeline uses `data-jalali-timeline-*`, `data-layout`, and tokens such
as `--jalali-timeline-marker-size`, `--jalali-timeline-accent`, and the
`--jalali-timeline-road-*` set for `layout: 'roadmap'`. When
`timeline.markerSize` is omitted, the stylesheet default marker size applies.
See [Configuration and theming](/guide/theming) for the full variable list.
