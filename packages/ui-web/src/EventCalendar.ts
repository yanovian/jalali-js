import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import { localePackFor, parseLocaleAttribute, type LocaleCode } from '@jalali-js/web';
import type {
  CalendarDate,
  CalendarDateFields,
  CalendarEvent,
  CalendarSystem,
  EventCalendarView,
} from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  dayOfWeek,
  daysForEventView,
  eventIsAllDay,
  findEventById,
  isSameDay,
  laneCountOf,
  layoutDaysTimedEvents,
  layoutMonthEvents,
  layoutWeekEvents,
  listHours,
  shiftEventViewAnchor,
  timedBlockStyle,
  weekdayLabelsForGrid,
} from 'jalali-js';

export interface EventCalendarEventClickDetail {
  event: CalendarEvent;
}

export interface EventCalendarDayClickDetail {
  date: CalendarDate;
}

function parseView(value: string | null): EventCalendarView {
  if (value === 'week' || value === 'day') return value;
  return 'month';
}

export class JalaliEventCalendarElement extends HTMLElement {
  static observedAttributes = ['system', 'locale', 'view'];
  static #nextTitleId = 0;

  #system: CalendarSystem = 'jalali';
  #locale: LocaleCode = 'en';
  #view: EventCalendarView = 'month';
  #events: readonly CalendarEvent[] = [];
  #initialDisplayedMonth: { year: number; month: number } | undefined;
  #initialDate: CalendarDateFields | undefined;
  #anchor: CalendarDateFields | undefined;
  #titleId = `jalali-ec-title-${JalaliEventCalendarElement.#nextTitleId++}`;
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

  get view(): EventCalendarView {
    return this.#view;
  }
  set view(value: EventCalendarView) {
    this.#view = value;
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
    this.#anchor = undefined;
    this.render();
  }

  get initialDate(): CalendarDateFields | undefined {
    return this.#initialDate;
  }
  set initialDate(value: CalendarDateFields | undefined) {
    this.#initialDate = value;
    this.#anchor = undefined;
    this.render();
  }

  connectedCallback(): void {
    this.#connected = true;
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'system') this.#system = value === 'gregorian' ? 'gregorian' : 'jalali';
    else if (name === 'locale') this.#locale = parseLocaleAttribute(value);
    else if (name === 'view') this.#view = parseView(value);
    if (this.#connected) this.render();
  }

