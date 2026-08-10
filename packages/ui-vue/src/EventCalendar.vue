<script setup lang="ts">
/**
 * Month event calendar. The consumer owns the event list and editing UI.
 * This component only lays events out and fires click callbacks.
 */
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import { localePackFor, type LocaleCode } from '@jalali-js/vue';
import type { CalendarDate, CalendarEvent, CalendarSystem } from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  findEventById,
  layoutMonthEvents,
  nextMonth,
  previousMonth,
} from 'jalali-js';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    events?: readonly CalendarEvent[];
    initialDisplayedMonth?: { year: number; month: number };
    displayFormat?: FormatOptions;
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    events: () => [],
  },
);

const emit = defineEmits<{
  eventClick: [event: CalendarEvent];
  dayClick: [date: CalendarDate];
}>();

const localePack = computed(() => localePackFor(props.locale));
const today = computed(() => createCalendar({ system: props.system }).today());
const displayed = ref(
  props.initialDisplayedMonth ?? { year: today.value.year, month: today.value.month },
);

const weeks = computed(() =>
  buildCalendarGrid(props.system, displayed.value.year, displayed.value.month, today.value, null),
);
const weekLayouts = computed(() => layoutMonthEvents(props.events, weeks.value));

const monthLabel = computed(
  () => localePack.value.monthNames[props.system].long[displayed.value.month - 1],
);
const yearLabel = computed(() =>
  formatNumber(displayed.value.year, localePack.value.defaultNumerals, localePack.value.digits),
);
const previousGlyph = computed(() => (localePack.value.direction === 'rtl' ? '›' : '‹'));
const nextGlyph = computed(() => (localePack.value.direction === 'rtl' ? '‹' : '›'));

function laneCount(weekIndex: number): number {
  const segments = weekLayouts.value[weekIndex] ?? [];
  return segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0);
}

function onEventClick(eventId: string, click: MouseEvent): void {
  click.stopPropagation();
  const matched = findEventById(props.events, eventId);
  if (matched) emit('eventClick', matched);
}
</script>

<template>
  <div :dir="localePack.direction" data-jalali-calendar-root data-jalali-eventcalendar-root>
    <div data-jalali-calendar-header>
      <button
        type="button"
        data-jalali-calendar-nav="previous"
        aria-label="Previous month"
        @click="displayed = previousMonth(system, displayed.year, displayed.month)"
      >
        {{ previousGlyph }}
      </button>
      <span data-jalali-calendar-title>{{ monthLabel }} {{ yearLabel }}</span>
      <button
        type="button"
        data-jalali-calendar-nav="next"
        aria-label="Next month"
        @click="displayed = nextMonth(system, displayed.year, displayed.month)"
      >
        {{ nextGlyph }}
      </button>
    </div>
    <div role="grid" data-jalali-calendar-grid data-jalali-eventcalendar-grid>
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
            laneCount(weekIndex) > 0
              ? { gridTemplateRows: `repeat(${laneCount(weekIndex)}, auto)` }
              : undefined
          "
        >
          <button
            v-for="segment in weekLayouts[weekIndex] ?? []"
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
  </div>
</template>
