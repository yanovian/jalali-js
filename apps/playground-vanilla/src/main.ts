import '@jalali-js/web/date-picker.css';
import '@jalali-js/ui-web/themes/compact.css';
import darkThemeCss from '@jalali-js/ui-web/themes/dark.css?inline';
import type {
  DatePickerChangeEventDetail,
  JalaliDatePickerElement,
  JalaliTimePickerElement,
  LocaleCode,
  TimePickerChangeEventDetail,
} from '@jalali-js/web';
import { localePackFor } from '@jalali-js/web';
import { format as formatDate } from '@jalali-js/i18n';
import '@jalali-js/ui-web';
import type {
  EventCalendarEventClickDetail,
  JalaliEventCalendarElement,
  JalaliInlineCalendarElement,
  JalaliRangePickerElement,
  JalaliTimeRangePickerElement,
  RangePickerChangeEventDetail,
  TimeRangePickerChangeEventDetail,
} from '@jalali-js/ui-web';
import type { CalendarDate, TimeOfDay } from 'jalali-js';
import { createCalendar } from 'jalali-js';
import {
  DEMO_DAY,
  DEMO_EVENTS,
  DEMO_MONTH,
  parseDemoState,
  themeStyleFromState,
  webSnippet,
  writeDemoStateToUrl,
  type DemoState,
  type DemoTab,
} from 'playground-shared';
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

const demoEvents = [...DEMO_EVENTS];
let state = parseDemoState(window.location.search);
let stored: unknown = null;
let storedRange: unknown = null;
let time: TimeOfDay = { hour: 14, minute: 30 };
let timeRange: unknown = null;
let inlineSelected: CalendarDate | null = null;
let eventClickLog = 'none';

const page = document.getElementById('app') as HTMLElement;
const tabsEl = document.getElementById('demo-tabs')!;
const controlsEl = document.getElementById('demo-controls')!;
const stageEl = document.getElementById('demo-stage')!;
const valueEl = document.getElementById('demo-value')!;
const snippetEl = document.getElementById('demo-snippet')!;
const copyBtn = document.getElementById('copy-snippet') as HTMLButtonElement;

const darkStyleEl = document.createElement('style');
darkStyleEl.textContent = darkThemeCss;
const compactStyleEl = document.createElement('style');
compactStyleEl.textContent = `
  [data-jalali-datepicker-root], [data-jalali-calendar-root], [data-jalali-event-calendar] {
    --jalali-font-size: 1rem;
    --jalali-gap: 0.5em;
    --jalali-day-min-size: 2.5em;
  }
`;

const jalaliToday = createCalendar({ system: 'jalali' }).today();
document.getElementById('calendar-summary')!.textContent =
  `امروز: ${formatDate(jalaliToday, localePackFor('fa'), { style: 'long', weekday: true })}`;

function patch(next: Partial<DemoState>): void {
  state = { ...state, ...next, theme: { ...state.theme, ...(next.theme ?? {}) } };
  writeDemoStateToUrl(state);
  renderShell();
}

function stageDir(): 'ltr' | 'rtl' {
  // Pickers keep locale direction on their own roots, not from this value.
  return state.dir === 'auto' ? 'ltr' : state.dir;
}

function emittedValue(): unknown {
  if (state.tab === 'range-picker') return storedRange;
  if (state.tab === 'time-picker') return time;
  if (state.tab === 'time-range-picker') return timeRange;
  if (state.tab === 'inline-calendar') return inlineSelected;
  if (state.tab === 'event-calendar') return { lastEventClick: eventClickLog };
  return stored;
}

function applyPageChrome(): void {
  // Host chrome stays LTR. Page direction only wraps the live stage.
  document.documentElement.dir = 'ltr';
  document.body.dir = 'ltr';
  document.documentElement.style.colorScheme = state.dark ? 'dark' : 'light';
  page.dir = 'ltr';
  page.style.background = state.dark ? '#141414' : '#ffffff';
  page.style.color = state.dark ? '#ededed' : '#1a1a1a';
  stageEl.dir = stageDir();
  if (state.dark) document.head.appendChild(darkStyleEl);
  else darkStyleEl.remove();
  if (!state.compact) document.head.appendChild(compactStyleEl);
  else compactStyleEl.remove();
}

function applyGalleryLocale(): void {
  const locale = state.locale as LocaleCode;
  for (const node of document.querySelectorAll('.locale-follows')) {
    (node as HTMLElement & { locale: LocaleCode }).locale = locale;
  }
}

function renderTabs(): void {
  tabsEl.replaceChildren();
  for (const tab of TABS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.role = 'tab';
    button.setAttribute('aria-selected', String(state.tab === tab.id));
    button.textContent = tab.label;
    button.addEventListener('click', () => patch({ tab: tab.id }));
    tabsEl.appendChild(button);
  }
}

