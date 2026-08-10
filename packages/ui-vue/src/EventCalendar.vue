<script setup lang="ts">
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import { localePackFor, type LocaleCode } from '@jalali-js/vue';
import type {
  CalendarDate,
  CalendarDateFields,
  CalendarEvent,
  CalendarSystem,
  EventCalendarView,
} from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  dayOfWeek,
  daysForEventView,
  eventIsAllDay,
  findEventById,
  isSameDay,
  laneCountOf,
  layoutDaysTimedEvents,
  layoutMonthEvents,
  layoutWeekEvents,
  listHours,
  shiftEventViewAnchor,
  timedBlockStyle,
} from 'jalali-js';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    view?: EventCalendarView;
    events?: readonly CalendarEvent[];
    initialDisplayedMonth?: { year: number; month: number };
    initialDate?: CalendarDateFields;
    displayFormat?: FormatOptions;
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
  props.view === 'month' ? null : daysForEventView(props.system, props.view, anchor.value),
);
const allDayEvents = computed(() => props.events.filter(eventIsAllDay));
const allDaySegments = computed(() =>
  periodDays.value ? layoutWeekEvents(allDayEvents.value, periodDays.value) : [],
);
const timedLayouts = computed(() =>
  periodDays.value ? layoutDaysTimedEvents(props.events, periodDays.value) : [],
);
const allDayLaneCount = computed(() => laneCountOf(allDaySegments.value));

const title = computed(() => {
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

const previousGlyph = computed(() => (localePack.value.direction === 'rtl' ? '›' : '‹'));
const nextGlyph = computed(() => (localePack.value.direction === 'rtl' ? '‹' : '›'));
const navLabel = computed(() =>
  props.view === 'month' ? 'month' : props.view === 'week' ? 'week' : 'day',
);
const hours = listHours();

function onEventClick(eventId: string, click: MouseEvent): void {
  click.stopPropagation();
  const matched = findEventById(props.events, eventId);
  if (matched) emit('eventClick', matched);
}
</script>

<template>
  <div
    :dir="localePack.direction"
    data-jalali-calendar-root
    data-jalali-eventcalendar-root
    :data-view="view"
  >
    <div data-jalali-calendar-header>
      <button
        type="button"
        data-jalali-calendar-nav="previous"
        :aria-label="`Previous ${navLabel}`"
        @click="anchor = shiftEventViewAnchor(system, view, anchor, -1)"
      >
        {{ previousGlyph }}
      </button>
      <span data-jalali-calendar-title>{{ title }}</span>
      <button
        type="button"
        data-jalali-calendar-nav="next"
        :aria-label="`Next ${navLabel}`"
        @click="anchor = shiftEventViewAnchor(system, view, anchor, 1)"
      >
        {{ nextGlyph }}
      </button>
    </div>

    <div
      v-if="view === 'month' && weeks && monthLayouts"
      role="grid"
      data-jalali-calendar-grid
      data-jalali-eventcalendar-grid
    >
      <div role="row" data-jalali-calendar-weekdays>
        <span
          v-for="(name, index) in localePack.weekdayNames.short"
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

    <div v-else-if="periodDays" data-jalali-eventcalendar-period>
      <div
        data-jalali-eventcalendar-days
        :style="{ gridTemplateColumns: `repeat(${periodDays.length}, minmax(0, 1fr))` }"
      >
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
          gridTemplateColumns: `repeat(${periodDays.length}, minmax(0, 1fr))`,
          gridTemplateRows: allDayLaneCount > 0 ? `repeat(${allDayLaneCount}, auto)` : undefined,
        }"
      >
        <button
          v-for="segment in allDaySegments"
          :key="`${segment.eventId}-${segment.startWeekday}-${segment.lane}`"
          type="button"
          data-jalali-eventcalendar-event
          :data-continues-before="segment.continuesBefore ? '' : undefined"
          :data-continues-after="segment.continuesAfter ? '' : undefined"
          data-all-day=""
          :style="{
            gridColumn: `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`,
            gridRow: segment.lane + 1,
          }"
          @click="onEventClick(segment.eventId, $event)"
        >
          {{ segment.title }}
        </button>
      </div>
      <div
        data-jalali-eventcalendar-timed
        :style="{ gridTemplateColumns: `auto repeat(${periodDays.length}, minmax(0, 1fr))` }"
      >
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
  </div>
</template>
