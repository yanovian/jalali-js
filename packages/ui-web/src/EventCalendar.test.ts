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
});
