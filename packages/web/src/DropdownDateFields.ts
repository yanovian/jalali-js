import { formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { getCalendarEngine } from 'jalali-js';
import { el } from './dom.js';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from './locale.js';

export interface DropdownDateFieldsChangeEventDetail {
  date: CalendarDate;
}

/**
 * The `variant="dropdown"` alternative to the calendar-grid popup: three plain `<select>`
 * elements. Better suited than a grid to narrow, known-range entry such as a date of birth.
 * `<jalali-date-picker variant="dropdown">` renders this internally; use
 * `<jalali-dropdown-date-fields>` directly for that same entry style with no popover at all.
 *
 * Attributes: `system`, `locale`, `year-range-min`, `year-range-max` (default: 100 years back,
 * 10 forward, from the current `date`). `date` is a property only. Listen for `change`.
 */
export class JalaliDropdownDateFieldsElement extends HTMLElement {
  static observedAttributes = ['system', 'locale'];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #date: CalendarDate | undefined;
  #yearRangeMin: number | undefined;
  #yearRangeMax: number | undefined;
  #connected = false;

  get system(): CalendarSystem {
    return this.#system;
  }
  set system(value: CalendarSystem) {
    this.#system = value;
    this.render();
  }

  get locale(): LocaleCode {
    return this.#locale;
  }
  set locale(value: LocaleCode) {
    this.#locale = value;
    this.render();
  }

  get date(): CalendarDate | undefined {
    return this.#date;
  }
  set date(value: CalendarDate | undefined) {
    this.#date = value;
    this.render();
  }

  get yearRange(): readonly [number, number] | undefined {
    return this.#yearRangeMin !== undefined && this.#yearRangeMax !== undefined
      ? [this.#yearRangeMin, this.#yearRangeMax]
      : undefined;
  }
  set yearRange(value: readonly [number, number] | undefined) {
    this.#yearRangeMin = value?.[0];
    this.#yearRangeMax = value?.[1];
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.setAttribute('data-jalali-datepicker-dropdown', '');
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    if (this.#connected) this.render();
  }

  #emitChange(date: CalendarDate): void {
    this.#date = date;
    this.dispatchEvent(
      new CustomEvent<DropdownDateFieldsChangeEventDetail>('change', {
        detail: { date },
        bubbles: true,
      }),
    );
    this.render();
  }

  render(): void {
    if (!this.#connected || !this.#date) return;
    const date = this.#date;
    const localePack = localePackFor(this.#locale);
    const engine = getCalendarEngine(this.#system);
    const [minYear, maxYear] = this.yearRange ?? [date.year - 100, date.year + 10];
    this.dir = localePack.direction;

    const years: number[] = [];
    for (let year = maxYear; year >= minYear; year--) years.push(year);

    const yearSelect = el('select', {
      'aria-label': 'Year',
      'data-jalali-datepicker-field': 'year',
    });
    for (const year of years) {
      const option = el('option', { value: String(year) }, [
        formatNumber(year, localePack.defaultNumerals, localePack.digits),
      ]);
      if (year === date.year) option.selected = true;
      yearSelect.append(option);
    }
    yearSelect.addEventListener('change', (event) => {
      // A native <select> change event would otherwise keep bubbling past `fields` alongside
      // the custom `change` #emitChange dispatches below, and a consumer's listener can't tell
      // them apart by type; only the custom one carries `.detail`.
      event.stopPropagation();
      const year = Number(yearSelect.value);
      const day = Math.min(date.day, engine.daysInMonth(year, date.month));
      this.#emitChange({ ...date, year, day });
    });

    const monthSelect = el('select', {
      'aria-label': 'Month',
      'data-jalali-datepicker-field': 'month',
    });
    localePack.monthNames[this.#system].long.forEach((name, index) => {
      const option = el('option', { value: String(index + 1) }, [name]);
      if (index + 1 === date.month) option.selected = true;
      monthSelect.append(option);
    });
    monthSelect.addEventListener('change', (event) => {
      event.stopPropagation();
      const month = Number(monthSelect.value);
      const day = Math.min(date.day, engine.daysInMonth(date.year, month));
      this.#emitChange({ ...date, month, day });
    });

    const daysInSelectedMonth = engine.daysInMonth(date.year, date.month);
    const daySelect = el('select', { 'aria-label': 'Day', 'data-jalali-datepicker-field': 'day' });
    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const option = el('option', { value: String(day) }, [
        formatNumber(day, localePack.defaultNumerals, localePack.digits),
      ]);
      if (day === date.day) option.selected = true;
      daySelect.append(option);
    }
    daySelect.addEventListener('change', (event) => {
      event.stopPropagation();
      this.#emitChange({ ...date, day: Number(daySelect.value) });
    });

    this.replaceChildren(yearSelect, monthSelect, daySelect);
  }
}

export function defineDropdownDateFieldsElement(): void {
  if (!customElements.get('jalali-dropdown-date-fields')) {
    customElements.define('jalali-dropdown-date-fields', JalaliDropdownDateFieldsElement);
  }
}
