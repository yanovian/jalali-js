<script setup lang="ts">
/**
 * A headless hour and minute picker. It renders two `<select>`s with
 * `data-jalali-timepicker-*` attributes and no required CSS. Import
 * `@jalali-js/vue/date-picker.css` for the default look, the same stylesheet
 * `DatePicker` uses.
 */
import { formatNumber } from '@jalali-js/i18n';
import type { TimeOfDay } from 'jalali-js';
import { listHours, listMinutes, snapMinute } from 'jalali-js';
import { computed, ref } from 'vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

const props = withDefaults(
  defineProps<{
    /** The selected time. When set, the picker is controlled. */
    value?: TimeOfDay | undefined;
    /** The initial time when `value` is unset. Default: midnight. */
    defaultValue?: TimeOfDay;
    /** Minute options step (1, 5, 15, 30, ...). Default: 1. */
    minuteStep?: number;
    /** Hours that do not appear in the hour list (0-23). */
    disabledHours?: readonly number[] | undefined;
    locale?: LocaleCode;
  }>(),
  {
    defaultValue: () => ({ hour: 0, minute: 0 }),
    minuteStep: 1,
    locale: 'en',
  },
);

const emit = defineEmits<{ change: [time: TimeOfDay] }>();

const localePack = computed(() => localePackFor(props.locale));
const internal = ref<TimeOfDay>({
  hour: props.defaultValue.hour,
  minute: snapMinute(props.defaultValue.minute, props.minuteStep),
});
const time = computed(() => props.value ?? internal.value);
const hours = computed(() => listHours(props.disabledHours));
const minutes = computed(() => listMinutes(props.minuteStep));

function digit(n: number): string {
  return formatNumber(n, localePack.value.defaultNumerals, localePack.value.digits, 2);
}

function emitTime(next: TimeOfDay): void {
  if (props.value === undefined) internal.value = next;
  emit('change', next);
}

function onHourChange(event: Event): void {
  emitTime({ ...time.value, hour: Number((event.target as HTMLSelectElement).value) });
}

function onMinuteChange(event: Event): void {
  emitTime({ ...time.value, minute: Number((event.target as HTMLSelectElement).value) });
}
</script>

<template>
  <div :dir="localePack.direction" data-jalali-timepicker-root>
    <select
      :aria-label="localePack.ui.hour"
      data-jalali-timepicker-field="hour"
      :value="time.hour"
      @change="onHourChange"
    >
      <option v-for="hour in hours" :key="hour" :value="hour">{{ digit(hour) }}</option>
    </select>
    <span data-jalali-timepicker-separator aria-hidden="true">:</span>
    <select
      :aria-label="localePack.ui.minute"
      data-jalali-timepicker-field="minute"
      :value="snapMinute(time.minute, minuteStep)"
      @change="onMinuteChange"
    >
      <option v-for="minute in minutes" :key="minute" :value="minute">{{ digit(minute) }}</option>
    </select>
  </div>
</template>
