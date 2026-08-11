<script setup lang="ts">
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber, formatTimelineStamp } from '@jalali-js/i18n';
import { localePackFor, type LocaleCode } from '@jalali-js/vue';
import type {
  CalendarDate,
  CalendarDateFields,
  CalendarEvent,
  CalendarSystem,
  EventCalendarView,
  TimelineOptions,
} from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  dayOfWeek,
  daysForEventView,
  eventIsAllDay,
  eventsForTimeline,
  findEventById,
  isSameDay,
  laneCountOf,
  layoutDaysTimedEvents,
  layoutMonthEvents,
  layoutWeekEvents,
  listHours,
  resolveTimelineLayout,
  shiftEventViewAnchor,
  timedBlockStyle,
  timelineAccentFor,
  timelineEventDateTime,
  weekdayLabelsForGrid,
} from 'jalali-js';
import { computed, ref, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    view?: EventCalendarView;
    events?: readonly CalendarEvent[];
    initialDisplayedMonth?: { year: number; month: number };
    initialDate?: CalendarDateFields;
    displayFormat?: FormatOptions;
    timeline?: TimelineOptions;
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    view: 'month',
    events: () => [],
  },
);

const emit = defineEmits<{
  eventClick: [event: CalendarEvent];
  dayClick: [date: CalendarDate];
}>();

const localePack = computed(() => localePackFor(props.locale));
const today = computed(() => createCalendar({ system: props.system }).today());
const anchor = ref<CalendarDateFields>(
  props.initialDate
    ? { ...props.initialDate }
    : props.initialDisplayedMonth
      ? { ...props.initialDisplayedMonth, day: 1 }
      : { year: today.value.year, month: today.value.month, day: today.value.day },
);

const weeks = computed(() =>
  props.view === 'month'
    ? buildCalendarGrid(props.system, anchor.value.year, anchor.value.month, today.value, null)
    : null,
);
const monthLayouts = computed(() =>
  weeks.value ? layoutMonthEvents(props.events, weeks.value) : null,
);

const periodDays = computed(() =>
  props.view === 'week' || props.view === 'day'
    ? daysForEventView(props.system, props.view, anchor.value)
    : null,
);
const allDayEvents = computed(() => props.events.filter(eventIsAllDay));
const allDaySegments = computed(() =>
  periodDays.value ? layoutWeekEvents(allDayEvents.value, periodDays.value) : [],
);
const timedLayouts = computed(() =>
  periodDays.value ? layoutDaysTimedEvents(props.events, periodDays.value) : [],
);
const allDayLaneCount = computed(() => laneCountOf(allDaySegments.value));
const timelineEvents = computed(() =>
  props.view === 'timeline' ? eventsForTimeline(props.events) : null,
);

const title = computed(() => {
  if (props.view === 'timeline') {
    if (!timelineEvents.value?.length) return 'Timeline';
    const first = timelineEvents.value[0]!;
    const last = timelineEvents.value[timelineEvents.value.length - 1]!;
    const start = formatDate(
      { precision: 'date', system: props.system, ...first.start },
      localePack.value,
      props.displayFormat ?? { style: 'short' },
    );
    const end = formatDate(
      { precision: 'date', system: props.system, ...last.start },
      localePack.value,
      props.displayFormat ?? { style: 'short' },
    );
    return start === end ? start : `${start} – ${end}`;
  }
  if (props.view === 'month') {
    const monthLabel = localePack.value.monthNames[props.system].long[anchor.value.month - 1];
    const yearLabel = formatNumber(
      anchor.value.year,
      localePack.value.defaultNumerals,
      localePack.value.digits,
    );
    return `${monthLabel} ${yearLabel}`;
  }
  if (!periodDays.value?.length) return '';
  if (props.view === 'day') {
    return formatDate(
      periodDays.value[0]!,
      localePack.value,
      props.displayFormat ?? { style: 'long' },
    );
  }
  const start = formatDate(periodDays.value[0]!, localePack.value, { style: 'short' });
  const end = formatDate(periodDays.value[periodDays.value.length - 1]!, localePack.value, {
    style: 'short',
  });
  return `${start} – ${end}`;
});

