import { isHolidayRegion, type HolidayRegion } from '@jalali-js/holidays';
import type { LocalePack } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type {
  CalendarDate,
  CalendarDateTime,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  TimeOfDay,
  ValueFormat,
} from 'jalali-js';
import { createCalendar, timeOfDay, toStorageValue, withTime } from 'jalali-js';
import { JalaliCalendarElement, type CalendarSelectEventDetail } from './Calendar.js';
import { JalaliDropdownDateFieldsElement } from './DropdownDateFields.js';
import { JalaliTimePickerElement, type TimePickerChangeEventDetail } from './TimePicker.js';
import { el } from './dom.js';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from './locale.js';
import { positionPopover } from './position-popover.js';

export interface DatePickerChangeEventDetail {
  value: StorageValue;
  date: CalendarDate | CalendarDateTime;
}

export type Variant = 'grid' | 'dropdown';
export type DatePickerPrecision = 'date' | 'datetime';

function displayValue(date: CalendarDate | CalendarDateTime, localePack: LocalePack): string {
  const datePart = formatDate(date, localePack);
  if (date.precision === 'date') return datePart;
  const hour = formatNumber(date.hour, localePack.defaultNumerals, localePack.digits, 2);
  const minute = formatNumber(date.minute, localePack.defaultNumerals, localePack.digits, 2);
  return `${datePart} ${hour}:${minute}`;
}

function asDateOnly(date: CalendarDate | CalendarDateTime): CalendarDate {
  return {
    precision: 'date',
    system: date.system,
    year: date.year,
    month: date.month,
    day: date.day,
  };
}

/**
 * A working, default-styled date picker built on `<jalali-calendar>` (the headless primitive)
 * and `<jalali-dropdown-date-fields>`. With `precision="datetime"`, a `<jalali-time-picker>`
 * sits under the grid. Import `@jalali-js/web/date-picker.css` for its default appearance.
 *
 * Attributes: `system`, `locale`, `variant`, `precision` ('date' | 'datetime'), `minute-step`,
 * `disabled-hours` (comma-separated), `value-format`, `placeholder`, `quick-nav`,
 * `show-holidays`, `block-holidays`, `holiday-region` (`IR` today; `AF` and `TJ` are
 * planned). `.rules` and `.defaultDate` are properties only. Default holiday list is Iran.
 */
export class JalaliDatePickerElement extends HTMLElement {
  static observedAttributes = [
    'system',
    'locale',
    'variant',
    'precision',
    'minute-step',
    'disabled-hours',
    'value-format',
    'placeholder',
    'quick-nav',
    'show-holidays',
    'block-holidays',
    'holiday-region',
  ];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #variant: Variant = 'grid';
  #precision: DatePickerPrecision = 'date';
  #minuteStep = 1;
  #disabledHours: number[] = [];
  #valueFormat: ValueFormat = 'gregorian-iso';
  #placeholder: string | undefined;
  #quickNav = true;
  #defaultDate: CalendarDate | CalendarDateTime | null | undefined;
  #rules: SelectionRules | undefined;
  #showHolidays = false;
  #blockHolidays = false;
  #holidayRegion: HolidayRegion = 'IR';
  #date: CalendarDate | CalendarDateTime | null = null;
  #dateInitialized = false;
  #open = false;
  #connected = false;

