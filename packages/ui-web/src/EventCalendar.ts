import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from '@jalali-js/web';
import type { CalendarDate, CalendarEvent, CalendarSystem } from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  findEventById,
  layoutMonthEvents,
  nextMonth,
  previousMonth,
} from 'jalali-js';

export interface EventCalendarEventClickDetail {
  event: CalendarEvent;
}

export interface EventCalendarDayClickDetail {
  date: CalendarDate;
}

/**
 * Month event calendar as a Web Component. The consumer owns the event list
 * and editing UI. Set `.events` and listen for `event-click` / `day-click`.
 */
export class JalaliEventCalendarElement extends HTMLElement {
  static observedAttributes = ['system', 'locale'];

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #events: readonly CalendarEvent[] = [];
  #initialDisplayedMonth: { year: number; month: number } | undefined;
  #displayed: { year: number; month: number } | undefined;
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

  get events(): readonly CalendarEvent[] {
    return this.#events;
  }
  set events(value: readonly CalendarEvent[]) {
    this.#events = value;
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
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    if (this.#connected) this.render();
  }

  #ensureDisplayed(): { year: number; month: number } {
    if (!this.#displayed) {
      const today = createCalendar({ system: this.#system }).today();
      this.#displayed = this.#initialDisplayedMonth ?? { year: today.year, month: today.month };
    }
    return this.#displayed;
  }

  render(): void {
    if (!this.#connected) return;
    const localePack = localePackFor(this.#locale);
    const today = createCalendar({ system: this.#system }).today();
    const displayed = this.#ensureDisplayed();
    const weeks = buildCalendarGrid(this.#system, displayed.year, displayed.month, today, null);
    const weekLayouts = layoutMonthEvents(this.#events, weeks);
    const monthLabel = localePack.monthNames[this.#system].long[displayed.month - 1]!;
    const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
    const previousGlyph = localePack.direction === 'rtl' ? '›' : '‹';
    const nextGlyph = localePack.direction === 'rtl' ? '‹' : '›';

    this.dir = localePack.direction;
    this.setAttribute('data-jalali-calendar-root', '');
    this.setAttribute('data-jalali-eventcalendar-root', '');

    const header = document.createElement('div');
    header.setAttribute('data-jalali-calendar-header', '');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.setAttribute('data-jalali-calendar-nav', 'previous');
    prev.setAttribute('aria-label', 'Previous month');
    prev.textContent = previousGlyph;
    prev.addEventListener('click', () => {
      this.#displayed = previousMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });

    const title = document.createElement('span');
    title.setAttribute('data-jalali-calendar-title', '');
    title.textContent = `${monthLabel} ${yearLabel}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.setAttribute('data-jalali-calendar-nav', 'next');
    next.setAttribute('aria-label', 'Next month');
    next.textContent = nextGlyph;
    next.addEventListener('click', () => {
      this.#displayed = nextMonth(this.#system, displayed.year, displayed.month);
      this.render();
    });

    header.append(prev, title, next);

    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('data-jalali-calendar-grid', '');
    grid.setAttribute('data-jalali-eventcalendar-grid', '');

    const weekdays = document.createElement('div');
    weekdays.setAttribute('role', 'row');
    weekdays.setAttribute('data-jalali-calendar-weekdays', '');
    for (const name of localePack.weekdayNames.short) {
      const cell = document.createElement('span');
      cell.setAttribute('role', 'columnheader');
      cell.setAttribute('data-jalali-calendar-weekday', '');
      cell.textContent = name;
      weekdays.append(cell);
    }
    grid.append(weekdays);

    weeks.forEach((week, weekIndex) => {
      const segments = weekLayouts[weekIndex] ?? [];
      const laneCount = segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0);
      const row = document.createElement('div');
      row.setAttribute('role', 'row');
      row.setAttribute('data-jalali-eventcalendar-week', '');

      const days = document.createElement('div');
      days.setAttribute('data-jalali-eventcalendar-days', '');
      for (const cell of week) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('role', 'gridcell');
        button.setAttribute('data-jalali-calendar-day', '');
        if (cell.isToday) button.setAttribute('data-today', '');
        if (!cell.isCurrentMonth) button.setAttribute('data-outside-month', '');
        if (cell.isToday) button.setAttribute('aria-current', 'date');
        button.setAttribute('aria-label', formatDate(cell.date, localePack, { style: 'long' }));
        button.textContent = formatNumber(
          cell.date.day,
          localePack.defaultNumerals,
          localePack.digits,
        );
        button.addEventListener('click', () => {
          this.dispatchEvent(
            new CustomEvent<EventCalendarDayClickDetail>('day-click', {
              detail: { date: cell.date },
              bubbles: true,
            }),
          );
        });
        days.append(button);
      }

      const lanes = document.createElement('div');
      lanes.setAttribute('data-jalali-eventcalendar-lanes', '');
      if (laneCount > 0) lanes.style.gridTemplateRows = `repeat(${laneCount}, auto)`;
      for (const segment of segments) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-jalali-eventcalendar-event', '');
        if (segment.continuesBefore) button.setAttribute('data-continues-before', '');
        if (segment.continuesAfter) button.setAttribute('data-continues-after', '');
        if (segment.allDay) button.setAttribute('data-all-day', '');
        button.style.gridColumn = `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`;
        button.style.gridRow = `${segment.lane + 1}`;
        button.textContent = segment.title;
        button.addEventListener('click', (click) => {
          click.stopPropagation();
          const matched = findEventById(this.#events, segment.eventId);
          if (!matched) return;
          this.dispatchEvent(
            new CustomEvent<EventCalendarEventClickDetail>('event-click', {
              detail: { event: matched },
              bubbles: true,
            }),
          );
        });
        lanes.append(button);
      }

      row.append(days, lanes);
      grid.append(row);
    });

    this.replaceChildren(header, grid);
  }
}

export function defineEventCalendarElement(
  tag = 'jalali-event-calendar',
): typeof JalaliEventCalendarElement {
  if (!customElements.get(tag)) {
    customElements.define(tag, JalaliEventCalendarElement);
  }
  return JalaliEventCalendarElement;
}
