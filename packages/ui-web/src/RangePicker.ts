import {
  holidayDayChrome,
  isHolidayRegion,
  resolveCalendarHolidays,
  type HolidayRegion,
} from '@jalali-js/holidays';
import type { FormatOptions } from '@jalali-js/i18n';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from '@jalali-js/web';
import type {
  CalendarDate,
  CalendarSystem,
  SelectionRules,
  StorageValue,
  ValueFormat,
} from 'jalali-js';
import {
  buildCalendarGrid,
  compareDates,
  createCalendar,
  isRangeSelectable,
  nextMonth,
  previousMonth,
  toStorageValue,
  weekdayLabelsForGrid,
} from 'jalali-js';
import { positionPopover } from './position-popover.js';

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface RangeStorageValue {
  start: StorageValue;
  end: StorageValue;
}

export interface RangePickerChangeEventDetail {
  value: RangeStorageValue;
  range: DateRange;
}

/**
 * A calendar-grid popup for picking a start and end date, built on the same
 * `buildCalendarGrid()` (from `jalali-js`) that `@jalali-js/web`'s headless
 * `<jalali-calendar>` uses, with its own range-aware cell rendering (`data-range-start`,
 * `data-range-end`, `data-in-range`) rather than reusing it directly, since a single date's
 * selection state and a range's start/end/between are genuinely different per-cell shapes.
 *
 * Selection is two clicks: the first sets the range's start, the second sets its end (picking
 * an end earlier than the current start restarts the range from there instead). A light hover
 * preview shows the range that would result from completing it at the hovered day.
 *
 * Attributes: `system`, `locale`, `value-format`, `placeholder`, `show-holidays`,
 * `block-holidays`, `holiday-region` (`IR` today; `AF` and `TJ` are planned).
 * `.defaultRange` and `.rules` are properties only. Listen for `change`. Default
 * holiday list is Iran (`holiday-region="IR"`).
 *
 * With `.rules`, blocked days render disabled, and a candidate range that crosses a blocked
 * day does not complete: the second click starts a new range instead (see
 * `isRangeSelectable()` in `jalali-js`).
 */
export class JalaliRangePickerElement extends HTMLElement {
  static observedAttributes = [
    'system',
    'locale',
    'value-format',
    'placeholder',
    'show-holidays',
    'block-holidays',
    'holiday-region',
  ];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #valueFormat: ValueFormat = 'gregorian-iso';
  #displayFormat: FormatOptions | undefined;
  #placeholder: string | undefined;
  #defaultRange: DateRange | undefined;
  #rules: SelectionRules | undefined;
  #showHolidays = false;
  #blockHolidays = false;
  #holidayRegion: HolidayRegion = 'IR';
  #start: CalendarDate | null = null;
  #end: CalendarDate | null = null;
  #hoverDate: CalendarDate | null = null;
  #dayTipEl: HTMLElement | undefined;
  #displayed: { year: number; month: number } | undefined;
  #open = false;
  #connected = false;
  // Populated by #renderPopover(); hover and selection only toggle attributes on these existing
  // buttons (#updateRangeAttributes) rather than rebuilding the grid, so a mouseenter while
  // moving toward a click target never replaces the very button the click is about to land on.
  #dayCells: { date: CalendarDate; button: HTMLButtonElement }[] = [];

  #setDayTip(tip: string | undefined): void {
    if (this.#dayTipEl) this.#dayTipEl.textContent = tip ?? '';
  }

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

  get valueFormat(): ValueFormat {
    return this.#valueFormat;
  }
  set valueFormat(value: ValueFormat) {
    this.#valueFormat = value;
  }

  get displayFormat(): FormatOptions | undefined {
    return this.#displayFormat;
  }
  set displayFormat(value: FormatOptions | undefined) {
    this.#displayFormat = value;
    this.render();
  }

  get placeholder(): string | undefined {
    return this.#placeholder;
  }
  set placeholder(value: string | undefined) {
    this.#placeholder = value;
    this.render();
  }

