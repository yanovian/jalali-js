// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { CalendarEvent } from 'jalali-js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventCalendar } from './EventCalendar.js';

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
  cleanup();
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
    allDay: false,
    startTime: { hour: 14, minute: 0 },
    endTime: { hour: 15, minute: 0 },
  },
];

describe('EventCalendar', () => {
  it('renders the seeded month and event titles', () => {
    render(
      <EventCalendar
        locale="en"
        initialDisplayedMonth={{ year: 1403, month: 5 }}
        events={demoEvents}
      />,
    );
    expect(screen.getByText(/Mordad/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Workshop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Meeting' })).toBeInTheDocument();
  });

  it('fires onEventClick and onDayClick', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onDayClick = vi.fn();
    render(
      <EventCalendar
        locale="en"
        initialDisplayedMonth={{ year: 1403, month: 5 }}
        events={demoEvents}
        onEventClick={onEventClick}
        onDayClick={onDayClick}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Workshop' }));
    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'workshop', title: 'Workshop' }),
    );
    await user.click(screen.getByRole('gridcell', { name: '15 Mordad 1403' }));
    expect(onDayClick).toHaveBeenCalledWith(
      expect.objectContaining({ year: 1403, month: 5, day: 15 }),
    );
  });

  it('lays a multi-day event across more than one day', () => {
    render(
      <EventCalendar
        locale="en"
        initialDisplayedMonth={{ year: 1403, month: 5 }}
        events={demoEvents}
      />,
    );
    const workshop = screen.getByRole('button', { name: 'Workshop' });
    const parts = workshop.style.gridColumn.split(' / ').map(Number);
    expect(parts).toHaveLength(2);
    expect(parts[1]! - parts[0]!).toBeGreaterThanOrEqual(2);
  });

  it('exposes a labeled region and a keyboard-focusable week pane', () => {
    render(
      <EventCalendar
        locale="en"
        view="week"
        initialDate={{ year: 1403, month: 5, day: 15 }}
        events={demoEvents}
      />,
    );
    const root = document.querySelector('[data-jalali-eventcalendar-root]');
    expect(root).toHaveAttribute('role', 'region');
    expect(root).toHaveAttribute('aria-labelledby');
    const period = document.querySelector('[data-jalali-eventcalendar-period]');
    expect(period).toHaveAttribute('tabindex', '0');
    expect(period).toHaveAttribute('role', 'region');
    expect(period?.style.getPropertyValue('--jalali-event-cols')).toBe('7');
  });

  it('renders week and day views with timed placement', () => {
    const { rerender } = render(
      <EventCalendar
        locale="en"
        view="week"
        initialDate={{ year: 1403, month: 5, day: 15 }}
        events={demoEvents}
      />,
    );
    expect(document.querySelector('[data-view="week"]')).toBeTruthy();
    expect(document.querySelector('[data-jalali-eventcalendar-timed]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Meeting' })).toHaveAttribute('data-timed');
    expect(
      document
        .querySelector('[data-jalali-eventcalendar-period]')
        ?.style.getPropertyValue('--jalali-event-cols'),
    ).toBe('7');

    rerender(
      <EventCalendar
        locale="en"
        view="day"
        initialDate={{ year: 1403, month: 5, day: 15 }}
        events={demoEvents}
      />,
    );
    expect(document.querySelector('[data-view="day"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Meeting' })).toBeInTheDocument();
    expect(
      document
        .querySelector('[data-jalali-eventcalendar-period]')
        ?.style.getPropertyValue('--jalali-event-cols'),
    ).toBe('1');
  });
});
