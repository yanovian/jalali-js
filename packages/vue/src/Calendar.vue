<script setup lang="ts">
/**
 * A headless month grid: it renders plain markup with data attributes (`data-selected`,
 * `data-today`, `data-outside-month`) and no required CSS, so a consumer can restyle it
 * completely. A `day` scoped slot lets a consumer replace the cell markup outright while
 * keeping the grid and header structure. `DatePicker` is this same component with a default
 * stylesheet and a popover wrapped around it.
 */
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarGridDay, CalendarSystem } from 'jalali-js';
import { buildCalendarGrid, createCalendar, nextMonth, previousMonth } from 'jalali-js';
import { computed, ref } from 'vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    value?: CalendarDate | null;
    initialDisplayedMonth?: { year: number; month: number };
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    value: null,
  },
);

const emit = defineEmits<{ select: [date: CalendarDate] }>();

const localePack = computed(() => localePackFor(props.locale));
const today = computed(() => createCalendar({ system: props.system }).today());
const displayed = ref(
  props.initialDisplayedMonth ??
    (props.value
      ? { year: props.value.year, month: props.value.month }
      : { year: today.value.year, month: today.value.month }),
);

const weeks = computed<CalendarGridDay[][]>(() =>
  buildCalendarGrid(
    props.system,
    displayed.value.year,
    displayed.value.month,
    today.value,
    props.value,
  ),
);

const monthLabel = computed(
  () => localePack.value.monthNames[props.system].long[displayed.value.month - 1],
);
const yearLabel = computed(() =>
  formatNumber(displayed.value.year, localePack.value.defaultNumerals, localePack.value.digits),
);

function goNext(): void {
  displayed.value = nextMonth(props.system, displayed.value.year, displayed.value.month);
}
function goPrevious(): void {
  displayed.value = previousMonth(props.system, displayed.value.year, displayed.value.month);
}
function selectDay(date: CalendarDate): void {
  emit('select', date);
}
function dayLabel(cell: CalendarGridDay): string {
  return formatDate(cell.date, localePack.value, { style: 'long' });
}
function dayNumber(cell: CalendarGridDay): string {
  return formatNumber(cell.date.day, localePack.value.defaultNumerals, localePack.value.digits);
}
</script>

<template>
  <div :dir="localePack.direction" data-jalali-calendar-root>
    <div data-jalali-calendar-header>
      <button
        type="button"
        data-jalali-calendar-nav="previous"
        aria-label="Previous month"
        @click="goPrevious"
      >
        {{ localePack.direction === 'rtl' ? '›' : '‹' }}
      </button>
      <span data-jalali-calendar-title>{{ monthLabel }} {{ yearLabel }}</span>
      <button type="button" data-jalali-calendar-nav="next" aria-label="Next month" @click="goNext">
        {{ localePack.direction === 'rtl' ? '‹' : '›' }}
      </button>
    </div>
    <div role="grid" data-jalali-calendar-grid>
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
      <div v-for="(week, weekIndex) in weeks" :key="weekIndex" role="row" data-jalali-calendar-week>
        <slot
          v-for="cell in week"
          :key="`${cell.date.year}-${cell.date.month}-${cell.date.day}`"
          name="day"
          :cell="cell"
          :select="selectDay"
        >
          <button
            type="button"
            role="gridcell"
            data-jalali-calendar-day
            :data-selected="cell.isSelected ? '' : undefined"
            :data-today="cell.isToday ? '' : undefined"
            :data-outside-month="cell.isCurrentMonth ? undefined : ''"
            :aria-selected="cell.isSelected"
            :aria-current="cell.isToday ? 'date' : undefined"
            :aria-label="dayLabel(cell)"
            @click="selectDay(cell.date)"
          >
            {{ dayNumber(cell) }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>