function selectControl(
  labelText: string,
  value: string,
  options: string[],
  onChange: (value: string) => void,
): void {
  const label = document.createElement('label');
  label.append(labelText);
  const select = document.createElement('select');
  for (const option of options) {
    const el = document.createElement('option');
    el.value = option;
    el.textContent = option;
    select.appendChild(el);
  }
  select.value = value;
  select.addEventListener('change', () => onChange(select.value));
  label.appendChild(select);
  controlsEl.appendChild(label);
}

function checkboxControl(
  labelText: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): void {
  const label = document.createElement('label');
  const span = document.createElement('span');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  span.append(input, ` ${labelText}`);
  label.appendChild(span);
  controlsEl.appendChild(label);
}

function renderControls(): void {
  controlsEl.replaceChildren();
  selectControl('Locale', state.locale, ['en', 'fa', 'ps'], (value) =>
    patch({ locale: value as DemoState['locale'] }),
  );
  selectControl('System', state.system, ['jalali', 'gregorian'], (value) =>
    patch({ system: value as DemoState['system'] }),
  );
  selectControl('Variant', state.variant, ['grid', 'dropdown'], (value) =>
    patch({ variant: value as DemoState['variant'] }),
  );
  selectControl('valueFormat', state.valueFormat, ['gregorian-iso', 'jalali-object'], (value) =>
    patch({ valueFormat: value as DemoState['valueFormat'] }),
  );
  selectControl('Display style', state.displayStyle, ['short', 'long'], (value) =>
    patch({ displayStyle: value as DemoState['displayStyle'] }),
  );
  selectControl('Event view', state.eventView, ['month', 'week', 'day'], (value) =>
    patch({ eventView: value as DemoState['eventView'] }),
  );

  const minuteLabel = document.createElement('label');
  minuteLabel.append('Minute step');
  const minuteInput = document.createElement('input');
  minuteInput.type = 'number';
  minuteInput.min = '1';
  minuteInput.max = '30';
  minuteInput.value = String(state.minuteStep);
  minuteInput.addEventListener('change', () =>
    patch({ minuteStep: Number(minuteInput.value) || 15 }),
  );
  minuteLabel.appendChild(minuteInput);
  controlsEl.appendChild(minuteLabel);

  selectControl('Page direction', state.dir, ['auto', 'ltr', 'rtl'], (value) =>
    patch({ dir: value as DemoState['dir'] }),
  );

  const primaryLabel = document.createElement('label');
  primaryLabel.append('Primary');
  const primaryInput = document.createElement('input');
  primaryInput.type = 'color';
  primaryInput.value = state.theme.primary || '#2563eb';
  primaryInput.addEventListener('input', () =>
    patch({ theme: { ...state.theme, primary: primaryInput.value } }),
  );
  primaryLabel.appendChild(primaryInput);
  controlsEl.appendChild(primaryLabel);

  const bgLabel = document.createElement('label');
  bgLabel.append('Background');
  const bgInput = document.createElement('input');
  bgInput.type = 'color';
  bgInput.value = state.theme.bg || (state.dark ? '#1f1f1f' : '#ffffff');
  bgInput.addEventListener('input', () => patch({ theme: { ...state.theme, bg: bgInput.value } }));
  bgLabel.appendChild(bgInput);
  controlsEl.appendChild(bgLabel);

  const radiusLabel = document.createElement('label');
  radiusLabel.append('Radius');
  const radiusInput = document.createElement('input');
  radiusInput.type = 'text';
  radiusInput.placeholder = 'e.g. 12px';
  radiusInput.value = state.theme.radius;
  radiusInput.addEventListener('input', () =>
    patch({ theme: { ...state.theme, radius: radiusInput.value } }),
  );
  radiusLabel.appendChild(radiusInput);
  controlsEl.appendChild(radiusLabel);

  const gapLabel = document.createElement('label');
  gapLabel.append('Gap');
  const gapInput = document.createElement('input');
  gapInput.type = 'text';
  gapInput.placeholder = 'e.g. 0.5em';
  gapInput.value = state.theme.gap;
  gapInput.addEventListener('input', () =>
    patch({ theme: { ...state.theme, gap: gapInput.value } }),
  );
  gapLabel.appendChild(gapInput);
  controlsEl.appendChild(gapLabel);

  checkboxControl('Dark', state.dark, (checked) => patch({ dark: checked }));
  checkboxControl('Compact', state.compact, (checked) => patch({ compact: checked }));
  checkboxControl('Show holidays', state.showHolidays, (checked) =>
    patch({ showHolidays: checked }),
  );
}

