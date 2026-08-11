// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getByRole, getByText, queryByRole } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// Registers <jalali-calendar>: only index.ts's import-time side effect does this, not
// Calendar.ts itself, matching how a real consumer would `import '@jalali-js/web'`.
import './index.js';
import type { JalaliCalendarElement } from './Calendar.js';

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
  // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar.
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const selectedDate = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

function mountCalendar(): JalaliCalendarElement {
  const el = document.createElement('jalali-calendar') as JalaliCalendarElement;
  el.system = 'jalali';
  el.locale = 'en';
  document.body.append(el);
  el.value = selectedDate;
  return el;
}

describe('jalali-calendar', () => {
  it('opens on the selected date’s month and shows the English month name and year', () => {
    mountCalendar();
    expect(getByRole(document.body, 'button', { name: 'Choose month' })).toHaveTextContent(
      'Mordad',
    );
    expect(getByRole(document.body, 'button', { name: 'Choose year' })).toHaveTextContent('1403');
  });

  it('starts Jalali weekday headers on Saturday and Gregorian on Sunday', () => {
    const jalali = mountCalendar();
    expect(
      [...jalali.querySelectorAll('[data-jalali-calendar-weekday]')].map(
        (node) => node.textContent,
      ),
    ).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

    jalali.locale = 'fa';
    expect(jalali.querySelector('[data-jalali-calendar-weekday]')?.textContent).toBe('ش');

    const gregorian = document.createElement('jalali-calendar') as JalaliCalendarElement;
    gregorian.system = 'gregorian';
    gregorian.locale = 'en';
    document.body.append(gregorian);
    gregorian.value = {
      precision: 'date',
      system: 'gregorian',
      year: 2024,
      month: 8,
      day: 5,
    };
    expect(
      [...gregorian.querySelectorAll('[data-jalali-calendar-weekday]')].map(
        (node) => node.textContent,
      ),
    ).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('marks the selected day and the current day with their data attributes', () => {
    mountCalendar();
    const selected = getByRole(document.body, 'gridcell', { selected: true });
    expect(selected).toHaveTextContent('15');
    expect(selected).toHaveAttribute('data-today');
  });

  it('emits select with the clicked day as a full CalendarDate', async () => {
    const user = userEvent.setup({ delay: null });
    const el = mountCalendar();
    const onSelect = vi.fn();
    el.addEventListener('select', (event) => onSelect((event as CustomEvent).detail));
    await user.click(getByRole(document.body, 'gridcell', { name: '1 Mordad 1403' }));
    expect(onSelect).toHaveBeenCalledWith({
      date: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 1 },
    });
  });

  it('moves to the next and previous month on nav button clicks', async () => {
    const user = userEvent.setup({ delay: null });
    mountCalendar();
    await user.click(getByRole(document.body, 'button', { name: 'Next month' }));
    expect(getByRole(document.body, 'button', { name: 'Choose month' })).toHaveTextContent(
      'Shahrivar',
    );
    await user.click(getByRole(document.body, 'button', { name: 'Previous month' }));
    await user.click(getByRole(document.body, 'button', { name: 'Previous month' }));
    expect(getByRole(document.body, 'button', { name: 'Choose month' })).toHaveTextContent('Tir');
  });

  it('renders Persian month names and digits in the fa locale', () => {
    const el = mountCalendar();
    el.locale = 'fa';
    expect(getByRole(document.body, 'button', { name: 'انتخاب ماه' })).toHaveTextContent('مرداد');
    expect(getByRole(document.body, 'button', { name: 'انتخاب سال' })).toHaveTextContent('۱۴۰۳');
  });

  describe('quickNav (default on)', () => {
    it('opens the month grid when the month title is clicked, and picking a month returns to the day grid', async () => {
      const user = userEvent.setup({ delay: null });
      mountCalendar();
      await user.click(getByRole(document.body, 'button', { name: 'Choose month' }));
      expect(getByRole(document.body, 'listbox', { name: 'Month' })).toBeInTheDocument();
      await user.click(getByRole(document.body, 'option', { name: 'Aban' }));
      expect(queryByRole(document.body, 'listbox', { name: 'Month' })).not.toBeInTheDocument();
      expect(getByRole(document.body, 'gridcell', { name: '15 Aban 1403' })).toBeInTheDocument();
    });

    it('opens the year grid when the year title is clicked, and picking a year moves to the month grid', async () => {
      const user = userEvent.setup({ delay: null });
      mountCalendar();
      await user.click(getByRole(document.body, 'button', { name: 'Choose year' }));
      expect(getByRole(document.body, 'listbox', { name: 'Year' })).toBeInTheDocument();
      await user.click(getByRole(document.body, 'option', { name: '1400' }));
      expect(getByRole(document.body, 'listbox', { name: 'Month' })).toBeInTheDocument();
    });

    it('does not render clickable title buttons when quickNav is false', () => {
      const el = mountCalendar();
      el.quickNav = false;
      expect(
        queryByRole(document.body, 'button', { name: 'Choose month' }),
      ).not.toBeInTheDocument();
      expect(getByText(document.body, 'Mordad')).toBeInTheDocument();
    });
  });

  describe('selection rules', () => {
    it('renders blocked days disabled, with data-disabled, and rejects clicks on them', async () => {
      const user = userEvent.setup({ delay: null });
      const el = mountCalendar();
      el.rules = { minDate: { year: 1403, month: 5, day: 10 } };
      const onSelect = vi.fn();
      el.addEventListener('select', onSelect);

      const blocked = getByRole(document.body, 'gridcell', { name: '9 Mordad 1403' });
      expect(blocked).toBeDisabled();
      expect(blocked).toHaveAttribute('data-disabled');
      await user.click(blocked).catch(() => {}); // user-event refuses disabled targets
      expect(onSelect).not.toHaveBeenCalled();

      const allowed = getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' });
      expect(allowed).toBeEnabled();
      await user.click(allowed);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('blocks listed weekdays', () => {
      // 1403-05-15 is a Monday (weekday index 1); so is 1403-05-08.
      const el = mountCalendar();
      el.rules = { disabledWeekdays: [1] };
      expect(getByRole(document.body, 'gridcell', { name: '8 Mordad 1403' })).toBeDisabled();
      expect(getByRole(document.body, 'gridcell', { name: '9 Mordad 1403' })).toBeEnabled();
    });
  });
});
