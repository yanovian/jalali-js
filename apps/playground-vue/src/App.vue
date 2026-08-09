<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import '@jalali-js/ui-vue/themes/compact.css';
// Loaded as a string, not a global side-effect import, so the dark theme can be toggled: it
// only overrides --jalali-* custom properties on [data-jalali-*] elements (see dark.css's own
// comment), so injecting/removing it as a <style> tag turns the picker theme on and off cleanly.
import darkThemeCss from '@jalali-js/ui-vue/themes/dark.css?inline';
import { DatePicker, useCalendar } from '@jalali-js/vue';
import { InlineCalendar, RangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue } from '@jalali-js/ui-vue';
import type { CalendarDate, StorageValue } from 'jalali-js';
import { ref, watchEffect } from 'vue';

const stored = ref<StorageValue>();
const storedRange = ref<RangeStorageValue>();
const inlineSelected = ref<CalendarDate | null>(null);
const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
const isDark = ref(true);

// A <style> tag written directly in <template> does not work: Vue's SFC compiler treats
// <style> as one of its own top-level file blocks, even when it appears nested inside
// <template>, so it never reaches the DOM as a real element (confirmed directly: the compiled
// output had zero <style> elements at runtime despite v-if being true). Toggling the theme
// imperatively, on a single reused element, sidesteps that entirely.
const darkStyleEl = document.createElement('style');
darkStyleEl.textContent = darkThemeCss;
watchEffect(() => {
  if (isDark.value) {
    document.head.appendChild(darkStyleEl);
  } else {
    darkStyleEl.remove();
  }
});
</script>

<template>
  <main
    style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 640px; min-height: 100vh"
    :style="{
      background: isDark ? '#141414' : '#ffffff',
      color: isDark ? '#ededed' : '#1a1a1a',
    }"
  >
    <h1>jalali-js playground (Vue)</h1>
    <p style="margin: -0.5rem 0 1rem">Vue playground · <a href="../react/">React playground</a></p>
    <p style="margin: 0 0 1rem">
      <label><input type="checkbox" v-model="isDark" /> Dark mode</label>
    </p>
    <p>
      The <code>compact</code> theme from <code>@jalali-js/ui-vue/themes</code> is always on below,
      for spacing. The <code>dark</code> theme (colors) is what the toggle above controls, applied
      to both the pickers and this page's own background: composing multiple theme files works by
      importing more than one (see the CSS imports at the top of this file). Every component below
      shares one page-wide theme, since the theming contract is CSS custom properties on each
      picker's root element, the same design a whole-app theme switch relies on.
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

    <section data-testid="custom-theme">
      <h2>Custom CSS override (consumer-configured, not a shipped theme file)</h2>
      <p>
        A consumer can retheme a picker by overriding the <code>--jalali-*</code> custom properties,
        with no theme file at all. The theme imports above already set some of those properties
        directly on every picker's root element, and since custom properties inherit rather than
        cascade by specificity, an ancestor's inline style cannot win against a value set directly
        on the root itself. This section instead follows architecture.md's own documented pattern: a
        scoped selector under a parent class (see the "Theming contract" section there).
      </p>
      <div class="custom-theme-scope">
        <DatePicker system="jalali" locale="en" />
      </div>
    </section>
  </main>
</template>

<style>
.custom-theme-scope [data-jalali-datepicker-root] {
  --jalali-primary: #c026d3;
  --jalali-primary-fg: #ffffff;
  --jalali-bg: #fdf4ff;
  --jalali-fg: #581c87;
  --jalali-radius: 20px;
}
</style>
