<script setup lang="ts">
/**
 * A start/end date-range picker built on the same grid-rendering approach as `Calendar`: it
 * cannot reuse `Calendar` directly since each cell needs range-specific state (start, end,
 * in-between, hover preview) that `Calendar`'s single-selection `data-selected` cannot express,
 * so it calls `buildCalendarGrid()` itself and renders its own cells.
 *
 * `v-model` carries the *storage* value (`{ start, end }`, each shaped by `valueFormat`), the
 * same write-channel pattern `DatePicker` uses (see its own doc comment and architecture.md's
 * "Display value against storage value"). It only updates once a full range (start and end) is
 * picked, not after the first click.
 *
 * Selection is two clicks: the first sets the start, the second sets the end and closes the
 * popover. Clicking before the current start restarts the range from the new point rather than
 * erroring, so a consumer never gets stuck. Hovering after a start is picked previews the range
 * that would result from completing the selection at the hovered day.
 *
 * With `rules`, blocked days render disabled, and a candidate range that crosses a blocked
 * day does not complete: the second click starts a new range instead (see
 * `isRangeSelectable()` in `jalali-js`).
 */
import { holidayDayChrome, resolveCalendarHolidays, type HolidayRegion } from '@jalali-js/holidays';
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  ValueFormat,
} from 'jalali-js';
import {
  buildCalendarGrid,
  compareDates,
  createCalendar,
  isRangeSelectable,
  nextMonth,
  previousMonth,
  toStorageValue,
  weekdayLabelsForGrid,
} from 'jalali-js';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { localePackFor, type LocaleCode } from '@jalali-js/vue';
import { positionPopover } from './position-popover.js';

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface RangeStorageValue {
  start: StorageValue;
  end: StorageValue;
}

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    defaultRange?: DateRange;
    valueFormat?: ValueFormat;
    displayFormat?: FormatOptions;
    /** Limits on what a person can select. Blocked days render disabled; a range that
     * crosses a blocked day does not complete. */
    rules?: SelectionRules | undefined;
    /** Mark official holidays with `data-holiday`. Jalali system only. Default: Iran. */
    showHolidays?: boolean;
    /** Also block holiday days through selection rules. Jalali system only. */
    blockHolidays?: boolean;
    /** Whose official holiday list to use. Default: `'IR'` (Iran). */
    holidayRegion?: HolidayRegion;
    placeholder?: string;
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    valueFormat: 'gregorian-iso',
    showHolidays: false,
    blockHolidays: false,
    holidayRegion: 'IR',
  },
);

const model = defineModel<RangeStorageValue>();

const localePack = computed(() => localePackFor(props.locale));
const resolvedPlaceholder = computed(
  () => props.placeholder ?? localePack.value.rangePickerPlaceholder,
);
const today = computed(() => createCalendar({ system: props.system }).today());
const start = ref<CalendarDate | null>(props.defaultRange?.start ?? null);
const end = ref<CalendarDate | null>(props.defaultRange?.end ?? null);
const hoverDate = ref<CalendarDate | null>(null);
const displayAnchor = props.defaultRange?.start ?? today.value;
const displayed = ref({ year: displayAnchor.year, month: displayAnchor.month });
const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const popoverId = useId();

const holidayOptions = computed(() =>
  resolveCalendarHolidays(props.system, displayed.value.year, displayed.value.month, {
    showHolidays: props.showHolidays,
    blockHolidays: props.blockHolidays,
    region: props.holidayRegion,
    rules: props.rules,
  }),
);

const weeks = computed(() =>
  buildCalendarGrid(
    props.system,
    displayed.value.year,
    displayed.value.month,
    today.value,
    null,
    holidayOptions.value.rules,
    holidayOptions.value.isHolidayDay,
  ),
);

const previewEnd = computed(() => end.value ?? hoverDate.value);

