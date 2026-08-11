// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getByRole, getByText } from '@testing-library/dom';
import type { CalendarEvent } from 'jalali-js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import './index.js';
import type { JalaliEventCalendarElement } from './EventCalendar.js';

let originalTz: string | undefined;
beforeAll(() => {
  originalTz = process.env.TZ;
  process.env.TZ = 'UTC';
});
afterAll(() => {
  process.env.TZ = originalTz;
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const demoEvents: CalendarEvent[] = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
  {
    id: 'meeting',
    title: 'Meeting',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
  },
];

describe('jalali-event-calendar', () => {
  it('registers, renders events, and dispatches click events', () => {
    const el = document.createElement('jalali-event-calendar') as JalaliEventCalendarElement;
    el.setAttribute('locale', 'en');
    el.initialDisplayedMonth = { year: 1403, month: 5 };
    el.events = demoEvents;
    document.body.append(el);

    expect(getByRole(document.body, 'grid')).toBeInTheDocument();
    expect(getByText(document.body, 'Workshop')).toBeInTheDocument();

    const onEvent = vi.fn();
    const onDay = vi.fn();
    el.addEventListener('event-click', onEvent);
    el.addEventListener('day-click', onDay);

    getByText(document.body, 'Workshop').click();
    expect(onEvent).toHaveBeenCalled();
    expect((onEvent.mock.calls[0]![0] as CustomEvent).detail.event.id).toBe('workshop');

    getByRole(document.body, 'gridcell', { name: '15 Mordad 1403' }).click();
    expect(onDay).toHaveBeenCalled();
    expect((onDay.mock.calls[0]![0] as CustomEvent).detail.date).toMatchObject({
      year: 1403,
      month: 5,
      day: 15,
    });
  });

  it('supports week and day views', () => {
    const el = document.createElement('jalali-event-calendar') as JalaliEventCalendarElement;
    el.setAttribute('locale', 'en');
    el.setAttribute('view', 'week');
    el.initialDate = { year: 1403, month: 5, day: 15 };
    el.events = demoEvents;
    document.body.append(el);
    expect(el.getAttribute('data-view')).toBe('week');
    expect(el.querySelector('[data-jalali-eventcalendar-timed]')).toBeTruthy();
    el.view = 'day';
    expect(el.getAttribute('data-view')).toBe('day');
  });

  it('supports timeline view with native digits', () => {
    const el = document.createElement('jalali-event-calendar') as JalaliEventCalendarElement;
    el.setAttribute('locale', 'fa');
    el.setAttribute('view', 'timeline');
    el.displayFormat = { numerals: 'native', template: 'YYYY/MM/DD' };
    el.timeline = { showIcons: true, direction: 'vertical' };
    el.events = [
      {
        id: 'start',
        title: 'آغاز پروژه',
        start: { year: 1403, month: 10, day: 26 },
        end: { year: 1403, month: 10, day: 26 },
        allDay: false,
        startTime: { hour: 9, minute: 0 },
        endTime: { hour: 10, minute: 0 },
        icon: '◎',
      },
    ];
    document.body.append(el);
    expect(el.getAttribute('data-view')).toBe('timeline');
    expect(el.querySelector('[data-jalali-timeline]')).toBeTruthy();
    expect(getByText(document.body, 'آغاز پروژه')).toBeInTheDocument();
    expect(el.textContent).toMatch(/۰۹:۰۰/);

    const onEvent = vi.fn();
    el.addEventListener('event-click', onEvent);
    getByText(document.body, 'آغاز پروژه').click();
    expect(onEvent).toHaveBeenCalled();
    expect((onEvent.mock.calls[0]![0] as CustomEvent).detail.event.id).toBe('start');
  });
});
