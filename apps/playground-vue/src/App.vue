<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import '@jalali-js/ui-vue/themes/dark.css';
import '@jalali-js/ui-vue/themes/compact.css';
import { DatePicker, useCalendar } from '@jalali-js/vue';
import { InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import type { CalendarDate, StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
const storedRange = ref<RangeStorageValue>();
const inlineSelected = ref<CalendarDate | null>(null);
const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
</script>

<template>
  <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 640px">
    <h1>jalali-js playground (Vue)</h1>
    <p>
      This page has the dark + compact themes from <code>@jalali-js/ui-vue/themes</code> applied
      throughout, to demonstrate composing multiple theme files (see the two CSS imports at the top
      of this file). Every component below shares one page-wide theme, since the theming contract is
      CSS custom properties on each picker's root element, the same design a whole-app theme switch
      relies on.
    </p>
    <p>امروز: {{ jalali.format(jalali.today(), { style: 'long', weekday: true }) }}</p>

    <section data-testid="grid-en-jalali">
      <h2>Grid variant, English, Jalali system</h2>
      <DatePicker v-model="stored" system="jalali" locale="en" />
      <p>Stored value (Gregorian by default): {{ JSON.stringify(stored) }}</p>
    </section>

    <section data-testid="grid-fa-jalali">
      <h2>Grid variant, Farsi</h2>
      <DatePicker system="jalali" locale="fa" />
    </section>

    <section data-testid="dropdown">
      <h2>Dropdown variant (date-of-birth style entry)</h2>
      <DatePicker system="jalali" locale="en" variant="dropdown" />
    </section>

    <section data-testid="gregorian">
      <h2>Gregorian system</h2>
      <DatePicker system="gregorian" locale="en" />
    </section>

    <section data-testid="inline-calendar">
      <h2>Inline calendar (@jalali-js/ui-vue)</h2>
      <InlineCalendar
        system="jalali"
        locale="en"
        :value="inlineSelected"
        @select="(date: CalendarDate) => (inlineSelected = date)"
      />
      <p>Selected: {{ inlineSelected ? JSON.stringify(inlineSelected) : 'none' }}</p>
    </section>

    <section data-testid="range-picker">
      <h2>Range picker (@jalali-js/ui-vue)</h2>
      <RangePicker v-model="storedRange" system="jalali" locale="en" />
      <p>Stored range (Gregorian by default): {{ JSON.stringify(storedRange) }}</p>
    </section>
  </main>
</template>
