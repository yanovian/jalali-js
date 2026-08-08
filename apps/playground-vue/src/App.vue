<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import { DatePicker, useCalendar } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
</script>

<template>
  <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 640px">
    <h1>jalali-js playground (Vue)</h1>
    <p>امروز: {{ jalali.format(jalali.today(), { style: 'long', weekday: true }) }}</p>

    <section>
      <h2>Grid variant, English, Jalali system</h2>
      <DatePicker v-model="stored" system="jalali" locale="en" />
      <p>Stored value (Gregorian by default): {{ JSON.stringify(stored) }}</p>
    </section>

    <section>
      <h2>Grid variant, Farsi</h2>
      <DatePicker system="jalali" locale="fa" />
    </section>

    <section>
      <h2>Dropdown variant (date-of-birth style entry)</h2>
      <DatePicker system="jalali" locale="en" variant="dropdown" />
    </section>

    <section>
      <h2>Gregorian system</h2>
      <DatePicker system="gregorian" locale="en" />
    </section>
  </main>
</template>