const previousLabel = computed(() =>
  props.view === 'month'
    ? localePack.value.ui.previousMonth
    : props.view === 'week'
      ? localePack.value.ui.previousWeek
      : localePack.value.ui.previousDay,
);
const nextLabel = computed(() =>
  props.view === 'month'
    ? localePack.value.ui.nextMonth
    : props.view === 'week'
      ? localePack.value.ui.nextWeek
      : localePack.value.ui.nextDay,
);
const hours = listHours();
const titleId = useId();
const direction = computed(() => props.timeline?.direction ?? 'vertical');
const markerShape = computed(() => props.timeline?.markerShape ?? 'circular');
const showIcons = computed(() => props.timeline?.showIcons ?? true);
const layout = computed(() => {
  const resolved = resolveTimelineLayout(props.timeline);
  return direction.value === 'horizontal' && resolved === 'road' ? 'alternating' : resolved;
});
const markerSize = computed(() => props.timeline?.markerSize);

function onEventClick(eventId: string, click: MouseEvent): void {
  click.stopPropagation();
  const matched = findEventById(props.events, eventId);
  if (matched) emit('eventClick', matched);
}
</script>

<template>
  <div
    :dir="localePack.direction"
    role="region"
    :aria-labelledby="titleId"
    data-jalali-calendar-root
    data-jalali-eventcalendar-root
    :data-view="view"
  >
    <div v-if="view !== 'timeline'" data-jalali-calendar-header>
      <button
        type="button"
        data-jalali-calendar-nav="previous"
        :aria-label="previousLabel"
        @click="anchor = shiftEventViewAnchor(system, view, anchor, -1)"
      >
        ‹
      </button>
      <span :id="titleId" data-jalali-calendar-title>{{ title }}</span>
      <button
        type="button"
        data-jalali-calendar-nav="next"
        :aria-label="nextLabel"
        @click="anchor = shiftEventViewAnchor(system, view, anchor, 1)"
      >
        ›
      </button>
    </div>
    <div v-else data-jalali-calendar-header data-jalali-timeline-header="">
      <span :id="titleId" data-jalali-calendar-title>{{ title }}</span>
    </div>

    <div
      v-if="view === 'month' && weeks && monthLayouts"
      role="grid"
      :aria-labelledby="titleId"
      data-jalali-calendar-grid
      data-jalali-eventcalendar-grid
    >
      <div role="row" data-jalali-calendar-weekdays>
        <span
          v-for="(name, index) in weekdayLabelsForGrid(localePack.weekdayNames.short, system)"
          :key="index"
          role="columnheader"
          data-jalali-calendar-weekday
        >
          {{ name }}
        </span>
      </div>
      <div
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        role="row"
        data-jalali-eventcalendar-week
      >
        <div data-jalali-eventcalendar-days>
          <button
            v-for="cell in week"
            :key="`${cell.date.year}-${cell.date.month}-${cell.date.day}`"
            type="button"
            role="gridcell"
            data-jalali-calendar-day
            :data-today="cell.isToday ? '' : undefined"
            :data-outside-month="cell.isCurrentMonth ? undefined : ''"
            :aria-current="cell.isToday ? 'date' : undefined"
            :aria-label="formatDate(cell.date, localePack, displayFormat ?? { style: 'long' })"
            @click="emit('dayClick', cell.date)"
          >
            {{ formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits) }}
          </button>
        </div>
        <div
          data-jalali-eventcalendar-lanes
          :style="
            laneCountOf(monthLayouts[weekIndex] ?? []) > 0
              ? { gridTemplateRows: `repeat(${laneCountOf(monthLayouts[weekIndex] ?? [])}, auto)` }
              : undefined
          "
        >
          <button
            v-for="segment in monthLayouts[weekIndex] ?? []"
            :key="`${segment.eventId}-${segment.startWeekday}-${segment.lane}`"
            type="button"
            data-jalali-eventcalendar-event
            :data-continues-before="segment.continuesBefore ? '' : undefined"
            :data-continues-after="segment.continuesAfter ? '' : undefined"
            :data-all-day="segment.allDay ? '' : undefined"
            :style="{
              gridColumn: `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`,
              gridRow: segment.lane + 1,
            }"
            @click="onEventClick(segment.eventId, $event)"
          >
            {{ segment.title }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="(view === 'week' || view === 'day') && periodDays"
      role="region"
      tabindex="0"
      :aria-labelledby="titleId"
      data-jalali-eventcalendar-period
      :style="{ '--jalali-event-cols': periodDays.length }"
    >
      <div data-jalali-eventcalendar-days>
        <span data-jalali-eventcalendar-gutter aria-hidden="true" />
        <button
          v-for="day in periodDays"
          :key="`${day.year}-${day.month}-${day.day}`"
          type="button"
          data-jalali-calendar-day
          :data-today="isSameDay(day, today) ? '' : undefined"
          :aria-current="isSameDay(day, today) ? 'date' : undefined"
          :aria-label="formatDate(day, localePack, displayFormat ?? { style: 'long' })"
          @click="emit('dayClick', day)"
        >
          <span data-jalali-eventcalendar-dayname>
            {{ localePack.weekdayNames.short[dayOfWeek(day, system)] }}
          </span>
          {{ formatNumber(day.day, localePack.defaultNumerals, localePack.digits) }}
        </button>
      </div>
      <div
        data-jalali-eventcalendar-lanes
        data-jalali-eventcalendar-allday
        :style="{
          gridTemplateRows: allDayLaneCount > 0 ? `repeat(${allDayLaneCount}, auto)` : undefined,
        }"
      >
        <span
          data-jalali-eventcalendar-gutter
          aria-hidden="true"
          :style="allDayLaneCount > 0 ? { gridRow: `1 / ${allDayLaneCount + 1}` } : undefined"
        />
        <button
          v-for="segment in allDaySegments"
          :key="`${segment.eventId}-${segment.startWeekday}-${segment.lane}`"
          type="button"
          data-jalali-eventcalendar-event
          :data-continues-before="segment.continuesBefore ? '' : undefined"
          :data-continues-after="segment.continuesAfter ? '' : undefined"
          data-all-day=""
          :style="{
            gridColumn: `${segment.startWeekday + 2} / ${segment.endWeekday + 3}`,
            gridRow: segment.lane + 1,
          }"
          @click="onEventClick(segment.eventId, $event)"
        >
          {{ segment.title }}
        </button>
      </div>
      <div role="region" tabindex="0" :aria-labelledby="titleId" data-jalali-eventcalendar-timed>
        <div data-jalali-eventcalendar-hours>
          <span v-for="hour in hours" :key="hour" data-jalali-eventcalendar-hour>
            {{ formatNumber(hour, localePack.defaultNumerals, localePack.digits) }}
          </span>
        </div>
        <div
          v-for="(day, dayIndex) in periodDays"
          :key="`${day.year}-${day.month}-${day.day}`"
          data-jalali-eventcalendar-daycol
        >
          <button
            v-for="block in timedLayouts[dayIndex] ?? []"
            :key="`${block.eventId}-${block.startMinute}-${block.lane}`"
            type="button"
            data-jalali-eventcalendar-event
            data-timed=""
            :style="timedBlockStyle(block, Math.max(1, laneCountOf(timedLayouts[dayIndex] ?? [])))"
            @click="onEventClick(block.eventId, $event)"
          >
            {{ block.title }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="view === 'timeline' && timelineEvents"
      :role="direction === 'horizontal' ? 'region' : undefined"
      :tabindex="direction === 'horizontal' ? 0 : undefined"
      :aria-labelledby="direction === 'horizontal' ? titleId : undefined"
      :data-jalali-timeline-scroll="direction === 'horizontal' ? '' : undefined"
    >
      <ol
        data-jalali-timeline
        :data-direction="direction"
        :data-layout="layout"
        :data-marker-shape="markerShape"
        :data-show-icons="showIcons ? '' : undefined"
        :style="
          markerSize != null ? { '--jalali-timeline-marker-size': `${markerSize}px` } : undefined
        "
      >
        <li
          v-for="(event, index) in timelineEvents"
          :key="event.id"
          data-jalali-timeline-item
          :data-side="layout === 'single' ? 'end' : index % 2 === 0 ? 'end' : 'start'"
          :style="{ '--jalali-timeline-accent': timelineAccentFor(index, event.color) }"
        >
          <div data-jalali-timeline-marker aria-hidden="true">
            <span v-if="showIcons && event.icon" data-jalali-timeline-icon>{{ event.icon }}</span>
          </div>
          <button type="button" data-jalali-timeline-card @click="onEventClick(event.id, $event)">
            <time data-jalali-timeline-when :datetime="timelineEventDateTime(event)">
              {{
                formatTimelineStamp(
                  event.start,
                  system,
                  localePack,
                  displayFormat ?? {},
                  event.startTime,
                )
              }}
            </time>
            <span data-jalali-timeline-title>{{ event.title }}</span>
            <span v-if="event.description" data-jalali-timeline-description>
              {{ event.description }}
            </span>
          </button>
        </li>
      </ol>
    </div>
  </div>
</template>
