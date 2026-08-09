<script setup lang="ts">
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
</script>

<template>
  <div>
    <DatePicker v-model="stored" system="jalali" locale="en" />
    <p data-testid="stored-value">Stored value: {{ JSON.stringify(stored) }}</p>
  </div>
</template>
