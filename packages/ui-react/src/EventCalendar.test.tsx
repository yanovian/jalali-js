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
});
