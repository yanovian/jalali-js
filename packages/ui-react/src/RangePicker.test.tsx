// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { RangePicker } from './RangePicker.js';

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

// 1403-05-15 is 2024-08-05. All in Mordad (month 5), which has 31 days, so 10/15/20 all fall
// in the same month for a simple single-screen test.
const anchorRange = {
  start: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 10 },
  end: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 20 },
};

describe('RangePicker', () => {
  it('is empty and closed until the input is clicked', () => {
    render(<RangePicker locale="en" defaultRange={anchorRange} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the seeded range once opened', async () => {
    const user = userEvent.setup();
    render(<RangePicker locale="en" defaultRange={anchorRange} />);
    expect(screen.getByRole('combobox')).toHaveValue('10 Mordad 1403 – 20 Mordad 1403');
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('marks the seeded range’s endpoints and the days between them', async () => {
    const user = userEvent.setup();
    render(<RangePicker locale="en" defaultRange={anchorRange} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '10 Mordad 1403' })).toHaveAttribute(
      'data-range-start',
    );
    expect(screen.getByRole('gridcell', { name: '20 Mordad 1403' })).toHaveAttribute(
      'data-range-end',
    );
    expect(screen.getByRole('gridcell', { name: '15 Mordad 1403' })).toHaveAttribute(
      'data-in-range',
    );
    expect(screen.getByRole('gridcell', { name: '9 Mordad 1403' })).not.toHaveAttribute(
      'data-in-range',
    );
    expect(screen.getByRole('gridcell', { name: '21 Mordad 1403' })).not.toHaveAttribute(
      'data-in-range',
    );
  });

  it('picks a range with two clicks: start, then end', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangePicker locale="en" onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
    // Still open: only the start is set.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, range] = onChange.mock.calls[0] as [unknown, unknown];
    // 15 Mordad 1403 is 2024-08-05, so 10 and 20 Mordad are 2024-07-31 and 2024-08-10
    // (Gregorian ISO, the default format).
    expect(value).toEqual({ start: '2024-07-31', end: '2024-08-10' });
    expect(range).toEqual({
      start: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 10 },
      end: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 20 },
    });
  });

  it('restarts the range when the second click is before the first', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangePicker locale="en" onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
    await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
    // Restarted, not completed: the popover is still open and onChange has not fired.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '10 Mordad 1403' })).toHaveAttribute(
      'data-range-start',
    );

    await user.click(screen.getByRole('gridcell', { name: '15 Mordad 1403' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('allows a single-day range (clicking the same day twice)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangePicker locale="en" onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
    await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [, range] = onChange.mock.calls[0] as [unknown, { start: unknown; end: unknown }];
    expect(range.start).toEqual(range.end);
  });

  it('honors an explicit valueFormat', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangePicker locale="en" valueFormat="jalali-object" onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
    await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
    const [value] = onChange.mock.calls[0] as [{ start: unknown; end: unknown }];
    expect(value).toEqual({
      start: { year: 1403, month: 5, day: 10 },
      end: { year: 1403, month: 5, day: 20 },
    });
  });

  it('closes the popover on Escape', async () => {
    const user = userEvent.setup();
    render(<RangePicker locale="en" />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('selection rules', () => {
    it('renders blocked days disabled with data-disabled', async () => {
      const user = userEvent.setup();
      render(
        <RangePicker locale="en" rules={{ disabledDates: [{ year: 1403, month: 5, day: 12 }] }} />,
      );
      await user.click(screen.getByRole('combobox'));
      const blocked = screen.getByRole('gridcell', { name: '12 Mordad 1403' });
      expect(blocked).toBeDisabled();
      expect(blocked).toHaveAttribute('data-disabled');
    });

    it('does not complete a range across a blocked day: the second click restarts instead', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <RangePicker
          locale="en"
          rules={{ disabledDates: [{ year: 1403, month: 5, day: 12 }] }}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('gridcell', { name: '10 Mordad 1403' }));
      await user.click(screen.getByRole('gridcell', { name: '15 Mordad 1403' }));
      // The blocked 12 Mordad sits inside 10..15, so the range restarts at 15 instead.
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('gridcell', { name: '15 Mordad 1403' })).toHaveAttribute(
        'data-range-start',
      );

      await user.click(screen.getByRole('gridcell', { name: '20 Mordad 1403' }));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
