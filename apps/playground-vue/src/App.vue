<script setup lang="ts">
import '@jalali-js/vue/date-picker.css';
import '@jalali-js/ui-vue/themes/compact.css';
// Loaded as a string so dark theme can toggle: inject or remove one <style> element.
import darkThemeCss from '@jalali-js/ui-vue/themes/dark.css?inline';
import type { LocaleCode } from '@jalali-js/vue';
import { DatePicker, TimePicker, useCalendar } from '@jalali-js/vue';
import { EventCalendar, InlineCalendar, RangePicker, TimeRangePicker } from '@jalali-js/ui-vue';
import type { RangeStorageValue, TimeRange } from '@jalali-js/ui-vue';
import type { CalendarDate, CalendarEvent, StorageValue, TimeOfDay } from 'jalali-js';
import {
  DEMO_DAY,
  DEMO_EVENTS,
  DEMO_MONTH,
  parseDemoState,
  themeStyleFromState,
  vueSnippet,
  writeDemoStateToUrl,
  type DemoState,
  type DemoTab,
} from 'playground-shared';
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import './demo.css';

const TABS: { id: DemoTab; label: string }[] = [
  { id: 'date-picker', label: 'DatePicker' },
  { id: 'range-picker', label: 'RangePicker' },
  { id: 'inline-calendar', label: 'InlineCalendar' },
  { id: 'event-calendar', label: 'EventCalendar' },
  { id: 'time-picker', label: 'TimePicker' },
  { id: 'datetime-picker', label: 'DateTime' },
  { id: 'time-range-picker', label: 'TimeRange' },
  { id: 'position', label: 'Position' },
];

const state = reactive<DemoState>(parseDemoState(window.location.search));
const stored = ref<StorageValue | null>(null);
const storedRange = ref<RangeStorageValue | null>(null);
const time = ref<TimeOfDay>({ hour: 14, minute: 30 });
const timeRange = ref<TimeRange | null>(null);
const inlineSelected = ref<CalendarDate | null>(null);
const eventClickLog = ref('none');
const copyLabel = ref('Copy');
const demoEvents = DEMO_EVENTS as unknown as CalendarEvent[];
const jalali = useCalendar({ system: 'jalali', locale: 'fa' });

const snippet = computed(() => vueSnippet(state));
const themeStyle = computed(() => themeStyleFromState(state.theme));
// Host chrome stays LTR. Page direction only wraps the live stage.
// Pickers keep locale direction on their own roots, not from this value.
const stageDir = computed(() => (state.dir === 'auto' ? 'ltr' : state.dir));
const emittedValue = computed(() => {
  if (state.tab === 'range-picker') return storedRange.value;
  if (state.tab === 'time-picker') return time.value;
  if (state.tab === 'time-range-picker') return timeRange.value;
  if (state.tab === 'inline-calendar') return inlineSelected.value;
  if (state.tab === 'event-calendar') return { lastEventClick: eventClickLog.value };
  return stored.value;
});

function patch(next: Partial<DemoState>): void {
  Object.assign(state, next);
}

watch(
  () => ({ ...state, theme: { ...state.theme } }),
  () => writeDemoStateToUrl(state),
  { deep: true },
);

// Vue SFC treats nested <style> in template as a file block. Toggle dark CSS on one element.
const darkStyleEl = document.createElement('style');
darkStyleEl.textContent = darkThemeCss;
watchEffect(() => {
  document.documentElement.style.colorScheme = state.dark ? 'dark' : 'light';
  if (state.dark) document.head.appendChild(darkStyleEl);
  else darkStyleEl.remove();
});

const compactOverrideCss = `
  [data-jalali-datepicker-root], [data-jalali-calendar-root], [data-jalali-event-calendar] {
    --jalali-font-size: 1rem;
    --jalali-gap: 0.5em;
    --jalali-day-min-size: 2.5em;
  }
`;
const compactStyleEl = document.createElement('style');
compactStyleEl.textContent = compactOverrideCss;
watchEffect(() => {
  if (!state.compact) document.head.appendChild(compactStyleEl);
  else compactStyleEl.remove();
});

