import { format as formatDate } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem, StorageValue, ValueFormat } from 'jalali-js';
import { createCalendar, toStorageValue } from 'jalali-js';
import { JalaliCalendarElement, type CalendarSelectEventDetail } from './Calendar.js';
import { JalaliDropdownDateFieldsElement } from './DropdownDateFields.js';
import { el } from './dom.js';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from './locale.js';

export interface DatePickerChangeEventDetail {
  value: StorageValue;
  date: CalendarDate;
}

export type Variant = 'grid' | 'dropdown';

/**
 * A working, default-styled date picker built on `<jalali-calendar>` (the headless primitive)
 * and `<jalali-dropdown-date-fields>`. Import `@jalali-js/web/date-picker.css` for its default
 * appearance, or style `[data-jalali-datepicker-*]` yourself; nothing here requires the
 * stylesheet to function, and nothing is hidden behind a shadow boundary.
 *
 * `.value` (the property, not an attribute: a `StorageValue` is not always a plain string) is
 * the *storage* value, shaped by `value-format`, not the raw `CalendarDate`; listen for
 * `change` to read both forms. `.defaultDate` seeds the initial selection: unset defaults to
 * today, `null` opens with nothing selected (showing `placeholder`).
 *
 * Attributes: `system`, `locale`, `variant` ('grid' | 'dropdown'), `value-format`,
 * `placeholder`, `quick-nav` (set to "false" to turn off; grid variant only).
 */
export class JalaliDatePickerElement extends HTMLElement {
  static observedAttributes = [
    'system',
    'locale',
    'variant',
    'value-format',
    'placeholder',
    'quick-nav',
  ];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #variant: Variant = 'grid';
  #valueFormat: ValueFormat = 'gregorian-iso';
  #placeholder: string | undefined;
  #quickNav = true;
  #defaultDate: CalendarDate | null | undefined;
  #date: CalendarDate | null = null;
  #dateInitialized = false;
  #open = false;
  #connected = false;

  #onPointerDown = (event: PointerEvent): void => {
    if (!this.contains(event.target as Node)) this.#setOpen(false);
  };
  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.#setOpen(false);
  };

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

  get variant(): Variant {
    return this.#variant;
  }
  set variant(value: Variant) {
    this.#variant = value;
    this.render();
  }

  get valueFormat(): ValueFormat {
    return this.#valueFormat;
  }
  set valueFormat(value: ValueFormat) {
    this.#valueFormat = value;
  }

  get placeholder(): string | undefined {
    return this.#placeholder;
  }
  set placeholder(value: string | undefined) {
    this.#placeholder = value;
    this.render();
  }

  get quickNav(): boolean {
    return this.#quickNav;
  }
  set quickNav(value: boolean) {
    this.#quickNav = value;
    this.render();
  }

  /** Unset: defaults to today. `null`: no initial selection. */
  get defaultDate(): CalendarDate | null | undefined {
    return this.#defaultDate;
  }
  set defaultDate(value: CalendarDate | null | undefined) {
    this.#defaultDate = value;
    this.#dateInitialized = false;
    this.render();
  }

  /** The current selection, or `null`. Setting it does not emit `change`. */
  get value(): CalendarDate | null {
    this.#ensureDateInitialized();
    return this.#date;
  }
  set value(value: CalendarDate | null) {
    this.#date = value;
    this.#dateInitialized = true;
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.setAttribute('data-jalali-datepicker-root', '');
    this.render();
  }

  disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.#onPointerDown);
    document.removeEventListener('keydown', this.#onKeyDown);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'variant') this.#variant = value === 'dropdown' ? 'dropdown' : 'grid';
    else if (name === 'value-format' && value) this.#valueFormat = value as ValueFormat;
    else if (name === 'placeholder') this.#placeholder = value ?? undefined;
    else if (name === 'quick-nav') this.#quickNav = value !== 'false';
    if (this.#connected) this.render();
  }

  #ensureDateInitialized(): void {
    if (this.#dateInitialized) return;
    this.#date =
      this.#defaultDate === null
        ? null
        : (this.#defaultDate ?? createCalendar({ system: this.#system }).today());
    this.#dateInitialized = true;
  }

  #setOpen(open: boolean): void {
    if (this.#open === open) return;
    this.#open = open;
    if (open) {
      document.addEventListener('pointerdown', this.#onPointerDown);
      document.addEventListener('keydown', this.#onKeyDown);
    } else {
      document.removeEventListener('pointerdown', this.#onPointerDown);
      document.removeEventListener('keydown', this.#onKeyDown);
    }
    this.render();
  }

  #selectDate(next: CalendarDate): void {
    this.#date = next;
    this.#dateInitialized = true;
    this.dispatchEvent(
      new CustomEvent<DatePickerChangeEventDetail>('change', {
        detail: { value: toStorageValue(next, this.#valueFormat), date: next },
        bubbles: true,
      }),
    );
  }

  render(): void {
    if (!this.#connected) return;
    this.#ensureDateInitialized();
    const localePack = localePackFor(this.#locale);
    this.dir = localePack.direction;

    if (this.#variant === 'dropdown') {
      const today = createCalendar({ system: this.#system }).today();
      const fields = new JalaliDropdownDateFieldsElement();
      fields.system = this.#system;
      fields.locale = this.#locale;
      fields.date = this.#date ?? today;
      fields.addEventListener('change', (event) => {
        this.#selectDate((event as CustomEvent<{ date: CalendarDate }>).detail.date);
      });
      this.replaceChildren(fields);
      return;
    }

    const input = el('input', {
      type: 'text',
      readonly: true,
      role: 'combobox',
      'data-jalali-datepicker-input': true,
      placeholder: this.#placeholder ?? localePack.datePickerPlaceholder,
      'aria-haspopup': 'dialog',
      'aria-expanded': this.#open ? 'true' : 'false',
    });
    input.value = this.#date ? formatDate(this.#date, localePack) : '';
    input.addEventListener('click', () => this.#setOpen(!this.#open));

    const children: (Node | string)[] = [input];

    if (this.#open) {
      const calendar = new JalaliCalendarElement();
      calendar.system = this.#system;
      calendar.locale = this.#locale;
      calendar.quickNav = this.#quickNav;
      calendar.value = this.#date;
      calendar.addEventListener('select', (event) => {
        this.#selectDate((event as CustomEvent<CalendarSelectEventDetail>).detail.date);
        this.#setOpen(false);
      });
      const popover = el(
        'div',
        { 'data-jalali-datepicker-popover': true, role: 'dialog', 'aria-label': 'Choose a date' },
        [calendar],
      );
      input.setAttribute('aria-controls', 'jalali-datepicker-popover');
      popover.id = 'jalali-datepicker-popover';
      children.push(popover);
    }

    this.replaceChildren(...children);
  }
}

export function defineDatePickerElement(): void {
  if (!customElements.get('jalali-date-picker')) {
    customElements.define('jalali-date-picker', JalaliDatePickerElement);
  }
}