const displayText = computed(() => {
  if (!start.value) return '';
  const startText = formatDate(start.value, localePack.value, props.displayFormat);
  if (!end.value) return startText;
  return `${startText} – ${formatDate(end.value, localePack.value, props.displayFormat)}`;
});

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
  if (
    !start.value ||
    end.value ||
    compareDates(date, start.value) < 0 ||
    !isRangeSelectable(start.value, date, holidayOptions.value.rules)
  ) {
    start.value = date;
    end.value = null;
    return;
  }
  end.value = date;
  model.value = {
    start: toStorageValue(start.value, props.valueFormat),
    end: toStorageValue(date, props.valueFormat),
  };
  open.value = false;
}

function dayTipAttrs(cell: { date: CalendarDate; isHoliday: boolean; isSelectable: boolean }) {
  const { tip, ariaLabel } = holidayDayChrome(
    formatDate(cell.date, localePack.value, { style: 'long' }),
    cell,
    {
      locale: props.locale,
      region: props.holidayRegion,
      closedLabel: localePack.value.ui.closedDay,
    },
  );
  return { 'data-jalali-day-tip': tip, 'aria-label': ariaLabel };
}
function dayNumber(date: CalendarDate): string {
  return formatNumber(date.day, localePack.value.defaultNumerals, localePack.value.digits);
}

function onPointerDown(event: PointerEvent): void {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) open.value = false;
}
function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') open.value = false;
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
  } else {
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKeyDown);
  }
});

watch(
  [open, displayed],
  async ([isOpen], _old, onCleanup) => {
    if (!isOpen) return;
    await nextTick();
    const anchor = inputRef.value;
    const popover = popoverRef.value;
    if (!anchor || !popover) return;
    const update = () => positionPopover(anchor, popover);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    onCleanup(() => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    });
  },
  { flush: 'post' },
);

onMounted(() => {
  if (open.value) document.addEventListener('pointerdown', onPointerDown);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div ref="rootRef" :dir="localePack.direction" data-jalali-datepicker-root>
    <input
      ref="inputRef"
      type="text"
      readonly
      role="combobox"
      data-jalali-datepicker-input
      :placeholder="resolvedPlaceholder"
      :value="displayText"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="open ? popoverId : undefined"
      @click="open = !open"
    />
    <div
      v-if="open"
      ref="popoverRef"
      :id="popoverId"
      data-jalali-datepicker-popover
      role="dialog"
      :aria-label="localePack.ui.chooseDateRange"
    >
      <div :dir="localePack.direction" data-jalali-calendar-root>
        <div data-jalali-calendar-header>
          <button
            type="button"
            data-jalali-calendar-nav="previous"
            :aria-label="localePack.ui.previousMonth"
            @click="goPrevious"
          >
            ‹
          </button>
          <span data-jalali-calendar-title>{{ monthLabel }} {{ yearLabel }}</span>
          <button
            type="button"
            data-jalali-calendar-nav="next"
            :aria-label="localePack.ui.nextMonth"
            @click="goNext"
          >
            ›
          </button>
        </div>
        <div role="grid" data-jalali-calendar-grid>
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
            data-jalali-calendar-week
          >
            <button
              v-for="cell in week"
              :key="`${cell.date.year}-${cell.date.month}-${cell.date.day}`"
              type="button"
              role="gridcell"
              data-jalali-calendar-day
              :data-today="cell.isToday ? '' : undefined"
              :data-outside-month="cell.isCurrentMonth ? undefined : ''"
              :data-range-start="start && compareDates(cell.date, start) === 0 ? '' : undefined"
              :data-range-end="
                previewEnd && compareDates(cell.date, previewEnd) === 0 ? '' : undefined
              "
              :data-in-range="
                start &&
                previewEnd &&
                compareDates(cell.date, start) > 0 &&
                compareDates(cell.date, previewEnd) < 0
                  ? ''
                  : undefined
              "
              :data-disabled="cell.isSelectable ? undefined : ''"
              :data-holiday="cell.isHoliday ? '' : undefined"
              :disabled="!cell.isSelectable"
              :aria-current="cell.isToday ? 'date' : undefined"
              v-bind="dayTipAttrs(cell)"
              @click="selectDay(cell.date)"
              @mouseenter="hoverDate = cell.date"
              @mouseleave="hoverDate = null"
            >
              {{ dayNumber(cell.date) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
