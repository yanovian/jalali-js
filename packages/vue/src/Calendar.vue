<script setup lang="ts">
/**
 * A headless month grid: it renders plain markup with data attributes (`data-selected`,
 * `data-today`, `data-outside-month`) and no required CSS, so a consumer can restyle it
 * completely. A `day` scoped slot lets a consumer replace the cell markup outright while
 * keeping the grid and header structure. `DatePicker` is this same component with a default
 * stylesheet and a popover wrapped around it.
 *
 * With `quickNav` (default on), clicking the month or year in the header opens a month grid or
 * a year grid, so a person can jump years ahead without paging one month at a time. Picking a
 * year moves to the month grid; picking a month moves to the day grid.
 */
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarGridDay, CalendarSystem } from 'jalali-js';
import { buildCalendarGrid, createCalendar, nextMonth, previousMonth } from 'jalali-js';
import { computed, ref } from 'vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

const YEARS_PER_PAGE = 12;

function yearPageStart(year: number): number {
  return year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);
}

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    value?: CalendarDate | null;
    initialDisplayedMonth?: { year: number; month: number };
    /** Let a person click the month or year in the header to jump straight to a month grid or
     * a year grid, instead of paging one month at a time. Default: true. */
    quickNav?: boolean;
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    value: null,
    quickNav: true,
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
const view = ref<'day' | 'month' | 'year'>('day');
const yearPage = ref(yearPageStart(displayed.value.year));

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
const previousGlyph = computed(() => (localePack.value.direction === 'rtl' ? '›' : '‹'));
const nextGlyph = computed(() => (localePack.value.direction === 'rtl' ? '‹' : '›'));
const titleTag = computed(() => (props.quickNav ? 'button' : 'span'));
const yearPageLabel = computed(() => {
  const start = formatNumber(
    yearPage.value,
    localePack.value.defaultNumerals,
    localePack.value.digits,
  );
  const end = formatNumber(
    yearPage.value + YEARS_PER_PAGE - 1,
    localePack.value.defaultNumerals,
    localePack.value.digits,
  );
  return `${start} – ${end}`;
});
const months = computed(() =>
  localePack.value.monthNames[props.system].long.map((name, index) => {
    const month = index + 1;
    return {
      name,
      month,
      isSelected: displayed.value.month === month,
      isCurrent: today.value.year === displayed.value.year && today.value.month === month,
    };
  }),
);
const years = computed(() =>
  Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPage.value + index).map((year) => ({
    year,
    label: formatNumber(year, localePack.value.defaultNumerals, localePack.value.digits),
    isSelected: displayed.value.year === year,
    isCurrent: today.value.year === year,
  })),
);

function goNext(): void {
  displayed.value = nextMonth(props.system, displayed.value.year, displayed.value.month);
}
function goPrevious(): void {
  displayed.value = previousMonth(props.system, displayed.value.year, displayed.value.month);
}
function goNextYearInMonthView(): void {
  displayed.value = { ...displayed.value, year: displayed.value.year + 1 };
}
function goPreviousYearInMonthView(): void {
  displayed.value = { ...displayed.value, year: displayed.value.year - 1 };
}
function goNextYearPage(): void {
  yearPage.value += YEARS_PER_PAGE;
}
function goPreviousYearPage(): void {
  yearPage.value -= YEARS_PER_PAGE;
}
function openMonthView(): void {
  view.value = 'month';
}
function openYearView(): void {
  yearPage.value = yearPageStart(displayed.value.year);
  view.value = 'year';
}
function pickMonth(month: number): void {
  displayed.value = { ...displayed.value, month };
  view.value = 'day';
}
function pickYear(year: number): void {
  displayed.value = { ...displayed.value, year };
  view.value = 'month';
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
  <div :dir="localePack.direction" data-jalali-calendar-root :data-jalali-calendar-view="view">
    <template v-if="view === 'day'">
      <div data-jalali-calendar-header>
        <button
          type="button"
          data-jalali-calendar-nav="previous"
          aria-label="Previous month"
          @click="goPrevious"
        >
          {{ previousGlyph }}
        </button>
        <div data-jalali-calendar-title>
          <component
            :is="titleTag"
            :type="quickNav ? 'button' : undefined"
            data-jalali-calendar-title-month
            :aria-label="quickNav ? 'Choose month' : undefined"
            @click="openMonthView"
          >
            {{ monthLabel }}
          </component>
          <component
            :is="titleTag"
            :type="quickNav ? 'button' : undefined"
            data-jalali-calendar-title-year
            :aria-label="quickNav ? 'Choose year' : undefined"
            @click="openYearView"
          >
            {{ yearLabel }}
          </component>
        </div>
        <button
          type="button"
          data-jalali-calendar-nav="next"
          aria-label="Next month"
          @click="goNext"
        >
          {{ nextGlyph }}
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
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          role="row"
          data-jalali-calendar-week
        >
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
    </template>

    <template v-else-if="view === 'month'">
      <div data-jalali-calendar-header>
        <button
          type="button"
          data-jalali-calendar-nav="previous"
          aria-label="Previous year"
          @click="goPreviousYearInMonthView"
        >
          {{ previousGlyph }}
        </button>
        <div data-jalali-calendar-title>
          <component
            :is="titleTag"
            :type="quickNav ? 'button' : undefined"
            data-jalali-calendar-title-year
            :aria-label="quickNav ? 'Choose year' : undefined"
            @click="openYearView"
          >
            {{ yearLabel }}
          </component>
        </div>
        <button
          type="button"
          data-jalali-calendar-nav="next"
          aria-label="Next year"
          @click="goNextYearInMonthView"
        >
          {{ nextGlyph }}
        </button>
      </div>
      <div role="listbox" aria-label="Month" data-jalali-calendar-months>
        <button
          v-for="item in months"
          :key="item.name"
          type="button"
          role="option"
          data-jalali-calendar-month
          :data-selected="item.isSelected ? '' : undefined"
          :data-today="item.isCurrent ? '' : undefined"
          :aria-selected="item.isSelected"
          :aria-current="item.isCurrent ? 'true' : undefined"
          @click="pickMonth(item.month)"
        >
          {{ item.name }}
        </button>
      </div>
    </template>

    <template v-else>
      <div data-jalali-calendar-header>
        <button
          type="button"
          data-jalali-calendar-nav="previous"
          aria-label="Previous years"
          @click="goPreviousYearPage"
        >
          {{ previousGlyph }}
        </button>
        <span data-jalali-calendar-title>{{ yearPageLabel }}</span>
        <button
          type="button"
          data-jalali-calendar-nav="next"
          aria-label="Next years"
          @click="goNextYearPage"
        >
          {{ nextGlyph }}
        </button>
      </div>
      <div role="listbox" aria-label="Year" data-jalali-calendar-years>
        <button
          v-for="item in years"
          :key="item.year"
          type="button"
          role="option"
          data-jalali-calendar-year
          :data-selected="item.isSelected ? '' : undefined"
          :data-today="item.isCurrent ? '' : undefined"
          :aria-selected="item.isSelected"
          :aria-current="item.isCurrent ? 'true' : undefined"
          @click="pickYear(item.year)"
        >
          {{ item.label }}
        </button>
      </div>
    </template>
  </div>
</template>
