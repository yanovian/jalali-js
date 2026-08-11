<script setup lang="ts">
/**
 * The `variant: 'dropdown'` alternative to the calendar-grid popup: three plain `<select>`
 * elements. Better suited than a grid to narrow, known-range entry such as a date of birth
 * (see architecture.md's "Configuration and theming").
 */
import { formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { getCalendarEngine } from 'jalali-js';
import { computed } from 'vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

const props = defineProps<{
  system: CalendarSystem;
  locale: LocaleCode;
  date: CalendarDate;
  /** Inclusive year range for the year `<select>`. Default: 100 years back, 10 years forward. */
  yearRange?: readonly [number, number];
}>();

const emit = defineEmits<{ change: [date: CalendarDate] }>();

const localePack = computed(() => localePackFor(props.locale));
const engine = computed(() => getCalendarEngine(props.system));
const bounds = computed<readonly [number, number]>(
  () => props.yearRange ?? [props.date.year - 100, props.date.year + 10],
);
const years = computed(() => {
  const [minYear, maxYear] = bounds.value;
  const list: number[] = [];
  for (let year = maxYear; year >= minYear; year--) list.push(year);
  return list;
});
const daysInSelectedMonth = computed(() =>
  engine.value.daysInMonth(props.date.year, props.date.month),
);

function onYearChange(event: Event): void {
  const year = Number((event.target as HTMLSelectElement).value);
  const day = Math.min(props.date.day, engine.value.daysInMonth(year, props.date.month));
  emit('change', { ...props.date, year, day });
}
function onMonthChange(event: Event): void {
  const month = Number((event.target as HTMLSelectElement).value);
  const day = Math.min(props.date.day, engine.value.daysInMonth(props.date.year, month));
  emit('change', { ...props.date, month, day });
}
function onDayChange(event: Event): void {
  const day = Number((event.target as HTMLSelectElement).value);
  emit('change', { ...props.date, day });
}
</script>

<template>
  <div :dir="localePack.direction" data-jalali-datepicker-dropdown>
    <select
      :aria-label="localePack.ui.year"
      data-jalali-datepicker-field="year"
      :value="date.year"
      @change="onYearChange"
    >
      <option v-for="year in years" :key="year" :value="year">
        {{ formatNumber(year, localePack.defaultNumerals, localePack.digits) }}
      </option>
    </select>
    <select
      :aria-label="localePack.ui.month"
      data-jalali-datepicker-field="month"
      :value="date.month"
      @change="onMonthChange"
    >
      <option
        v-for="(name, index) in localePack.monthNames[system].long"
        :key="name"
        :value="index + 1"
      >
        {{ name }}
      </option>
    </select>
    <select
      :aria-label="localePack.ui.day"
      data-jalali-datepicker-field="day"
      :value="date.day"
      @change="onDayChange"
    >
      <option v-for="day in daysInSelectedMonth" :key="day" :value="day">
        {{ formatNumber(day, localePack.defaultNumerals, localePack.digits) }}
      </option>
    </select>
  </div>
</template>
