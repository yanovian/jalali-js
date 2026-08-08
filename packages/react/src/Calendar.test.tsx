// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar.js';

let originalTz: string | undefined;
beforeAll(() => {
  originalTz = process.env.TZ;
  process.env.TZ = 'UTC';
});
afterAll(() => {
  process.env.TZ = originalTz;
});

beforeEach(() => {
  // Fakes only Date, not setTimeout/setInterval/etc: user-event's internal timing relies on
  // real timers, and faking those too makes it hang waiting for a tick that never comes.
  vi.useFakeTimers({ toFake: ['Date'] });
  // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar.
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('Calendar', () => {
  it('opens on the selected date’s month and shows the English month name and year', () => {
    render(
      <Calendar
        system="jalali"
        locale="en"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    expect(screen.getByText('Mordad 1403')).toBeInTheDocument();
  });

  it('marks the selected day and the current day with their data attributes', () => {
    render(
      <Calendar
        system="jalali"
        locale="en"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    const selected = screen.getByRole('gridcell', { selected: true });
    expect(selected).toHaveTextContent('15');
    expect(selected).toHaveAttribute('data-today');
  });

  it('calls onSelect with the clicked day as a full CalendarDate', async () => {
    const user = userEvent.setup({ delay: null });
    const onSelect = vi.fn();
    render(
      <Calendar
        system="jalali"
        locale="en"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole('gridcell', { name: '1 Mordad 1403' }));
    expect(onSelect).toHaveBeenCalledWith({
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 1,
    });
  });

  it('moves to the next and previous month on nav button clicks', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Calendar
        system="jalali"
        locale="en"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('Shahrivar 1403')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('Tir 1403')).toBeInTheDocument();
  });

  it('renders Persian month names and digits in the fa locale', () => {
    render(
      <Calendar
        system="jalali"
        locale="fa"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    expect(screen.getByText('مرداد ۱۴۰۳')).toBeInTheDocument();
  });
});