async function copySnippet(): Promise<void> {
  await navigator.clipboard.writeText(snippet.value);
  copyLabel.value = 'Copied';
  window.setTimeout(() => {
    copyLabel.value = 'Copy';
  }, 1200);
}

const datetimeDefault = {
  precision: 'datetime' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0,
  millisecond: 0,
};
</script>

<template>
  <main
    class="demo-page"
    dir="ltr"
    :style="{
      background: state.dark ? '#141414' : '#ffffff',
      color: state.dark ? '#ededed' : '#1a1a1a',
    }"
  >
    <div class="demo-shell" data-testid="demo-shell">
      <div>
        <h1>jalali-js playground</h1>
        <p class="demo-bindings">
          <a href="../react/">React</a>
          <strong>Vue</strong>
          <a href="../vanilla/">Web Components</a>
        </p>
        <p>امروز: {{ jalali.format(jalali.today(), { style: 'long', weekday: true }) }}</p>
      </div>

      <div class="demo-tabs" role="tablist" aria-label="Component">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="state.tab === tab.id"
          @click="patch({ tab: tab.id })"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="demo-controls">
        <label>
          Locale
          <select
            :value="state.locale"
            @change="
              patch({
                locale: ($event.target as HTMLSelectElement).value as DemoState['locale'],
              })
            "
          >
            <option value="en">en</option>
            <option value="fa">fa</option>
            <option value="ps">ps</option>
          </select>
        </label>
        <label>
          System
          <select
            :value="state.system"
            @change="
              patch({
                system: ($event.target as HTMLSelectElement).value as DemoState['system'],
              })
            "
          >
            <option value="jalali">jalali</option>
            <option value="gregorian">gregorian</option>
          </select>
        </label>
        <label>
          Variant
          <select
            :value="state.variant"
            @change="
              patch({
                variant: ($event.target as HTMLSelectElement).value as DemoState['variant'],
              })
            "
          >
            <option value="grid">grid</option>
            <option value="dropdown">dropdown</option>
          </select>
        </label>
        <label>
          valueFormat
          <select
            :value="state.valueFormat"
            @change="
              patch({
                valueFormat: ($event.target as HTMLSelectElement).value as DemoState['valueFormat'],
              })
            "
          >
            <option value="gregorian-iso">gregorian-iso</option>
            <option value="jalali-object">jalali-object</option>
          </select>
        </label>
        <label>
          Display style
          <select
            :value="state.displayStyle"
            @change="
              patch({
                displayStyle: ($event.target as HTMLSelectElement)
                  .value as DemoState['displayStyle'],
              })
            "
          >
            <option value="short">short</option>
            <option value="long">long</option>
          </select>
        </label>
        <label>
          Event view
          <select
            :value="state.eventView"
            @change="
              patch({
                eventView: ($event.target as HTMLSelectElement).value as DemoState['eventView'],
              })
            "
          >
            <option value="month">month</option>
            <option value="week">week</option>
            <option value="day">day</option>
          </select>
        </label>
        <label>
          Minute step
          <input
            type="number"
            min="1"
            max="30"
            :value="state.minuteStep"
            @change="
              patch({
                minuteStep: Number(($event.target as HTMLInputElement).value) || 15,
              })
            "
          />
        </label>
        <label>
          Page direction
          <select
            :value="state.dir"
            @change="patch({ dir: ($event.target as HTMLSelectElement).value as DemoState['dir'] })"
          >
            <option value="auto">auto</option>
            <option value="ltr">ltr</option>
            <option value="rtl">rtl</option>
          </select>
        </label>
        <label>
          Primary
          <input
            type="color"
            :value="state.theme.primary || '#2563eb'"
            @input="
              patch({
                theme: {
                  ...state.theme,
                  primary: ($event.target as HTMLInputElement).value,
                },
              })
            "
          />
        </label>
        <label>
          Background
          <input
            type="color"
            :value="state.theme.bg || (state.dark ? '#1f1f1f' : '#ffffff')"
            @input="
              patch({
                theme: { ...state.theme, bg: ($event.target as HTMLInputElement).value },
              })
            "
          />
        </label>
        <label>
          Radius
          <input
            type="text"
            placeholder="e.g. 12px"
            :value="state.theme.radius"
            @input="
              patch({
                theme: {
                  ...state.theme,
                  radius: ($event.target as HTMLInputElement).value,
                },
              })
            "
          />
        </label>
        <label>
          Gap
          <input
            type="text"
            placeholder="e.g. 0.5em"
            :value="state.theme.gap"
            @input="
              patch({
                theme: { ...state.theme, gap: ($event.target as HTMLInputElement).value },
              })
            "
          />
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              :checked="state.dark"
              @change="patch({ dark: ($event.target as HTMLInputElement).checked })"
            />
            Dark
          </span>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              :checked="state.compact"
              @change="patch({ compact: ($event.target as HTMLInputElement).checked })"
            />
            Compact
          </span>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              :checked="state.showHolidays"
              @change="patch({ showHolidays: ($event.target as HTMLInputElement).checked })"
            />
            Show holidays
          </span>
        </label>
      </div>

      <div class="demo-stage" :dir="stageDir" :style="themeStyle">
        <DatePicker
          v-if="state.tab === 'date-picker'"
          :system="state.system"
          :locale="state.locale"
          :variant="state.variant"
          :value-format="state.valueFormat"
          :display-format="{ style: state.displayStyle }"
          :show-holidays="state.showHolidays"
          @update:model-value="(value) => (stored = value ?? null)"
        />
        <RangePicker
          v-else-if="state.tab === 'range-picker'"
          :system="state.system"
          :locale="state.locale"
          :value-format="state.valueFormat"
          :show-holidays="state.showHolidays"
          @update:model-value="(value) => (storedRange = value ?? null)"
        />
        <InlineCalendar
          v-else-if="state.tab === 'inline-calendar'"
          :system="state.system"
          :locale="state.locale"
          :value="inlineSelected"
          :show-holidays="state.showHolidays"
          @select="(date: CalendarDate) => (inlineSelected = date)"
        />
        <EventCalendar
          v-else-if="state.tab === 'event-calendar'"
          :system="state.system"
          :locale="state.locale"
          :view="state.eventView"
          :initial-displayed-month="DEMO_MONTH"
          :initial-date="DEMO_DAY"
          :events="demoEvents"
          @event-click="(event) => (eventClickLog = event.title)"
        />
        <TimePicker
          v-else-if="state.tab === 'time-picker'"
          :locale="state.locale"
          :value="time"
          :minute-step="state.minuteStep"
          @change="(next) => (time = next)"
        />
        <DatePicker
          v-else-if="state.tab === 'datetime-picker'"
          :system="state.system"
          :locale="state.locale"
          :variant="state.variant"
          precision="datetime"
          :minute-step="state.minuteStep"
          :value-format="state.valueFormat"
          :default-date="datetimeDefault"
          @update:model-value="(value) => (stored = value ?? null)"
        />
        <TimeRangePicker
          v-else-if="state.tab === 'time-range-picker'"
          :locale="state.locale"
          :minute-step="state.minuteStep"
          @change="(next) => (timeRange = next)"
        />
        <div
          v-else-if="state.tab === 'position'"
          class="demo-position-frame"
          data-testid="viewport-position"
        >
          <div class="corner corner-tl">
            <DatePicker :system="state.system" :locale="state.locale" />
          </div>
          <div class="corner corner-tr">
            <DatePicker :system="state.system" :locale="state.locale" />
          </div>
          <div class="corner corner-bl">
            <DatePicker :system="state.system" :locale="state.locale" />
          </div>
          <div class="corner corner-br">
            <DatePicker :system="state.system" :locale="state.locale" />
          </div>
        </div>
      </div>

      <p class="demo-value">Emitted value (storage): {{ JSON.stringify(emittedValue) }}</p>

      <div class="demo-snippet-section">
        <strong>Code</strong>
        <div class="demo-snippet-block">
          <button type="button" class="demo-snippet-copy" @click="void copySnippet()">
            {{ copyLabel }}
          </button>
          <pre class="demo-snippet">{{ snippet }}</pre>
        </div>
      </div>
    </div>

    <h2>Visual matrix</h2>
    <p>
      Stable cells for visual e2e. Page defaults match dark + compact + fa unless the URL overrides
      them.
    </p>
    <div class="demo-gallery">
      <section data-testid="grid-en-jalali">
        <h3>Grid, English, Jalali</h3>
        <DatePicker
          system="jalali"
          locale="en"
          @update:model-value="(value) => (stored = value ?? null)"
        />
        <p>Stored value: {{ JSON.stringify(stored) }}</p>
      </section>
      <section data-testid="grid-fa-jalali">
        <h3>Grid, Farsi</h3>
        <DatePicker system="jalali" locale="fa" />
      </section>
      <section data-testid="grid-ps-jalali">
        <h3>Grid, Pashto</h3>
        <DatePicker system="jalali" locale="ps" />
      </section>
      <section data-testid="dropdown">
        <h3>Dropdown</h3>
        <DatePicker system="jalali" :locale="state.locale as LocaleCode" variant="dropdown" />
      </section>
      <section data-testid="gregorian">
        <h3>Gregorian</h3>
        <DatePicker system="gregorian" :locale="state.locale as LocaleCode" />
      </section>
      <section data-testid="inline-calendar">
        <h3>Inline calendar</h3>
        <InlineCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          :value="inlineSelected"
          @select="(date: CalendarDate) => (inlineSelected = date)"
        />
      </section>
      <section data-testid="range-picker">
        <h3>Range picker</h3>
        <RangePicker
          system="jalali"
          :locale="state.locale as LocaleCode"
          @update:model-value="(value) => (storedRange = value ?? null)"
        />
      </section>
      <section data-testid="time-picker">
        <h3>Time picker</h3>
        <TimePicker
          :locale="state.locale as LocaleCode"
          :value="time"
          :minute-step="15"
          @change="(next) => (time = next)"
        />
      </section>
      <section data-testid="datetime-picker">
        <h3>Date and time</h3>
        <DatePicker
          system="jalali"
          :locale="state.locale as LocaleCode"
          precision="datetime"
          :minute-step="15"
          :default-date="datetimeDefault"
          @update:model-value="(value) => (stored = value ?? null)"
        />
      </section>
      <section data-testid="time-range-picker">
        <h3>Time range</h3>
        <TimeRangePicker
          :locale="state.locale as LocaleCode"
          :minute-step="15"
          @change="(next) => (timeRange = next)"
        />
      </section>
      <section data-testid="event-calendar">
        <h3>Event calendar month</h3>
        <EventCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          view="month"
          :initial-displayed-month="DEMO_MONTH"
          :events="demoEvents"
          @event-click="(event) => (eventClickLog = event.title)"
        />
      </section>
      <section data-testid="event-calendar-week">
        <h3>Event calendar week</h3>
        <EventCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          view="week"
          :initial-date="DEMO_DAY"
          :events="demoEvents"
        />
      </section>
      <section data-testid="event-calendar-day">
        <h3>Event calendar day</h3>
        <EventCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          view="day"
          :initial-date="DEMO_DAY"
          :events="demoEvents"
        />
      </section>
      <section data-testid="selection-rules">
        <h3>Selection rules</h3>
        <InlineCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          :initial-displayed-month="DEMO_MONTH"
          :rules="{
            minDate: { year: 1403, month: 5, day: 5 },
            maxDate: { year: 1403, month: 5, day: 28 },
            disabledDates: [{ year: 1403, month: 5, day: 12 }],
            disabledWeekdays: [4, 5],
          }"
        />
      </section>
      <section data-testid="holidays">
        <h3>Iran holidays</h3>
        <InlineCalendar
          system="jalali"
          :locale="state.locale as LocaleCode"
          :initial-displayed-month="{ year: 1403, month: 1 }"
          show-holidays
          holiday-region="IR"
        />
      </section>
      <section data-testid="custom-theme">
        <h3>Custom theme</h3>
        <div class="custom-theme-scope">
          <DatePicker system="jalali" :locale="state.locale as LocaleCode" />
        </div>
      </section>
    </div>
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
