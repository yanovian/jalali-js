# @jalali-js/ui-vue

`RangePicker`, `InlineCalendar`, and extra themes for
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue), built on the same headless
primitives.

```sh
npm install @jalali-js/ui-vue
```

```vue
<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import '@jalali-js/ui-vue/themes/dark.css';
import { InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import { ref } from 'vue';

const selected = ref(null);
const storedRange = ref<RangeStorageValue>();
</script>

<template>
  <InlineCalendar system="jalali" locale="en" :value="selected" @select="selected = $event" />
  <RangePicker v-model="storedRange" system="jalali" locale="en" />
</template>
```

`RangePicker`: two-click range selection (first click sets the start, second sets the end and
closes the popover); clicking before the current start restarts the range instead of erroring;
hovering after a start is picked previews the range a completed selection would produce.
`InlineCalendar`: `Calendar` re-exported under a more discoverable name, for an always-visible
grid with no popover. `themes/dark.css` and `themes/compact.css` each override a disjoint set of
the shared `--jalali-*` custom properties, so they compose by importing both.

[Guide and API reference](https://jalali-js.yanovian.com/) ·
[Examples](https://jalali-js.yanovian.com/guide/examples) ·
[Playground](https://jalali-js.yanovian.com/playground/vue/)

MIT licensed.
