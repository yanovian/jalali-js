// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker.js';

afterEach(() => {
  cleanup();
});

const initialDate = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

describe('DatePicker (grid variant, the default)', () => {
  it('shows the date formatted in the display locale', () => {
    render(<DatePicker locale="en" defaultDate={initialDate} />);
    expect(screen.getByRole('combobox')).toHaveValue('15 Mordad 1403');
  });

  it('is closed until the input is clicked, then opens the grid popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker locale="en" defaultDate={initialDate} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the popover on Escape', async () => {
    const user = userEvent.setup();
    render(<DatePicker locale="en" defaultDate={initialDate} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('emits a Gregorian ISO string by default, even though the display shows Jalali', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker locale="en" defaultDate={initialDate} onChange={onChange} />);

    // Sanity check: the display really is Jalali, not Gregorian.
    expect(screen.getByRole('combobox')).toHaveValue('15 Mordad 1403');

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));

    // 20 Mordad 1403 is 2024-08-10 on the Gregorian calendar.
    expect(onChange).toHaveBeenCalledWith('2024-08-10', {
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 20,
    });
    const [value] = onChange.mock.calls[0] as [string];
    expect(value).not.toContain('1403');
  });

  it('honors an explicit valueFormat', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        locale="en"
        defaultDate={initialDate}
        valueFormat="jalali-object"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
    const [value] = onChange.mock.calls[0] as [unknown];
    expect(value).toEqual({ year: 1403, month: 5, day: 20 });
  });

  it('honors displayFormat', () => {
    render(<DatePicker locale="en" defaultDate={initialDate} displayFormat={{ weekday: true }} />);
    // 2024-08-05 (15 Mordad 1403) is a Monday.
    expect(screen.getByRole('combobox')).toHaveValue('Monday, 15 Mordad 1403');
  });

  it('updates the displayed value after a selection, closing the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker locale="en" defaultDate={initialDate} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
    expect(screen.getByRole('combobox')).toHaveValue('20 Mordad 1403');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('DatePicker (defaultDate)', () => {
  it('defaults to today when defaultDate is omitted', () => {
    render(<DatePicker locale="en" />);
    expect(screen.getByRole('combobox')).not.toHaveValue('');
  });

  it('shows the placeholder with an empty value when defaultDate is null', () => {
    render(<DatePicker locale="en" defaultDate={null} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Select a date');
  });

  it('opens on today’s month when defaultDate is null, with nothing selected', async () => {
    const user = userEvent.setup();
    render(<DatePicker locale="en" defaultDate={null} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('gridcell', { selected: true })).not.toBeInTheDocument();
  });
});

describe('DatePicker (dropdown variant)', () => {
  it('renders three selects reflecting the initial date', () => {
    render(<DatePicker locale="en" defaultDate={initialDate} variant="dropdown" />);
    expect(screen.getByRole('combobox', { name: 'Year' })).toHaveValue('1403');
    expect(screen.getByRole('combobox', { name: 'Month' })).toHaveValue('5');
    expect(screen.getByRole('combobox', { name: 'Day' })).toHaveValue('15');
  });

  it('emits the Gregorian-equivalent value when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker locale="en" defaultDate={initialDate} variant="dropdown" onChange={onChange} />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Day' }), '20');
    expect(onChange).toHaveBeenCalledWith('2024-08-10', {
      precision: 'date',
      system: 'jalali',
      year: 1403,
      month: 5,
      day: 20,
    });
  });

  it('clamps the day when switching to a shorter month', async () => {
    const user = userEvent.setup();
    // Mordad (month 5) has 31 days; day 31 does not exist in a 30-day month.
    render(<DatePicker locale="en" defaultDate={{ ...initialDate, day: 31 }} variant="dropdown" />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Month' }), '7'); // Mehr, 30 days
    expect(screen.getByRole('combobox', { name: 'Day' })).toHaveValue('30');
  });
});