  #ensureAnchor(): CalendarDateFields {
    if (!this.#anchor) {
      const today = createCalendar({ system: this.#system }).today();
      if (this.#initialDate) this.#anchor = { ...this.#initialDate };
      else if (this.#initialDisplayedMonth) {
        this.#anchor = { ...this.#initialDisplayedMonth, day: 1 };
      } else {
        this.#anchor = { year: today.year, month: today.month, day: today.day };
      }
    }
    return this.#anchor;
  }

  #emitEvent(eventId: string): void {
    const matched = findEventById(this.#events, eventId);
    if (!matched) return;
    this.dispatchEvent(
      new CustomEvent<EventCalendarEventClickDetail>('event-click', {
        detail: { event: matched },
        bubbles: true,
      }),
    );
  }

  #emitDay(date: CalendarDate): void {
    this.dispatchEvent(
      new CustomEvent<EventCalendarDayClickDetail>('day-click', {
        detail: { date },
        bubbles: true,
      }),
    );
  }

  render(): void {
    if (!this.#connected) return;
    const localePack = localePackFor(this.#locale);
    const today = createCalendar({ system: this.#system }).today();
    const anchor = this.#ensureAnchor();
    const navLabel = this.#view === 'month' ? 'month' : this.#view === 'week' ? 'week' : 'day';

    const title = (() => {
      if (this.#view === 'month') {
        const monthLabel = localePack.monthNames[this.#system].long[anchor.month - 1]!;
        const yearLabel = formatNumber(anchor.year, localePack.defaultNumerals, localePack.digits);
        return `${monthLabel} ${yearLabel}`;
      }
      const periodDays = daysForEventView(this.#system, this.#view, anchor);
      if (this.#view === 'day') {
        return formatDate(periodDays[0]!, localePack, { style: 'long' });
      }
      return `${formatDate(periodDays[0]!, localePack, { style: 'short' })} – ${formatDate(
        periodDays[periodDays.length - 1]!,
        localePack,
        { style: 'short' },
      )}`;
    })();

    this.dir = localePack.direction;
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', this.#titleId);
    this.setAttribute('data-jalali-calendar-root', '');
    this.setAttribute('data-jalali-eventcalendar-root', '');
    this.setAttribute('data-view', this.#view);

    const header = document.createElement('div');
    header.setAttribute('data-jalali-calendar-header', '');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.setAttribute('data-jalali-calendar-nav', 'previous');
    prev.setAttribute('aria-label', `Previous ${navLabel}`);
    prev.textContent = '‹';
    prev.addEventListener('click', () => {
      this.#anchor = shiftEventViewAnchor(this.#system, this.#view, anchor, -1);
      this.render();
    });

    const titleEl = document.createElement('span');
    titleEl.id = this.#titleId;
    titleEl.setAttribute('data-jalali-calendar-title', '');
    titleEl.textContent = title;

    const next = document.createElement('button');
    next.type = 'button';
    next.setAttribute('data-jalali-calendar-nav', 'next');
    next.setAttribute('aria-label', `Next ${navLabel}`);
    next.textContent = '›';
    next.addEventListener('click', () => {
      this.#anchor = shiftEventViewAnchor(this.#system, this.#view, anchor, 1);
      this.render();
    });

    header.append(prev, titleEl, next);

    if (this.#view === 'month') {
      const weeks = buildCalendarGrid(this.#system, anchor.year, anchor.month, today, null);
      const weekLayouts = layoutMonthEvents(this.#events, weeks);
      const grid = document.createElement('div');
      grid.setAttribute('role', 'grid');
      grid.setAttribute('aria-labelledby', this.#titleId);
      grid.setAttribute('data-jalali-calendar-grid', '');
      grid.setAttribute('data-jalali-eventcalendar-grid', '');

      const weekdays = document.createElement('div');
      weekdays.setAttribute('role', 'row');
      weekdays.setAttribute('data-jalali-calendar-weekdays', '');
      for (const name of weekdayLabelsForGrid(localePack.weekdayNames.short, this.#system)) {
        const cell = document.createElement('span');
        cell.setAttribute('role', 'columnheader');
        cell.setAttribute('data-jalali-calendar-weekday', '');
        cell.textContent = name;
        weekdays.append(cell);
      }
      grid.append(weekdays);

      weeks.forEach((week, weekIndex) => {
        const segments = weekLayouts[weekIndex] ?? [];
        const laneCount = laneCountOf(segments);
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
          button.addEventListener('click', () => this.#emitDay(cell.date));
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
            this.#emitEvent(segment.eventId);
          });
          lanes.append(button);
        }

        row.append(days, lanes);
        grid.append(row);
      });

      this.replaceChildren(header, grid);
      return;
    }

    const periodDays = daysForEventView(this.#system, this.#view, anchor);
    const allDaySegments = layoutWeekEvents(this.#events.filter(eventIsAllDay), periodDays);
    const timedLayouts = layoutDaysTimedEvents(this.#events, periodDays);
    const allDayLaneCount = laneCountOf(allDaySegments);
    const period = document.createElement('div');
    period.setAttribute('role', 'region');
    period.tabIndex = 0;
    period.setAttribute('aria-labelledby', this.#titleId);
    period.setAttribute('data-jalali-eventcalendar-period', '');
    period.style.setProperty('--jalali-event-cols', String(periodDays.length));

    const days = document.createElement('div');
    days.setAttribute('data-jalali-eventcalendar-days', '');
    for (const day of periodDays) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-jalali-calendar-day', '');
      if (isSameDay(day, today)) {
        button.setAttribute('data-today', '');
        button.setAttribute('aria-current', 'date');
      }
      button.setAttribute('aria-label', formatDate(day, localePack, { style: 'long' }));
      const name = document.createElement('span');
      name.setAttribute('data-jalali-eventcalendar-dayname', '');
      name.textContent = localePack.weekdayNames.short[dayOfWeek(day, this.#system)] ?? '';
      button.append(
        name,
        document.createTextNode(
          formatNumber(day.day, localePack.defaultNumerals, localePack.digits),
        ),
      );
      button.addEventListener('click', () => this.#emitDay(day));
      days.append(button);
    }

    const allday = document.createElement('div');
    allday.setAttribute('data-jalali-eventcalendar-lanes', '');
    allday.setAttribute('data-jalali-eventcalendar-allday', '');
    if (allDayLaneCount > 0) allday.style.gridTemplateRows = `repeat(${allDayLaneCount}, auto)`;
    for (const segment of allDaySegments) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-jalali-eventcalendar-event', '');
      button.setAttribute('data-all-day', '');
      if (segment.continuesBefore) button.setAttribute('data-continues-before', '');
      if (segment.continuesAfter) button.setAttribute('data-continues-after', '');
      button.style.gridColumn = `${segment.startWeekday + 1} / ${segment.endWeekday + 2}`;
      button.style.gridRow = `${segment.lane + 1}`;
      button.textContent = segment.title;
      button.addEventListener('click', (click) => {
        click.stopPropagation();
        this.#emitEvent(segment.eventId);
      });
      allday.append(button);
    }

    const timed = document.createElement('div');
    timed.setAttribute('role', 'region');
    timed.tabIndex = 0;
    timed.setAttribute('aria-labelledby', this.#titleId);
    timed.setAttribute('data-jalali-eventcalendar-timed', '');

    const hours = document.createElement('div');
    hours.setAttribute('data-jalali-eventcalendar-hours', '');
    for (const hour of listHours()) {
      const label = document.createElement('span');
      label.setAttribute('data-jalali-eventcalendar-hour', '');
      label.textContent = formatNumber(hour, localePack.defaultNumerals, localePack.digits);
      hours.append(label);
    }
    timed.append(hours);

    periodDays.forEach((day, dayIndex) => {
      const blocks = timedLayouts[dayIndex] ?? [];
      const laneCount = Math.max(1, laneCountOf(blocks));
      const col = document.createElement('div');
      col.setAttribute('data-jalali-eventcalendar-daycol', '');
      for (const block of blocks) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-jalali-eventcalendar-event', '');
        button.setAttribute('data-timed', '');
        Object.assign(button.style, timedBlockStyle(block, laneCount));
        button.textContent = block.title;
        button.addEventListener('click', (click) => {
          click.stopPropagation();
          this.#emitEvent(block.eventId);
        });
        col.append(button);
      }
      timed.append(col);
    });

    period.append(days, allday, timed);
    this.replaceChildren(header, period);
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
