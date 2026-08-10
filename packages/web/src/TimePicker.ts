import { formatNumber } from '@jalali-js/i18n';
import type { TimeOfDay } from 'jalali-js';
import { listHours, listMinutes, snapMinute } from 'jalali-js';
import { el } from './dom.js';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from './locale.js';

export interface TimePickerChangeEventDetail {
  time: TimeOfDay;
}

/**
 * A headless hour and minute picker. It renders two `<select>`s with
 * `data-jalali-timepicker-*` attributes and no required CSS. Import
 * `@jalali-js/web/date-picker.css` for the default look.
 *
 * Attributes: `locale`, `minute-step`, `disabled-hours` (comma-separated 0-23).
 * `.value` is a property only (`TimeOfDay`). Listen for `change`.
 */
export class JalaliTimePickerElement extends HTMLElement {
  static observedAttributes = ['locale', 'minute-step', 'disabled-hours'];

  #locale: LocaleCode = 'en';
  #minuteStep = 1;
  #disabledHours: number[] = [];
  #value: TimeOfDay = { hour: 0, minute: 0 };
  #connected = false;

  get locale(): LocaleCode {
    return this.#locale;
  }
  set locale(value: LocaleCode) {
    this.#locale = value;
    this.render();
  }

  get minuteStep(): number {
    return this.#minuteStep;
  }
  set minuteStep(value: number) {
    this.#minuteStep = value;
    this.#value = { ...this.#value, minute: snapMinute(this.#value.minute, value) };
    this.render();
  }

  get disabledHours(): readonly number[] {
    return this.#disabledHours;
  }
  set disabledHours(value: readonly number[]) {
    this.#disabledHours = [...value];
    this.render();
  }

  get value(): TimeOfDay {
    return this.#value;
  }
  set value(value: TimeOfDay) {
    this.#value = { hour: value.hour, minute: snapMinute(value.minute, this.#minuteStep) };
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.setAttribute('data-jalali-timepicker-root', '');
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'minute-step' && value) this.minuteStep = Number(value);
    else if (name === 'disabled-hours') {
      this.#disabledHours = value
        ? value
            .split(',')
            .map((part) => Number(part.trim()))
            .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23)
        : [];
    }
    if (this.#connected) this.render();
  }

  #emit(time: TimeOfDay): void {
    this.#value = time;
    this.dispatchEvent(
      new CustomEvent<TimePickerChangeEventDetail>('change', {
        detail: { time },
        bubbles: true,
      }),
    );
    this.render();
  }

  render(): void {
    if (!this.#connected) return;
    const localePack = localePackFor(this.#locale);
    this.dir = localePack.direction;
    const digit = (n: number) => formatNumber(n, localePack.defaultNumerals, localePack.digits, 2);

    const hourSelect = el('select', {
      'aria-label': 'Hour',
      'data-jalali-timepicker-field': 'hour',
    });
    for (const hour of listHours(this.#disabledHours)) {
      const option = el('option', { value: String(hour) }, [digit(hour)]);
      if (hour === this.#value.hour) option.selected = true;
      hourSelect.append(option);
    }
    hourSelect.addEventListener('change', () => {
      this.#emit({ ...this.#value, hour: Number(hourSelect.value) });
    });

    const minuteSelect = el('select', {
      'aria-label': 'Minute',
      'data-jalali-timepicker-field': 'minute',
    });
    const selectedMinute = snapMinute(this.#value.minute, this.#minuteStep);
    for (const minute of listMinutes(this.#minuteStep)) {
      const option = el('option', { value: String(minute) }, [digit(minute)]);
      if (minute === selectedMinute) option.selected = true;
      minuteSelect.append(option);
    }
    minuteSelect.addEventListener('change', () => {
      this.#emit({ ...this.#value, minute: Number(minuteSelect.value) });
    });

    this.replaceChildren(
      hourSelect,
      el('span', { 'data-jalali-timepicker-separator': true, 'aria-hidden': 'true' }, [':']),
      minuteSelect,
    );
  }
}

export function defineTimePickerElement(): void {
  if (!customElements.get('jalali-time-picker')) {
    customElements.define('jalali-time-picker', JalaliTimePickerElement);
  }
}
