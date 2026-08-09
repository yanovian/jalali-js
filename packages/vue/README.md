# @jalali-js/vue

Vue bindings for [jalali-js](https://github.com/yanovian/jalali-js): a `useCalendar` composable,
a headless `Calendar` grid, a working default-styled `DatePicker`, and SSR-safe timezone
resolution.

```sh
npm install @jalali-js/vue
```

```vue
<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>(); // a Gregorian ISO string by default ('2024-08-05')
</script>

<template>
  <DatePicker v-model="stored" system="jalali" locale="fa" />
</template>
```

`Calendar` is the headless primitive underneath `DatePicker` (plain markup, `data-jalali-*`
attributes and a `day` scoped slot, no required CSS), for full styling control.
`variant="dropdown"` swaps the calendar-grid popup for three plain `<select>`s, for narrow,
known-range entry such as a date of birth. `useResolvedTimeZone()` pairs with a
`'zoned-datetime'` calendar under Nuxt SSR with no hydration mismatch.

`@jalali-js/ui-vue` adds a `RangePicker`, an `InlineCalendar`, and extra themes on the same
primitives. Full guide: [yanovian.github.io/jalali-js](https://yanovian.github.io/jalali-js/)
(the generated API reference there covers this package's plain-TypeScript composables only;
`.vue` component props are documented on the guide's Vue page, since TypeDoc has no `.vue` SFC
support).

MIT licensed.
