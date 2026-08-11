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

  it('starts Jalali weekday headers on Saturday and Gregorian on Sunday', () => {
    const { rerender } = render(
      <Calendar
        system="jalali"
        locale="en"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    const jalaliHeaders = screen.getAllByRole('columnheader').map((node) => node.textContent);
    expect(jalaliHeaders).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

    rerender(
      <Calendar
        system="jalali"
        locale="fa"
        value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
      />,
    );
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('ش');

    rerender(
      <Calendar
        system="gregorian"
        locale="en"
        value={{ precision: 'date', system: 'gregorian', year: 2024, month: 8, day: 5 }}
      />,
    );
    const gregorianHeaders = screen.getAllByRole('columnheader').map((node) => node.textContent);
    expect(gregorianHeaders).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
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

  describe('selection rules', () => {
    it('renders blocked days disabled, with data-disabled, and rejects clicks on them', async () => {
      const user = userEvent.setup({ delay: null });
      const onSelect = vi.fn();
      render(
        <Calendar
          system="jalali"
          locale="en"
          value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
          rules={{ minDate: { year: 1403, month: 5, day: 10 } }}
          onSelect={onSelect}
        />,
      );
      const blocked = screen.getByRole('gridcell', { name: '9 Mordad 1403' });
      expect(blocked).toBeDisabled();
      expect(blocked).toHaveAttribute('data-disabled');
      await user.click(blocked);
      expect(onSelect).not.toHaveBeenCalled();

      const allowed = screen.getByRole('gridcell', { name: '10 Mordad 1403' });
      expect(allowed).toBeEnabled();
      expect(allowed).not.toHaveAttribute('data-disabled');
      await user.click(allowed);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('blocks listed weekdays', () => {
      // 1403-05-15 is a Monday (weekday index 1); so is 1403-05-08.
      render(
        <Calendar
          system="jalali"
          locale="en"
          value={{ precision: 'date', system: 'jalali', year: 1403, month: 5, day: 15 }}
          rules={{ disabledWeekdays: [1] }}
        />,
      );
      expect(screen.getByRole('gridcell', { name: '8 Mordad 1403' })).toBeDisabled();
      expect(screen.getByRole('gridcell', { name: '9 Mordad 1403' })).toBeEnabled();
    });
  });

  describe('holidays', () => {
    it('marks official holidays with data-holiday when showHolidays is on', () => {
      render(
        <Calendar
          system="jalali"
          locale="en"
          initialDisplayedMonth={{ year: 1403, month: 1 }}
          showHolidays
        />,
      );
      const nowruz = screen.getByRole('gridcell', { name: '1 Farvardin 1403' });
      expect(nowruz).toHaveAttribute('data-holiday');
      expect(nowruz).toBeEnabled();
      expect(screen.getByRole('gridcell', { name: '5 Farvardin 1403' })).not.toHaveAttribute(
        'data-holiday',
      );
    });

    it('blocks holidays when blockHolidays is on', async () => {
      const user = userEvent.setup({ delay: null });
      const onSelect = vi.fn();
      render(
        <Calendar
          system="jalali"
          locale="en"
          initialDisplayedMonth={{ year: 1403, month: 1 }}
          showHolidays
          blockHolidays
          onSelect={onSelect}
        />,
      );
      const nowruz = screen.getByRole('gridcell', { name: '1 Farvardin 1403' });
      expect(nowruz).toBeDisabled();
      expect(nowruz).toHaveAttribute('data-disabled');
      await user.click(nowruz);
      expect(onSelect).not.toHaveBeenCalled();

      const openDay = screen.getByRole('gridcell', { name: '5 Farvardin 1403' });
      expect(openDay).toBeEnabled();
      await user.click(openDay);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });
});