function createDatePicker(options: {
  system?: DemoState['system'];
  locale?: DemoState['locale'];
  variant?: DemoState['variant'];
  precision?: 'date' | 'datetime';
  valueFormat?: DemoState['valueFormat'];
  minuteStep?: number;
  showHolidays?: boolean;
  defaultDate?: JalaliDatePickerElement['defaultDate'];
}): JalaliDatePickerElement {
  const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
  el.system = options.system ?? state.system;
  el.locale = (options.locale ?? state.locale) as LocaleCode;
  if (options.variant) el.variant = options.variant;
  if (options.precision) el.precision = options.precision;
  if (options.valueFormat) el.valueFormat = options.valueFormat;
  if (options.minuteStep != null) el.minuteStep = options.minuteStep;
  if (options.showHolidays != null) el.showHolidays = options.showHolidays;
  if (options.defaultDate !== undefined) el.defaultDate = options.defaultDate;
  return el;
}

function renderStage(): void {
  stageEl.replaceChildren();
  const themeStyle = themeStyleFromState(state.theme);
  for (const [key, value] of Object.entries(themeStyle)) {
    stageEl.style.setProperty(key, value);
  }
  for (const key of [
    '--jalali-primary',
    '--jalali-primary-fg',
    '--jalali-bg',
    '--jalali-radius',
    '--jalali-gap',
  ]) {
    if (!(key in themeStyle)) stageEl.style.removeProperty(key);
  }

  if (state.tab === 'date-picker') {
    const el = createDatePicker({
      variant: state.variant,
      valueFormat: state.valueFormat,
      showHolidays: state.showHolidays,
    });
    el.addEventListener('change', (event) => {
      stored = (event as CustomEvent<DatePickerChangeEventDetail>).detail.value;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'range-picker') {
    const el = document.createElement('jalali-range-picker') as JalaliRangePickerElement;
    el.system = state.system;
    el.locale = state.locale as LocaleCode;
    el.valueFormat = state.valueFormat;
    el.showHolidays = state.showHolidays;
    el.addEventListener('change', (event) => {
      storedRange = (event as CustomEvent<RangePickerChangeEventDetail>).detail.value;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'inline-calendar') {
    const el = document.createElement('jalali-inline-calendar') as JalaliInlineCalendarElement;
    el.system = state.system;
    el.locale = state.locale as LocaleCode;
    el.value = inlineSelected;
    el.showHolidays = state.showHolidays;
    el.addEventListener('select', (event) => {
      inlineSelected = (event as CustomEvent<{ date: CalendarDate }>).detail.date;
      el.value = inlineSelected;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'event-calendar') {
    const el = document.createElement('jalali-event-calendar') as JalaliEventCalendarElement;
    el.system = state.system;
    el.locale = state.locale as LocaleCode;
    el.view = state.eventView;
    el.initialDisplayedMonth = { ...DEMO_MONTH };
    el.initialDate = { ...DEMO_DAY };
    el.events = demoEvents;
    el.addEventListener('event-click', (event) => {
      eventClickLog = (event as CustomEvent<EventCalendarEventClickDetail>).detail.event.title;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'time-picker') {
    const el = document.createElement('jalali-time-picker') as JalaliTimePickerElement;
    el.locale = state.locale as LocaleCode;
    el.value = time;
    el.minuteStep = state.minuteStep;
    el.addEventListener('change', (event) => {
      time = (event as CustomEvent<TimePickerChangeEventDetail>).detail.time;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'datetime-picker') {
    const el = createDatePicker({
      variant: state.variant,
      precision: 'datetime',
      minuteStep: state.minuteStep,
      valueFormat: state.valueFormat,
      defaultDate: {
        precision: 'datetime',
        system: 'jalali',
        year: 1403,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        millisecond: 0,
      },
    });
    el.addEventListener('change', (event) => {
      stored = (event as CustomEvent<DatePickerChangeEventDetail>).detail.value;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'time-range-picker') {
    const el = document.createElement('jalali-time-range-picker') as JalaliTimeRangePickerElement;
    el.locale = state.locale as LocaleCode;
    el.minuteStep = state.minuteStep;
    el.addEventListener('change', (event) => {
      timeRange = (event as CustomEvent<TimeRangePickerChangeEventDetail>).detail.range;
      updateValueAndSnippet();
    });
    stageEl.appendChild(el);
    return;
  }

  if (state.tab === 'position') {
    const frame = document.createElement('div');
    frame.className = 'demo-position-frame';
    frame.dataset.testid = 'viewport-position';
    for (const corner of ['corner-tl', 'corner-tr', 'corner-bl', 'corner-br']) {
      const wrap = document.createElement('div');
      wrap.className = `corner ${corner}`;
      wrap.appendChild(createDatePicker({}));
      frame.appendChild(wrap);
    }
    stageEl.appendChild(frame);
  }
}

function updateValueAndSnippet(): void {
  valueEl.textContent = `Emitted value (storage): ${JSON.stringify(emittedValue())}`;
  snippetEl.textContent = webSnippet(state);
}

function renderShell(): void {
  applyPageChrome();
  renderTabs();
  renderControls();
  renderStage();
  updateValueAndSnippet();
  applyGalleryLocale();
}

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(webSnippet(state));
  copyBtn.textContent = 'Copied';
  window.setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 1200);
});

// Gallery wiring (stable data-testids for visual e2e).
document
  .querySelector('[data-testid="grid-en-jalali"] jalali-date-picker')!
  .addEventListener('change', (event) => {
    stored = (event as CustomEvent<DatePickerChangeEventDetail>).detail.value;
    document.getElementById('stored-value')!.textContent = JSON.stringify(stored);
    updateValueAndSnippet();
  });

document
  .querySelector('[data-testid="inline-calendar"] jalali-inline-calendar')!
  .addEventListener('select', (event) => {
    inlineSelected = (event as CustomEvent<{ date: CalendarDate }>).detail.date;
    document.getElementById('inline-selected')!.textContent = JSON.stringify(inlineSelected);
    updateValueAndSnippet();
  });

document
  .querySelector('[data-testid="range-picker"] jalali-range-picker')!
  .addEventListener('change', (event) => {
    storedRange = (event as CustomEvent<RangePickerChangeEventDetail>).detail.value;
    document.getElementById('stored-range')!.textContent = JSON.stringify(storedRange);
    updateValueAndSnippet();
  });

const galleryTimePicker = document.getElementById('gallery-time-picker') as JalaliTimePickerElement;
galleryTimePicker.value = { hour: 14, minute: 30 };
galleryTimePicker.addEventListener('change', (event) => {
  time = (event as CustomEvent<TimePickerChangeEventDetail>).detail.time;
  document.getElementById('selected-time')!.textContent = JSON.stringify(time);
  updateValueAndSnippet();
});
document.getElementById('selected-time')!.textContent = JSON.stringify(galleryTimePicker.value);

const galleryDatetime = document.getElementById(
  'gallery-datetime-picker',
) as JalaliDatePickerElement;
galleryDatetime.defaultDate = {
  precision: 'datetime',
  system: 'jalali',
  year: 1403,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0,
  millisecond: 0,
};
galleryDatetime.addEventListener('change', (event) => {
  stored = (event as CustomEvent<DatePickerChangeEventDetail>).detail.value;
  document.getElementById('stored-datetime')!.textContent = JSON.stringify(stored);
  updateValueAndSnippet();
});

document.getElementById('gallery-time-range-picker')!.addEventListener('change', (event) => {
  timeRange = (event as CustomEvent<TimeRangePickerChangeEventDetail>).detail.range;
  document.getElementById('selected-time-range')!.textContent = JSON.stringify(timeRange);
  updateValueAndSnippet();
});

const galleryEventMonth = document.getElementById(
  'gallery-event-calendar',
) as JalaliEventCalendarElement;
galleryEventMonth.initialDisplayedMonth = { ...DEMO_MONTH };
galleryEventMonth.events = demoEvents;
galleryEventMonth.addEventListener('event-click', (event) => {
  eventClickLog = (event as CustomEvent<EventCalendarEventClickDetail>).detail.event.title;
  document.getElementById('event-click-log')!.textContent = eventClickLog;
  updateValueAndSnippet();
});

const galleryEventWeek = document.getElementById(
  'gallery-event-calendar-week',
) as JalaliEventCalendarElement;
galleryEventWeek.initialDate = { ...DEMO_DAY };
galleryEventWeek.events = demoEvents;

const galleryEventDay = document.getElementById(
  'gallery-event-calendar-day',
) as JalaliEventCalendarElement;
galleryEventDay.initialDate = { ...DEMO_DAY };
galleryEventDay.events = demoEvents;

const rulesCalendar = document.getElementById('rules-calendar') as JalaliInlineCalendarElement;
rulesCalendar.initialDisplayedMonth = { ...DEMO_MONTH };
rulesCalendar.rules = {
  minDate: { year: 1403, month: 5, day: 5 },
  maxDate: { year: 1403, month: 5, day: 28 },
  disabledDates: [{ year: 1403, month: 5, day: 12 }],
  disabledWeekdays: [4, 5],
};

const holidaysCalendar = document.getElementById(
  'holidays-calendar',
) as JalaliInlineCalendarElement;
holidaysCalendar.initialDisplayedMonth = { year: 1403, month: 1 };

renderShell();
