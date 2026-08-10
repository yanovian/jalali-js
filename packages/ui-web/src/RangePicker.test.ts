// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getByRole, queryByRole } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// Registers <jalali-range-picker>: only index.ts's import-time side effect does this, matching
// how a real consumer would `import '@jalali-js/ui-web'`.
import './index.js';
import type { JalaliRangePickerElement } from './RangePicker.js';

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

// All in Mordad (month 5, 31 days), so 10/15/20 stay on one screen.
const anchorRange = {
  start: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 10 },
  end: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 20 },
};

function mount(): JalaliRangePickerElement {
  const el = document.createElement('jalali-range-picker') as JalaliRangePickerElement;
  el.locale = 'en';
  document.body.append(el);
  return el;
}

describe('jalali-range-picker', () => {
  it('is empty and closed until the input is clicked', () => {
    const el = mount();
    el.defaultRange = anchorRange;
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
  });

  it('shows the seeded range once opened', async () => {
    const user = userEvent.setup();
    const el = mount();
    el.defaultRange = anchorRange;
    expect(getByRole(document.body, 'combobox')).toHaveValue('10 Mordad 1403 – 20 Mordad 1403');
    await user.click(getByRole(document.body, 'combobox'));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
  });

  it('marks the seeded range’s endpoints and the days between them', async () => {
    const user = userEvent.setup();
    const el = mount();
    el.defaultRange = anchorRange;
    await user.click(getByRole(document.body, 'combobox'));
    expect(getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' })).toHaveAttribute(
      'data-range-start',
    );
    expect(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' })).toHaveAttribute(
      'data-range-end',
    );
    expect(getByRole(document.body, 'gridcell', { name: '15 Mordad 1403' })).toHaveAttribute(
      'data-in-range',
    );
  });

  it('picks a range with two clicks: start, then end', async () => {
    const user = userEvent.setup();
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', (event) => onChange((event as CustomEvent).detail));
    await user.click(getByRole(document.body, 'combobox'));
    await user.click(getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' }));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' }));
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith({
      value: { start: '2024-07-31', end: '2024-08-10' },
      range: {
        start: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 10 },
        end: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 20 },
      },
    });
  });

  it('restarts the range when the second click is before the first', async () => {
    const user = userEvent.setup();
    mount();
    const onChange = vi.fn();
    document
      .querySelector('jalali-range-picker')!
      .addEventListener('change', (event) => onChange((event as CustomEvent).detail));
    await user.click(getByRole(document.body, 'combobox'));
    await user.click(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' }));
    await user.click(getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' }));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' })).toHaveAttribute(
      'data-range-start',
    );

    await user.click(getByRole(document.body, 'gridcell', { name: '15 Mordad 1403' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('closes the popover on Escape', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(getByRole(document.body, 'combobox'));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
  });

  describe('selection rules', () => {
    const rules = { disabledDates: [{ year: 1403, month: 5, day: 12 }] };

    it('renders blocked days disabled with data-disabled', async () => {
      const user = userEvent.setup();
      const el = mount();
      el.rules = rules;
      await user.click(getByRole(document.body, 'combobox'));
      const blocked = getByRole(document.body, 'gridcell', { name: '12 Mordad 1403' });
      expect(blocked).toBeDisabled();
      expect(blocked).toHaveAttribute('data-disabled');
    });

    it('does not complete a range across a blocked day: the second click restarts instead', async () => {
      const user = userEvent.setup();
      const el = mount();
      el.rules = rules;
      const onChange = vi.fn();
      el.addEventListener('change', onChange);
      await user.click(getByRole(document.body, 'combobox'));
      await user.click(getByRole(document.body, 'gridcell', { name: '10 Mordad 1403' }));
      await user.click(getByRole(document.body, 'gridcell', { name: '15 Mordad 1403' }));
      // The blocked 12 Mordad sits inside 10..15, so the range restarts at 15 instead.
      expect(onChange).not.toHaveBeenCalled();
      expect(getByRole(document.body, 'gridcell', { name: '15 Mordad 1403' })).toHaveAttribute(
        'data-range-start',
      );

      await user.click(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' }));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
