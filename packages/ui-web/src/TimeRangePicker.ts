import type { LocaleCode } from '@jalali-js/web';
import { JalaliTimePickerElement, localePackFor, parseLocaleAttribute } from '@jalali-js/web';
import type { TimeOfDay } from 'jalali-js';

export interface TimeRange {
  start: TimeOfDay;
  end: TimeOfDay;
}

export interface TimeRangePickerChangeEventDetail {
  range: TimeRange;
}

const DEFAULT_RANGE: TimeRange = {
  start: { hour: 9, minute: 0 },
  end: { hour: 17, minute: 0 },
};

/**
 * Two `<jalali-time-picker>`s side by side for a start and end time. Import
 * `@jalali-js/web/date-picker.css` for the default look.
 *
 * Attributes: `locale`, `minute-step`, `disabled-hours`. `.defaultRange` is a property only.
 * Listen for `change`.
 */
export class JalaliTimeRangePickerElement extends HTMLElement {
  static observedAttributes = ['locale', 'minute-step', 'disabled-hours'];

  #locale: LocaleCode = 'en';
  #minuteStep = 1;
  #disabledHours: number[] = [];
  #range: TimeRange = {
    start: { ...DEFAULT_RANGE.start },
    end: { ...DEFAULT_RANGE.end },
  };
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
    this.render();
  }

  get disabledHours(): readonly number[] {
    return this.#disabledHours;
  }
  set disabledHours(value: readonly number[]) {
    this.#disabledHours = [...value];
    this.render();
  }

  get defaultRange(): TimeRange {
    return this.#range;
  }
  set defaultRange(value: TimeRange) {
    this.#range = {
      start: { ...value.start },
      end: { ...value.end },
    };
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.setAttribute('data-jalali-timerangepicker-root', '');
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'minute-step' && value) this.#minuteStep = Number(value);
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

  #emit(range: TimeRange): void {
    this.#range = range;
    this.dispatchEvent(
      new CustomEvent<TimeRangePickerChangeEventDetail>('change', {
        detail: { range },
        bubbles: true,
      }),
    );
    this.render();
  }

  #makePicker(value: TimeOfDay, onChange: (time: TimeOfDay) => void): JalaliTimePickerElement {
    const picker = new JalaliTimePickerElement();
    picker.locale = this.#locale;
    picker.minuteStep = this.#minuteStep;
    picker.disabledHours = this.#disabledHours;
    picker.value = value;
    picker.addEventListener('change', (event) => {
      onChange((event as CustomEvent<{ time: TimeOfDay }>).detail.time);
    });
    return picker;
  }

  render(): void {
    if (!this.#connected) return;
    this.dir = localePackFor(this.#locale).direction;
    const separator = document.createElement('span');
    separator.setAttribute('data-jalali-timerangepicker-separator', '');
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '–';
    this.replaceChildren(
      this.#makePicker(this.#range.start, (start) => this.#emit({ ...this.#range, start })),
      separator,
      this.#makePicker(this.#range.end, (end) => this.#emit({ ...this.#range, end })),
    );
  }
}

export function defineTimeRangePickerElement(): void {
  if (!customElements.get('jalali-time-range-picker')) {
    customElements.define('jalali-time-range-picker', JalaliTimeRangePickerElement);
  }
}
