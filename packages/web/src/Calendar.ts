import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem, SelectionRules } from 'jalali-js';
import { buildCalendarGrid, createCalendar, nextMonth, previousMonth } from 'jalali-js';
import { el } from './dom.js';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from './locale.js';

const YEARS_PER_PAGE = 12;

function yearPageStart(year: number): number {
  return year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);
}

type CalendarView = 'day' | 'month' | 'year';

export interface CalendarSelectEventDetail {
  date: CalendarDate;
}

/**
 * A headless month grid, in light DOM (no shadow root): it renders plain markup with data
 * attributes (`data-selected`, `data-today`, `data-outside-month`) and no required CSS, styled
 * by the same `date-picker.css` the React and Vue bindings use, since nothing here is hidden
 * behind a shadow boundary. `<jalali-date-picker>` is this same element with a default
 * stylesheet and a popover wrapped around it.
 *
 * With `quickNav` (default on), clicking the month or year in the header opens a month grid or
 * a year grid, so a person can jump years ahead without paging one month at a time. Picking a
 * year moves to the month grid; picking a month moves to the day grid.
 *
 * Attributes: `system` ('jalali' | 'gregorian'), `locale` ('en' | 'fa' | 'ps'), `quick-nav` (set to
 * "false" to turn off). `value`, `initial-displayed-month`, and `rules` are properties only,
 * since none of them is representable as a plain HTML attribute string. Listen for `select`.
 *
 * Days blocked by `rules` render as disabled buttons with a `data-disabled` attribute: clicks
 * do nothing and the Tab order skips them.
 */
export class JalaliCalendarElement extends HTMLElement {
  static observedAttributes = ['system', 'locale', 'quick-nav'];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #value: CalendarDate | null = null;
  #rules: SelectionRules | undefined;
  #initialDisplayedMonth: { year: number; month: number } | undefined;
  #quickNav = true;
  #displayed: { year: number; month: number } | undefined;
  #view: CalendarView = 'day';
  #yearPage = 0;
  #connected = false;

  get system(): CalendarSystem {
    return this.#system;
  }
  set system(value: CalendarSystem) {
    this.#system = value;
    this.#displayed = undefined;
    this.render();
  }

  get locale(): LocaleCode {
    return this.#locale;
  }
  set locale(value: LocaleCode) {
    this.#locale = value;
    this.render();
  }

  get quickNav(): boolean {
    return this.#quickNav;
  }
  set quickNav(value: boolean) {
    this.#quickNav = value;
    this.render();
  }

  get value(): CalendarDate | null {
    return this.#value;
  }
  set value(value: CalendarDate | null) {
    this.#value = value;
    this.render();
  }

  get rules(): SelectionRules | undefined {
    return this.#rules;
  }
  set rules(value: SelectionRules | undefined) {
    this.#rules = value;
    this.render();
  }

  get initialDisplayedMonth(): { year: number; month: number } | undefined {
    return this.#initialDisplayedMonth;
  }
  set initialDisplayedMonth(value: { year: number; month: number } | undefined) {
    this.#initialDisplayedMonth = value;
    this.#displayed = undefined;
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.setAttribute('data-jalali-calendar-root', '');
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'quick-nav') this.#quickNav = value !== 'false';
    if (this.#connected) this.render();
  }

