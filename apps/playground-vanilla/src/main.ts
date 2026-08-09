import '@jalali-js/web/date-picker.css';
import '@jalali-js/ui-web/themes/compact.css';
import darkThemeCss from '@jalali-js/ui-web/themes/dark.css?inline';
import type {
  DatePickerChangeEventDetail,
  JalaliDatePickerElement,
  LocaleCode,
} from '@jalali-js/web';
import { localePackFor } from '@jalali-js/web';
import { format as formatDate } from '@jalali-js/i18n';
// A bare import for its side effect: registering <jalali-inline-calendar> and
// <jalali-range-picker>, since only types are imported from it below.
import '@jalali-js/ui-web';
import type { RangePickerChangeEventDetail } from '@jalali-js/ui-web';
import type { CalendarDate } from 'jalali-js';
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