  get defaultRange(): DateRange | undefined {
    return this.#defaultRange;
  }
  set defaultRange(value: DateRange | undefined) {
    this.#defaultRange = value;
    this.#start = value?.start ?? null;
    this.#end = value?.end ?? null;
    this.#displayed = undefined;
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
    else if (name === 'value-format' && value) this.#valueFormat = value as ValueFormat;
    else if (name === 'placeholder') this.#placeholder = value ?? undefined;
    else if (name === 'show-holidays') this.#showHolidays = value !== null && value !== 'false';
    else if (name === 'block-holidays') this.#blockHolidays = value !== null && value !== 'false';
    else if (name === 'holiday-region' && value && isHolidayRegion(value)) {
      this.#holidayRegion = value;
    }
    if (this.#connected) this.render();
  }

  #today(): CalendarDate {
    return createCalendar({ system: this.#system }).today();
  }

  #ensureDisplayed(): { year: number; month: number } {
    if (!this.#displayed) {
      const anchor = this.#defaultRange?.start ?? this.#today();
      this.#displayed = { year: anchor.year, month: anchor.month };
    }
    return this.#displayed;
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

  #selectDay(date: CalendarDate): void {
    const displayed = this.#ensureDisplayed();
    const { rules } = resolveCalendarHolidays(this.#system, displayed.year, displayed.month, {
      showHolidays: this.#showHolidays,
      blockHolidays: this.#blockHolidays,
      region: this.#holidayRegion,
      rules: this.#rules,
    });
    if (
      !this.#start ||
      this.#end ||
      compareDates(date, this.#start) < 0 ||
      !isRangeSelectable(this.#start, date, rules)
    ) {
      this.#start = date;
      this.#end = null;
      this.#updateRangeAttributes();
      return;
    }
    this.#end = date;
    const range: DateRange = { start: this.#start, end: date };
    this.dispatchEvent(
      new CustomEvent<RangePickerChangeEventDetail>('change', {
        detail: {
          value: {
            start: toStorageValue(range.start, this.#valueFormat),
            end: toStorageValue(range.end, this.#valueFormat),
          },
          range,
        },
        bubbles: true,
      }),
    );
    this.#setOpen(false);
  }

  /** Toggles range-highlight attributes on the already-rendered day buttons, no DOM rebuild. */
  #updateRangeAttributes(): void {
    const previewEnd = this.#end ?? this.#hoverDate;
    for (const { date, button } of this.#dayCells) {
      const isRangeStart = this.#start !== null && compareDates(date, this.#start) === 0;
      const isRangeEnd = previewEnd !== null && compareDates(date, previewEnd) === 0;
      const isInRange =
        this.#start !== null &&
        previewEnd !== null &&
        compareDates(date, this.#start) > 0 &&
        compareDates(date, previewEnd) < 0;
      button.toggleAttribute('data-range-start', isRangeStart);
      button.toggleAttribute('data-range-end', isRangeEnd);
      button.toggleAttribute('data-in-range', isInRange);
    }
  }

  render(): void {
    if (!this.#connected) return;
    const localePack = localePackFor(this.#locale);
    const today = this.#today();
    const displayed = this.#ensureDisplayed();
    this.dir = localePack.direction;

    const displayText = this.#start
      ? this.#end
        ? `${formatDate(this.#start, localePack, this.#displayFormat)} – ${formatDate(this.#end, localePack, this.#displayFormat)}`
        : formatDate(this.#start, localePack, this.#displayFormat)
      : '';

    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.setAttribute('role', 'combobox');
    input.setAttribute('data-jalali-datepicker-input', '');
    input.placeholder = this.#placeholder ?? localePack.rangePickerPlaceholder;
    input.value = displayText;
    input.setAttribute('aria-haspopup', 'dialog');
    input.setAttribute('aria-expanded', this.#open ? 'true' : 'false');
    input.addEventListener('click', () => this.#setOpen(!this.#open));

    this.#clearPositionListeners();

    const children: (Node | string)[] = [input];
    if (this.#open) {
      const popover = this.#renderPopover(localePack, today, displayed);
      input.setAttribute('aria-controls', 'jalali-range-picker-popover');
      popover.id = 'jalali-range-picker-popover';
      children.push(popover);
      positionPopover(input, popover);
      const update = () => positionPopover(input, popover);
      this.#positionUpdate = update;
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    }
    this.replaceChildren(...children);
  }

  #renderPopover(
    localePack: ReturnType<typeof localePackFor>,
    today: CalendarDate,
    displayed: { year: number; month: number },
  ): HTMLElement {
    const holidayOptions = resolveCalendarHolidays(this.#system, displayed.year, displayed.month, {
      showHolidays: this.#showHolidays,
      blockHolidays: this.#blockHolidays,
      region: this.#holidayRegion,
      rules: this.#rules,
    });
    const weeks = buildCalendarGrid(
      this.#system,
      displayed.year,
      displayed.month,
      today,
      null,
      holidayOptions.rules,
      holidayOptions.isHolidayDay,
    );
    const monthLabel = localePack.monthNames[this.#system].long[displayed.month - 1]!;
    const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
    const previewEnd = this.#end ?? this.#hoverDate;

    const previousBtn = document.createElement('button');
    previousBtn.type = 'button';
    previousBtn.setAttribute('data-jalali-calendar-nav', 'previous');
    previousBtn.setAttribute('aria-label', localePack.ui.previousMonth);
    previousBtn.textContent = '‹';
    previousBtn.addEventListener('click', () => {
      this.#displayed = previousMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-jalali-calendar-nav', 'next');
    nextBtn.setAttribute('aria-label', localePack.ui.nextMonth);
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => {
      this.#displayed = nextMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });

    const title = document.createElement('span');
    title.setAttribute('data-jalali-calendar-title', '');
    title.textContent = `${monthLabel} ${yearLabel}`;

    const header = document.createElement('div');
    header.setAttribute('data-jalali-calendar-header', '');
    header.append(previousBtn, title, nextBtn);

    const weekdayRow = document.createElement('div');
    weekdayRow.setAttribute('role', 'row');
    weekdayRow.setAttribute('data-jalali-calendar-weekdays', '');
    for (const name of weekdayLabelsForGrid(localePack.weekdayNames.short, this.#system)) {
      const span = document.createElement('span');
      span.setAttribute('role', 'columnheader');
      span.setAttribute('data-jalali-calendar-weekday', '');
      span.textContent = name;
      weekdayRow.append(span);
    }

    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('data-jalali-calendar-grid', '');
    grid.append(weekdayRow);

    this.#dayCells = [];
    for (const week of weeks) {
      const row = document.createElement('div');
      row.setAttribute('role', 'row');
      row.setAttribute('data-jalali-calendar-week', '');
      for (const cell of week) {
        const isRangeStart = this.#start !== null && compareDates(cell.date, this.#start) === 0;
        const isRangeEnd = previewEnd !== null && compareDates(cell.date, previewEnd) === 0;
        const isInRange =
          this.#start !== null &&
          previewEnd !== null &&
          compareDates(cell.date, this.#start) > 0 &&
          compareDates(cell.date, previewEnd) < 0;

        const day = document.createElement('button');
        day.type = 'button';
        day.setAttribute('role', 'gridcell');
        day.setAttribute('data-jalali-calendar-day', '');
        if (cell.isToday) day.setAttribute('data-today', '');
        if (!cell.isCurrentMonth) day.setAttribute('data-outside-month', '');
        const { tip, ariaLabel, blocked } = holidayDayChrome(
          formatDate(cell.date, localePack, { style: 'long' }),
          cell,
          {
            locale: this.#locale,
            region: this.#holidayRegion,
            closedLabel: localePack.ui.closedDay,
          },
        );
        if (cell.isHoliday) day.setAttribute('data-holiday', '');
        if (isRangeStart) day.setAttribute('data-range-start', '');
        if (isRangeEnd) day.setAttribute('data-range-end', '');
        if (isInRange) day.setAttribute('data-in-range', '');
        if (cell.isToday) day.setAttribute('aria-current', 'date');
        if (tip) day.setAttribute('data-jalali-day-tip', tip);
        if (blocked) {
          day.setAttribute('data-disabled', '');
          day.setAttribute('aria-disabled', blocked['aria-disabled']);
          day.tabIndex = blocked.tabIndex;
        }
        day.setAttribute('aria-label', ariaLabel);
        day.textContent = formatNumber(
          cell.date.day,
          localePack.defaultNumerals,
          localePack.digits,
        );
        day.addEventListener('click', () => {
          if (blocked) return;
          this.#selectDay(cell.date);
        });
        day.addEventListener('mouseenter', () => {
          this.#hoverDate = cell.date;
          this.#updateRangeAttributes();
          this.#setDayTip(tip);
        });
        day.addEventListener('mouseleave', () => {
          this.#hoverDate = null;
          this.#updateRangeAttributes();
          this.#setDayTip(undefined);
        });
        day.addEventListener('focus', () => this.#setDayTip(tip));
        day.addEventListener('blur', () => this.#setDayTip(undefined));
        this.#dayCells.push({ date: cell.date, button: day });
        row.append(day);
      }
      grid.append(row);
    }

    const tipEl = document.createElement('div');
    tipEl.setAttribute('data-jalali-calendar-tip', '');
    tipEl.setAttribute('aria-hidden', 'true');
    this.#dayTipEl = tipEl;

    const calendarRoot = document.createElement('div');
    calendarRoot.dir = localePack.direction;
    calendarRoot.setAttribute('data-jalali-calendar-root', '');
    calendarRoot.append(header, grid, tipEl);

    const popover = document.createElement('div');
    popover.setAttribute('data-jalali-datepicker-popover', '');
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', localePack.ui.chooseDateRange);
    popover.append(calendarRoot);
    return popover;
  }
}

export function defineRangePickerElement(): void {
  if (!customElements.get('jalali-range-picker')) {
    customElements.define('jalali-range-picker', JalaliRangePickerElement);
  }
}
