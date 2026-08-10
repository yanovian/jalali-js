<script setup lang="ts">
/**
 * A working, default-styled date picker built on `Calendar` (the headless primitive) and
 * `DropdownDateFields`. With `precision: 'datetime'`, a `TimePicker` sits under the grid.
 * Import `@jalali-js/vue/date-picker.css` for its default appearance, or style
 * `[data-jalali-datepicker-*]` yourself; nothing about the component requires the stylesheet
 * to function.
 *
 * `v-model` carries the *storage* value (shaped by `valueFormat`, `'gregorian-iso'` by
 * default), not the raw calendar value, since that is what an app keeps in its own state (see
 * architecture.md's "Display value against storage value"). This makes `v-model` an effective
 * write channel: picking a date updates the bound value. It does not read a value back in,
 * since inverting every `valueFormat` back to a calendar value is out of scope here; use
 * `defaultDate` to seed the initial selection instead.
 */
import type { FormatOptions, LocalePack } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarDateTime,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  TimeOfDay,
  ValueFormat,
} from 'jalali-js';
import { createCalendar, timeOfDay, toStorageValue, withTime } from 'jalali-js';
import { computed, onBeforeUnmount, onMounted, ref, useId, watch, type Ref } from 'vue';
import Calendar from './Calendar.vue';
import DropdownDateFields from './DropdownDateFields.vue';
import TimePicker from './TimePicker.vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

export type DatePickerPrecision = 'date' | 'datetime';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    /** The initial selection. Default: today, in `system`. Pass `null` for no initial
     * selection, so the picker opens empty and shows `placeholder` until a person picks a
     * date. */
    defaultDate?: CalendarDate | CalendarDateTime | null;
    /** `'date'` (default) selects a day only. `'datetime'` adds a time panel under the grid. */
    precision?: DatePickerPrecision;
    /** Minute options step for the time panel. Default: 1. */
    minuteStep?: number;
    /** Hours that do not appear in the time panel (0-23). */
    disabledHours?: readonly number[] | undefined;
    /** Let a person click the month or year in the grid popover's header to jump straight to
     * a month grid or a year grid. Default: true. Has no effect on the dropdown variant. */
    quickNav?: boolean;
    valueFormat?: ValueFormat;
    displayFormat?: FormatOptions;
    variant?: 'grid' | 'dropdown';
    /** Limits on what a person can select. Grid variant only; see `Calendar`'s `rules`. */
    rules?: SelectionRules | undefined;
    placeholder?: string;
  }>(),
  {
    system: 'jalali',
    locale: 'en',
    precision: 'date',
    minuteStep: 1,
    valueFormat: 'gregorian-iso',
    variant: 'grid',
  },
);

const model = defineModel<StorageValue>();

const localePack = computed(() => localePackFor(props.locale));
const resolvedPlaceholder = computed(
  () => props.placeholder ?? localePack.value.datePickerPlaceholder,
);
const today = computed(() => createCalendar({ system: props.system }).today());
const date = ref<CalendarDate | CalendarDateTime | null>(null) as Ref<
  CalendarDate | CalendarDateTime | null
>;
date.value = (() => {
  if (props.defaultDate === null) return null;
  const seed = props.defaultDate ?? today.value;
  if (props.precision === 'date') {
    return {
      precision: 'date' as const,
      system: seed.system,
      year: seed.year,
      month: seed.month,
      day: seed.day,
    };
  }
  return seed.precision === 'datetime' ? seed : withTime(seed, { hour: 0, minute: 0 });
})();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const popoverId = useId();

const calendarValue = computed<CalendarDate | null>(() =>
  date.value
    ? {
        precision: 'date',
        system: date.value.system,
        year: date.value.year,
        month: date.value.month,
        day: date.value.day,
      }
    : null,
);

const currentTime = computed<TimeOfDay>(() =>
  date.value ? timeOfDay(date.value) : { hour: 0, minute: 0 },
);

function displayValue(
  value: CalendarDate | CalendarDateTime,
  pack: LocalePack,
  displayFormat: FormatOptions | undefined,
): string {
  const datePart = formatDate(value, pack, displayFormat);
  if (value.precision === 'date') return datePart;
  const hour = formatNumber(value.hour, pack.defaultNumerals, pack.digits, 2);
  const minute = formatNumber(value.minute, pack.defaultNumerals, pack.digits, 2);
  return `${datePart} ${hour}:${minute}`;
}

const inputValue = computed(() =>
  date.value ? displayValue(date.value, localePack.value, props.displayFormat) : '',
);

function emit(next: CalendarDate | CalendarDateTime): void {
  date.value = next;
  model.value = toStorageValue(next, props.valueFormat);
}

function selectDay(next: CalendarDate): void {
  const time = date.value ? timeOfDay(date.value) : { hour: 0, minute: 0 };
  emit(props.precision === 'datetime' ? withTime(next, time) : next);
  if (props.precision === 'date') open.value = false;
}

function selectTime(time: TimeOfDay): void {
  emit(withTime(date.value ?? today.value, time));
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

onMounted(() => {
  if (open.value) document.addEventListener('pointerdown', onPointerDown);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div v-if="variant === 'dropdown'" :dir="localePack.direction" data-jalali-datepicker-root>
    <DropdownDateFields
      :system="system"
      :locale="locale"
      :date="calendarValue ?? today"
      @change="selectDay"
    />
    <TimePicker
      v-if="precision === 'datetime'"
      :locale="locale"
      :value="currentTime"
      :minute-step="minuteStep"
      :disabled-hours="disabledHours"
      @change="selectTime"
    />
  </div>
  <div v-else ref="rootRef" :dir="localePack.direction" data-jalali-datepicker-root>
    <input
      type="text"
      readonly
      role="combobox"
      data-jalali-datepicker-input
      :placeholder="resolvedPlaceholder"
      :value="inputValue"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="open ? popoverId : undefined"
      @click="open = !open"
    />
    <div
      v-if="open"
      :id="popoverId"
      data-jalali-datepicker-popover
      role="dialog"
      :aria-label="precision === 'datetime' ? 'Choose a date and time' : 'Choose a date'"
    >
      <Calendar
        :system="system"
        :locale="locale"
        :value="calendarValue"
        :quick-nav="quickNav"
        :rules="rules"
        @select="selectDay"
      />
      <TimePicker
        v-if="precision === 'datetime'"
        :locale="locale"
        :value="currentTime"
        :minute-step="minuteStep"
        :disabled-hours="disabledHours"
        @change="selectTime"
      />
    </div>
  </div>
</template>
