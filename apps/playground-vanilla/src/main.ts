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
// A bare import for its side effect: registering <jalali-inline-calendar>,
// <jalali-range-picker>, <jalali-time-range-picker>, and <jalali-event-calendar>.
import '@jalali-js/ui-web';
import type {
  EventCalendarEventClickDetail,
  JalaliEventCalendarElement,
  JalaliInlineCalendarElement,
  RangePickerChangeEventDetail,
  TimeRangePickerChangeEventDetail,
} from '@jalali-js/ui-web';
import type { CalendarDate, CalendarEvent } from 'jalali-js';
import { createCalendar } from 'jalali-js';

const jalaliToday = createCalendar({ system: 'jalali' }).today();
document.getElementById('calendar-summary')!.textContent =
  `امروز: ${formatDate(jalaliToday, localePackFor('fa'), { style: 'long', weekday: true })}`;

// Loaded as a string, not a global side-effect import, so the dark theme can be toggled: it
// only overrides --jalali-* custom properties on [data-jalali-*] elements, so injecting or
// removing it as a <style> tag turns the picker theme on and off cleanly (the same technique
// the React and Vue playgrounds use).
const darkStyleEl = document.createElement('style');
darkStyleEl.textContent = darkThemeCss;

const darkToggle = document.getElementById('dark-toggle') as HTMLInputElement;
function applyDarkMode(): void {
  document.body.style.background = darkToggle.checked ? '#141414' : '#ffffff';
  document.body.style.color = darkToggle.checked ? '#ededed' : '#1a1a1a';
  if (darkToggle.checked) document.head.appendChild(darkStyleEl);
  else darkStyleEl.remove();
}
darkToggle.addEventListener('change', applyDarkMode);
applyDarkMode();

const localeToggle = document.getElementById('locale-toggle') as HTMLInputElement;
function applyLocale(): void {
  const locale: LocaleCode = localeToggle.checked ? 'en' : 'fa';
  for (const node of document.querySelectorAll('.locale-follows')) {
    (node as HTMLElement & { locale: LocaleCode }).locale = locale;
  }
}
localeToggle.addEventListener('change', applyLocale);
applyLocale();

document
  .querySelector('[data-testid="grid-en-jalali"] jalali-date-picker')!
  .addEventListener('change', (event) => {
    const { value } = (event as CustomEvent<DatePickerChangeEventDetail>).detail;
    document.getElementById('stored-value')!.textContent = JSON.stringify(value);
  });

const noInitialPicker = document.getElementById('no-initial-picker') as JalaliDatePickerElement;
noInitialPicker.defaultDate = null;

document
  .querySelector('[data-testid="inline-calendar"] jalali-inline-calendar')!
  .addEventListener('select', (event) => {
    const { date } = (event as CustomEvent<{ date: CalendarDate }>).detail;
    document.getElementById('inline-selected')!.textContent = JSON.stringify(date);
  });

document
  .querySelector('[data-testid="range-picker"] jalali-range-picker')!
  .addEventListener('change', (event) => {
    const { value } = (event as CustomEvent<RangePickerChangeEventDetail>).detail;
    document.getElementById('stored-range')!.textContent = JSON.stringify(value);
  });

const timePicker = document.getElementById('time-picker') as JalaliTimePickerElement;
timePicker.value = { hour: 14, minute: 30 };
timePicker.addEventListener('change', (event) => {
  const { time } = (event as CustomEvent<TimePickerChangeEventDetail>).detail;
  document.getElementById('selected-time')!.textContent = JSON.stringify(time);
});
document.getElementById('selected-time')!.textContent = JSON.stringify(timePicker.value);

const datetimePicker = document.getElementById('datetime-picker') as JalaliDatePickerElement;
datetimePicker.defaultDate = {
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
datetimePicker.addEventListener('change', (event) => {
  const { value } = (event as CustomEvent<DatePickerChangeEventDetail>).detail;
  document.getElementById('stored-datetime')!.textContent = JSON.stringify(value);
});

document.getElementById('time-range-picker')!.addEventListener('change', (event) => {
  const { range } = (event as CustomEvent<TimeRangePickerChangeEventDetail>).detail;
  document.getElementById('selected-time-range')!.textContent = JSON.stringify(range);
});

const demoEvents: CalendarEvent[] = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
  {
    id: 'meeting',
    title: 'Meeting',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
    allDay: false,
    startTime: { hour: 14, minute: 0 },
    endTime: { hour: 15, minute: 0 },
  },
];
const eventCalendar = document.getElementById('event-calendar') as JalaliEventCalendarElement;
eventCalendar.initialDisplayedMonth = { year: 1403, month: 5 };
eventCalendar.events = demoEvents;
eventCalendar.addEventListener('event-click', (event) => {
  const { event: clicked } = (event as CustomEvent<EventCalendarEventClickDetail>).detail;
  document.getElementById('event-click-log')!.textContent = clicked.title;
});

// Selection rules are a JS property, not an attribute: the rules object is not representable
// as a plain HTML attribute string.
const rulesCalendar = document.getElementById('rules-calendar') as JalaliInlineCalendarElement;
rulesCalendar.initialDisplayedMonth = { year: 1403, month: 5 };
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
