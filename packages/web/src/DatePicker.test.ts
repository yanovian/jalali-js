// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getByRole, queryByRole } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
// Registers <jalali-date-picker>: only index.ts's import-time side effect does this, matching
// how a real consumer would `import '@jalali-js/web'`.
import './index.js';
import type { JalaliDatePickerElement } from './DatePicker.js';

afterEach(() => {
  document.body.innerHTML = '';
});

const initialDate = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

function mount(): JalaliDatePickerElement {
  const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
  el.locale = 'en';
  document.body.append(el);
  el.defaultDate = initialDate;
  return el;
}

describe('jalali-date-picker (grid variant, the default)', () => {
  it('shows the date formatted in the display locale', () => {
    mount();
    expect(getByRole(document.body, 'combobox')).toHaveValue('15 Mordad 1403');
  });

  it('is closed until the input is clicked, then opens the grid popover', async () => {
    const user = userEvent.setup();
    mount();
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
    await user.click(getByRole(document.body, 'combobox'));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
  });

  it('closes the popover on Escape', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(getByRole(document.body, 'combobox'));
    expect(getByRole(document.body, 'dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
  });

  it('emits a Gregorian ISO string by default, even though the display shows Jalali', async () => {
    const user = userEvent.setup();
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', (event) => onChange((event as CustomEvent).detail));

    expect(getByRole(document.body, 'combobox')).toHaveValue('15 Mordad 1403');

    await user.click(getByRole(document.body, 'combobox'));
    await user.click(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' }));

    expect(onChange).toHaveBeenCalledWith({
      value: '2024-08-10',
      date: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 20 },
    });
  });

  it('updates the displayed value after a selection, closing the popover', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(getByRole(document.body, 'combobox'));
    await user.click(getByRole(document.body, 'gridcell', { name: '20 Mordad 1403' }));
    expect(getByRole(document.body, 'combobox')).toHaveValue('20 Mordad 1403');
    expect(queryByRole(document.body, 'dialog')).not.toBeInTheDocument();
  });
});

describe('jalali-date-picker (defaultDate)', () => {
  it('defaults to today when defaultDate is left unset', () => {
    const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
    el.locale = 'en';
    document.body.append(el);
    expect(getByRole(document.body, 'combobox')).not.toHaveValue('');
  });

  it('shows the placeholder with an empty value when defaultDate is null', () => {
    const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
    el.locale = 'en';
    document.body.append(el);
    el.defaultDate = null;
    const input = getByRole(document.body, 'combobox');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Select a date');
  });
});

describe('jalali-date-picker (dropdown variant)', () => {
  it('renders three selects reflecting the initial date', () => {
    const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
    el.locale = 'en';
    el.variant = 'dropdown';
    document.body.append(el);
    el.defaultDate = initialDate;
    expect(getByRole(document.body, 'combobox', { name: 'Year' })).toHaveValue('1403');
    expect(getByRole(document.body, 'combobox', { name: 'Month' })).toHaveValue('5');
    expect(getByRole(document.body, 'combobox', { name: 'Day' })).toHaveValue('15');
  });

  it('emits the Gregorian-equivalent value when a field changes', async () => {
    const user = userEvent.setup();
    const el = document.createElement('jalali-date-picker') as JalaliDatePickerElement;
    el.locale = 'en';
    el.variant = 'dropdown';
    document.body.append(el);
    el.defaultDate = initialDate;
    const onChange = vi.fn();
    el.addEventListener('change', (event) => onChange((event as CustomEvent).detail));
    await user.selectOptions(getByRole(document.body, 'combobox', { name: 'Day' }), '20');
    expect(onChange).toHaveBeenCalledWith({
      value: '2024-08-10',
      date: { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 20 },
    });
  });
});
