<script setup lang="ts">
/**
 * A working, default-styled date picker built on `Calendar` (the headless primitive) and
 * `DropdownDateFields`. Import `@jalali-js/vue/date-picker.css` for its default appearance, or
 * style `[data-jalali-datepicker-*]` yourself; nothing about the component requires the
 * stylesheet to function.
 *
 * `v-model` carries the *storage* value (shaped by `valueFormat`, `'gregorian-iso'` by
 * default), not the raw `CalendarDate`, since that is what an app keeps in its own state (see
 * architecture.md's "Display value against storage value"). This makes `v-model` an effective
 * write channel: picking a date updates the bound value. It does not read a value back in,
 * since inverting every `valueFormat` back to a `CalendarDate` is out of scope here; use
 * `defaultDate` to seed the initial selection instead.
 */
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  ValueFormat,
} from 'jalali-js';
import { createCalendar, toStorageValue } from 'jalali-js';
import { onBeforeUnmount, onMounted, ref, useId, watch, computed, type Ref } from 'vue';
import Calendar from './Calendar.vue';
import DropdownDateFields from './DropdownDateFields.vue';
import { localePackFor, type LocaleCode } from './use-calendar.js';

const props = withDefaults(
  defineProps<{
    system?: CalendarSystem;
    locale?: LocaleCode;
    /** The initial selection. Default: today, in `system`. Pass `null` for no initial
     * selection, so the picker opens empty and shows `placeholder` until a person picks a
     * date. */
    defaultDate?: CalendarDate | null;
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
const date = ref<CalendarDate | null>(
  props.defaultDate === null ? null : (props.defaultDate ?? today.value),
) as Ref<CalendarDate | null>;
const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const popoverId = useId();

function selectDate(next: CalendarDate): void {
  date.value = next;
  model.value = toStorageValue(next, props.valueFormat);
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
  <DropdownDateFields
    v-if="variant === 'dropdown'"
    :system="system"
    :locale="locale"
    :date="date ?? today"
    @change="selectDate"
  />
  <div v-else ref="rootRef" :dir="localePack.direction" data-jalali-datepicker-root>
    <input
      type="text"
      readonly
      role="combobox"
      data-jalali-datepicker-input
      :placeholder="resolvedPlaceholder"
      :value="date ? formatDate(date, localePack, displayFormat) : ''"
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
      aria-label="Choose a date"
    >
      <Calendar
        :system="system"
        :locale="locale"
        :value="date"
        :quick-nav="quickNav"
        :rules="rules"
        @select="
          (next) => {
            selectDate(next);
            open = false;
          }
        "
      />
    </div>
  </div>
</template>