  #onPointerDown = (event: PointerEvent): void => {
    if (!this.contains(event.target as Node)) this.#setOpen(false);
  };
  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.#setOpen(false);
  };
  #positionUpdate: (() => void) | null = null;

  #clearPositionListeners(): void {
    if (!this.#positionUpdate) return;
    window.removeEventListener('resize', this.#positionUpdate);
    window.removeEventListener('scroll', this.#positionUpdate, true);
    this.#positionUpdate = null;
  }

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

  get precision(): DatePickerPrecision {
    return this.#precision;
  }
  set precision(value: DatePickerPrecision) {
    this.#precision = value;
    this.#dateInitialized = false;
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
  get defaultDate(): CalendarDate | CalendarDateTime | null | undefined {
    return this.#defaultDate;
  }
  set defaultDate(value: CalendarDate | CalendarDateTime | null | undefined) {
    this.#defaultDate = value;
    this.#dateInitialized = false;
    this.render();
  }

  get rules(): SelectionRules | undefined {
    return this.#rules;
  }
  set rules(value: SelectionRules | undefined) {
    this.#rules = value;
    this.render();
  }

  get showHolidays(): boolean {
    return this.#showHolidays;
  }
  set showHolidays(value: boolean) {
    this.#showHolidays = value;
    this.render();
  }

  get blockHolidays(): boolean {
    return this.#blockHolidays;
  }
  set blockHolidays(value: boolean) {
    this.#blockHolidays = value;
    this.render();
  }

  get holidayRegion(): HolidayRegion {
    return this.#holidayRegion;
  }
  set holidayRegion(value: HolidayRegion) {
    this.#holidayRegion = value;
    this.render();
  }

  /** The current selection, or `null`. Setting it does not emit `change`. */
  get value(): CalendarDate | CalendarDateTime | null {
    this.#ensureDateInitialized();
    return this.#date;
  }
  set value(value: CalendarDate | CalendarDateTime | null) {
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
    this.#clearPositionListeners();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'variant') this.#variant = value === 'dropdown' ? 'dropdown' : 'grid';
    else if (name === 'precision') {
      this.#precision = value === 'datetime' ? 'datetime' : 'date';
      this.#dateInitialized = false;
    } else if (name === 'minute-step' && value) this.#minuteStep = Number(value);
    else if (name === 'disabled-hours') {
      this.#disabledHours = value
        ? value
            .split(',')
            .map((part) => Number(part.trim()))
            .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23)
        : [];
    } else if (name === 'value-format' && value) this.#valueFormat = value as ValueFormat;
    else if (name === 'placeholder') this.#placeholder = value ?? undefined;
    else if (name === 'quick-nav') this.#quickNav = value !== 'false';
    else if (name === 'show-holidays') this.#showHolidays = value !== null && value !== 'false';
    else if (name === 'block-holidays') this.#blockHolidays = value !== null && value !== 'false';
    else if (name === 'holiday-region' && value && isHolidayRegion(value)) {
      this.#holidayRegion = value;
    }
    if (this.#connected) this.render();
  }

  #ensureDateInitialized(): void {
    if (this.#dateInitialized) return;
    if (this.#defaultDate === null) {
      this.#date = null;
    } else {
      const seed = this.#defaultDate ?? createCalendar({ system: this.#system }).today();
      if (this.#precision === 'date') this.#date = asDateOnly(seed);
      else
        this.#date = seed.precision === 'datetime' ? seed : withTime(seed, { hour: 0, minute: 0 });
    }
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

  #emit(next: CalendarDate | CalendarDateTime): void {
    this.#date = next;
    this.#dateInitialized = true;
    this.dispatchEvent(
      new CustomEvent<DatePickerChangeEventDetail>('change', {
        detail: { value: toStorageValue(next, this.#valueFormat), date: next },
        bubbles: true,
      }),
    );
  }

  #selectDay(next: CalendarDate): void {
    const time = this.#date ? timeOfDay(this.#date) : { hour: 0, minute: 0 };
    this.#emit(this.#precision === 'datetime' ? withTime(next, time) : next);
    if (this.#precision === 'date') this.#setOpen(false);
    else this.render();
  }

  #selectTime(time: TimeOfDay): void {
    const today = createCalendar({ system: this.#system }).today();
    this.#emit(withTime(this.#date ?? today, time));
    this.render();
  }

  #makeTimePicker(): JalaliTimePickerElement {
    const timePicker = new JalaliTimePickerElement();
    timePicker.locale = this.#locale;
    timePicker.minuteStep = this.#minuteStep;
    timePicker.disabledHours = this.#disabledHours;
    timePicker.value = this.#date ? timeOfDay(this.#date) : { hour: 0, minute: 0 };
    timePicker.addEventListener('change', (event) => {
      this.#selectTime((event as CustomEvent<TimePickerChangeEventDetail>).detail.time);
    });
    return timePicker;
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
      fields.date = this.#date ? asDateOnly(this.#date) : today;
      fields.addEventListener('change', (event) => {
        this.#selectDay((event as CustomEvent<{ date: CalendarDate }>).detail.date);
      });
      const children: Node[] = [fields];
      if (this.#precision === 'datetime') children.push(this.#makeTimePicker());
      this.replaceChildren(...children);
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
    input.value = this.#date ? displayValue(this.#date, localePack) : '';
    input.addEventListener('click', () => this.#setOpen(!this.#open));

    this.#clearPositionListeners();

    const children: (Node | string)[] = [input];

    if (this.#open) {
      const calendar = new JalaliCalendarElement();
      calendar.system = this.#system;
      calendar.locale = this.#locale;
      calendar.quickNav = this.#quickNav;
      calendar.value = this.#date ? asDateOnly(this.#date) : null;
      calendar.rules = this.#rules;
      calendar.showHolidays = this.#showHolidays;
      calendar.blockHolidays = this.#blockHolidays;
      calendar.holidayRegion = this.#holidayRegion;
      calendar.addEventListener('select', (event) => {
        this.#selectDay((event as CustomEvent<CalendarSelectEventDetail>).detail.date);
      });
      const popoverChildren: Node[] = [calendar];
      if (this.#precision === 'datetime') popoverChildren.push(this.#makeTimePicker());
      const popover = el(
        'div',
        {
          'data-jalali-datepicker-popover': true,
          role: 'dialog',
          'aria-label':
            this.#precision === 'datetime'
              ? localePack.ui.chooseDateAndTime
              : localePack.ui.chooseDate,
        },
        popoverChildren,
      );
      input.setAttribute('aria-controls', 'jalali-datepicker-popover');
      popover.id = 'jalali-datepicker-popover';
      children.push(popover);
      positionPopover(input, popover);
      const update = () => positionPopover(input, popover);
      this.#positionUpdate = update;
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    }

    this.replaceChildren(...children);
  }
}

export function defineDatePickerElement(): void {
  if (!customElements.get('jalali-date-picker')) {
    customElements.define('jalali-date-picker', JalaliDatePickerElement);
  }
}
