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
    expect(screen.getByRole('button', { name: 'Choose month' })).toHaveTextContent('Mordad');
    expect(screen.getByRole('button', { name: 'Choose year' })).toHaveTextContent('1403');
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
    const monthTitle = () => screen.getByRole('button', { name: 'Choose month' });
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(monthTitle()).toHaveTextContent('Shahrivar');
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(monthTitle()).toHaveTextContent('Tir');
  });

  it('renders Persian month names and digits in the fa locale', () => {
    render(
      <Calendar
        system="jalali"
        locale="fa"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Choose month' })).toHaveTextContent('مرداد');
    expect(screen.getByRole('button', { name: 'Choose year' })).toHaveTextContent('۱۴۰۳');
  });

  describe('quickNav (default on)', () => {
    it('opens the month grid when the month title is clicked, and picking a month returns to the day grid', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Calendar
          system="jalali"
          locale="en"
          value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Choose month' }));
      expect(screen.getByRole('listbox', { name: 'Month' })).toBeInTheDocument();
      await user.click(screen.getByRole('option', { name: 'Aban' }));
      expect(screen.queryByRole('listbox', { name: 'Month' })).not.toBeInTheDocument();
      expect(screen.getByRole('gridcell', { name: '15 Aban 1403' })).toBeInTheDocument();
    });

    it('opens the year grid when the year title is clicked, and picking a year moves to the month grid', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Calendar
          system="jalali"
          locale="en"
          value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Choose year' }));
      expect(screen.getByRole('listbox', { name: 'Year' })).toBeInTheDocument();
      await user.click(screen.getByRole('option', { name: '1400' }));
      expect(screen.getByRole('listbox', { name: 'Month' })).toBeInTheDocument();
    });

    it('does not render clickable title buttons when quickNav is false', () => {
      render(
        <Calendar
          system="jalali"
          locale="en"
          quickNav={false}
          value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Choose month' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Choose year' })).not.toBeInTheDocument();
    });
  });
});