  #today(): CalendarDate {
    return createCalendar({ system: this.#system }).today();
  }

  #ensureDisplayed(): { year: number; month: number } {
    if (!this.#displayed) {
      const today = this.#today();
      this.#displayed = this.#initialDisplayedMonth ?? {
        year: this.#value?.year ?? today.year,
        month: this.#value?.month ?? today.month,
      };
    }
    return this.#displayed;
  }

  #emitSelect(date: CalendarDate): void {
    this.dispatchEvent(
      new CustomEvent<CalendarSelectEventDetail>('select', { detail: { date }, bubbles: true }),
    );
  }

  #titlePart(
    text: string,
    dataAttr: 'data-jalali-calendar-title-month' | 'data-jalali-calendar-title-year',
    ariaLabel: string,
    onClick: () => void,
  ): HTMLElement {
    if (!this.#quickNav) {
      return el('span', { [dataAttr]: true }, [text]);
    }
    const button = el('button', { type: 'button', [dataAttr]: true, 'aria-label': ariaLabel }, [
      text,
    ]);
    button.addEventListener('click', onClick);
    return button;
  }

  render(): void {
    if (!this.#connected) return;
    const localePack = localePackFor(this.#locale);
    const today = this.#today();
    const displayed = this.#ensureDisplayed();
    this.dir = localePack.direction;
    this.setAttribute('data-jalali-calendar-view', this.#view);

    const previousGlyph = localePack.direction === 'rtl' ? '›' : '‹';
    const nextGlyph = localePack.direction === 'rtl' ? '‹' : '›';

    const openMonthView = (): void => {
      this.#view = 'month';
      this.render();
    };
    const openYearView = (): void => {
      this.#yearPage = yearPageStart(displayed.year);
      this.#view = 'year';
      this.render();
    };
    const pickMonth = (month: number): void => {
      this.#displayed = { ...displayed, month };
      this.#view = 'day';
      this.render();
    };
    const pickYear = (year: number): void => {
      this.#displayed = { ...displayed, year };
      this.#view = 'month';
      this.render();
    };

    let body: DocumentFragment;
    if (this.#view === 'day') {
      body = this.#renderDayView(
        localePack,
        today,
        displayed,
        previousGlyph,
        nextGlyph,
        openMonthView,
        openYearView,
      );
    } else if (this.#view === 'month') {
      body = this.#renderMonthView(
        localePack,
        today,
        displayed,
        previousGlyph,
        nextGlyph,
        openYearView,
        pickMonth,
      );
    } else {
      body = this.#renderYearView(localePack, today, displayed, previousGlyph, nextGlyph, pickYear);
    }
    this.replaceChildren(body);
  }

  #renderDayView(
    localePack: ReturnType<typeof localePackFor>,
    today: CalendarDate,
    displayed: { year: number; month: number },
    previousGlyph: string,
    nextGlyph: string,
    openMonthView: () => void,
    openYearView: () => void,
  ): DocumentFragment {
    const monthLabel = localePack.monthNames[this.#system].long[displayed.month - 1]!;
    const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
    const weeks = buildCalendarGrid(
      this.#system,
      displayed.year,
      displayed.month,
      today,
      this.#value,
      this.#rules,
    );

    const previousBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'previous', 'aria-label': 'Previous month' },
      [previousGlyph],
    );
    previousBtn.addEventListener('click', () => {
      this.#displayed = previousMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });
    const nextBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'next', 'aria-label': 'Next month' },
      [nextGlyph],
    );
    nextBtn.addEventListener('click', () => {
      this.#displayed = nextMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });

    const title = el('div', { 'data-jalali-calendar-title': true }, [
      this.#titlePart(
        monthLabel,
        'data-jalali-calendar-title-month',
        'Choose month',
        openMonthView,
      ),
      this.#titlePart(yearLabel, 'data-jalali-calendar-title-year', 'Choose year', openYearView),
    ]);

    const header = el('div', { 'data-jalali-calendar-header': true }, [
      previousBtn,
      title,
      nextBtn,
    ]);

    const weekdayRow = el(
      'div',
      { role: 'row', 'data-jalali-calendar-weekdays': true },
      localePack.weekdayNames.short.map((name) =>
        el('span', { role: 'columnheader', 'data-jalali-calendar-weekday': true }, [name]),
      ),
    );

    const weekRows = weeks.map((week) =>
      el(
        'div',
        { role: 'row', 'data-jalali-calendar-week': true },
        week.map((cell) => {
          const day = el(
            'button',
            {
              type: 'button',
              role: 'gridcell',
              'data-jalali-calendar-day': true,
              'data-selected': cell.isSelected,
              'data-today': cell.isToday,
              'data-outside-month': !cell.isCurrentMonth,
              'data-disabled': !cell.isSelectable,
              disabled: !cell.isSelectable,
              'aria-selected': cell.isSelected ? 'true' : 'false',
              'aria-current': cell.isToday ? 'date' : undefined,
              'aria-label': formatDate(cell.date, localePack, { style: 'long' }),
            },
            [formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)],
          );
          day.addEventListener('click', () => this.#emitSelect(cell.date));
          return day;
        }),
      ),
    );

    const grid = el('div', { role: 'grid', 'data-jalali-calendar-grid': true }, [
      weekdayRow,
      ...weekRows,
    ]);

    const fragment = document.createDocumentFragment();
    fragment.append(header, grid);
    return fragment;
  }

  #renderMonthView(
    localePack: ReturnType<typeof localePackFor>,
    today: CalendarDate,
    displayed: { year: number; month: number },
    previousGlyph: string,
    nextGlyph: string,
    openYearView: () => void,
    pickMonth: (month: number) => void,
  ): DocumentFragment {
    const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);

    const previousBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'previous', 'aria-label': 'Previous year' },
      [previousGlyph],
    );
    previousBtn.addEventListener('click', () => {
      this.#displayed = { ...displayed, year: displayed.year - 1 };
      this.render();
    });
    const nextBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'next', 'aria-label': 'Next year' },
      [nextGlyph],
    );
    nextBtn.addEventListener('click', () => {
      this.#displayed = { ...displayed, year: displayed.year + 1 };
      this.render();
    });

    const title = el('div', { 'data-jalali-calendar-title': true }, [
      this.#titlePart(yearLabel, 'data-jalali-calendar-title-year', 'Choose year', openYearView),
    ]);
    const header = el('div', { 'data-jalali-calendar-header': true }, [
      previousBtn,
      title,
      nextBtn,
    ]);

    const months = el(
      'div',
      { role: 'listbox', 'aria-label': 'Month', 'data-jalali-calendar-months': true },
      localePack.monthNames[this.#system].long.map((name, index) => {
        const month = index + 1;
        const isSelected = displayed.month === month;
        const isCurrent = today.year === displayed.year && today.month === month;
        const button = el(
          'button',
          {
            type: 'button',
            role: 'option',
            'data-jalali-calendar-month': true,
            'data-selected': isSelected,
            'data-today': isCurrent,
            'aria-selected': isSelected ? 'true' : 'false',
            'aria-current': isCurrent ? 'true' : undefined,
          },
          [name],
        );
        button.addEventListener('click', () => pickMonth(month));
        return button;
      }),
    );

    const fragment = document.createDocumentFragment();
    fragment.append(header, months);
    return fragment;
  }

  #renderYearView(
    localePack: ReturnType<typeof localePackFor>,
    today: CalendarDate,
    displayed: { year: number; month: number },
    previousGlyph: string,
    nextGlyph: string,
    pickYear: (year: number) => void,
  ): DocumentFragment {
    const previousBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'previous', 'aria-label': 'Previous years' },
      [previousGlyph],
    );
    previousBtn.addEventListener('click', () => {
      this.#yearPage -= YEARS_PER_PAGE;
      this.render();
    });
    const nextBtn = el(
      'button',
      { type: 'button', 'data-jalali-calendar-nav': 'next', 'aria-label': 'Next years' },
      [nextGlyph],
    );
    nextBtn.addEventListener('click', () => {
      this.#yearPage += YEARS_PER_PAGE;
      this.render();
    });

    const start = formatNumber(this.#yearPage, localePack.defaultNumerals, localePack.digits);
    const end = formatNumber(
      this.#yearPage + YEARS_PER_PAGE - 1,
      localePack.defaultNumerals,
      localePack.digits,
    );
    const title = el('span', { 'data-jalali-calendar-title': true }, [`${start} – ${end}`]);
    const header = el('div', { 'data-jalali-calendar-header': true }, [
      previousBtn,
      title,
      nextBtn,
    ]);

    const years = el(
      'div',
      { role: 'listbox', 'aria-label': 'Year', 'data-jalali-calendar-years': true },
      Array.from({ length: YEARS_PER_PAGE }, (_, index) => this.#yearPage + index).map((year) => {
        const isSelected = displayed.year === year;
        const isCurrent = today.year === year;
        const button = el(
          'button',
          {
            type: 'button',
            role: 'option',
            'data-jalali-calendar-year': true,
            'data-selected': isSelected,
            'data-today': isCurrent,
            'aria-selected': isSelected ? 'true' : 'false',
            'aria-current': isCurrent ? 'true' : undefined,
          },
          [formatNumber(year, localePack.defaultNumerals, localePack.digits)],
        );
        button.addEventListener('click', () => pickYear(year));
        return button;
      }),
    );

    const fragment = document.createDocumentFragment();
    fragment.append(header, years);
    return fragment;
  }
}

export function defineCalendarElements(): void {
  if (!customElements.get('jalali-calendar')) {
    customElements.define('jalali-calendar', JalaliCalendarElement);
  }
}
