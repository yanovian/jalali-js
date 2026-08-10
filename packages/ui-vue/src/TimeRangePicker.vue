<script setup lang="ts">
/**
 * Two `TimePicker`s side by side for a start and end time. Built on `@jalali-js/vue`'s
 * headless `TimePicker`. Import `@jalali-js/vue/date-picker.css` for the default look.
 */
import type { LocaleCode } from '@jalali-js/vue';
import { localePackFor, TimePicker } from '@jalali-js/vue';
import type { TimeOfDay } from 'jalali-js';
import { computed, ref } from 'vue';

export interface TimeRange {
  start: TimeOfDay;
  end: TimeOfDay;
}

const props = withDefaults(
  defineProps<{
    locale?: LocaleCode;
    defaultRange?: TimeRange;
    minuteStep?: number;
    disabledHours?: readonly number[] | undefined;
  }>(),
  {
    locale: 'en',
    defaultRange: () => ({
      start: { hour: 9, minute: 0 },
      end: { hour: 17, minute: 0 },
    }),
    minuteStep: 1,
  },
);

const emit = defineEmits<{ change: [range: TimeRange] }>();

const localePack = computed(() => localePackFor(props.locale));
const range = ref<TimeRange>({ ...props.defaultRange });

function update(next: TimeRange): void {
  range.value = next;
  emit('change', next);
}
</script>

<template>
  <div :dir="localePack.direction" data-jalali-timerangepicker-root>
    <TimePicker
      :locale="locale"
      :value="range.start"
      :minute-step="minuteStep"
      :disabled-hours="disabledHours"
      @change="(start) => update({ ...range, start })"
    />
    <span data-jalali-timerangepicker-separator aria-hidden="true">–</span>
    <TimePicker
      :locale="locale"
      :value="range.end"
      :minute-step="minuteStep"
      :disabled-hours="disabledHours"
      @change="(end) => update({ ...range, end })"
    />
  </div>
</template>
