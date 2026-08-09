// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DatePicker from './DatePicker.vue';

const defaultDate = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

describe('DatePicker (grid variant, the default)', () => {
  it('shows the date formatted in the display locale', () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate } });
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).toBe(
      '15 Mordad 1403',
    );
  });

  it('is closed until the input is clicked, then opens the grid popover', async () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('closes the popover on Escape', async () => {
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate },
      attachTo: document.body,
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    await wrapper.get('[data-jalali-datepicker-root]').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('emits a Gregorian ISO string via v-model by default, even though the display shows Jalali', async () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate } });

    // Sanity check: the display really is Jalali, not Gregorian.
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).toBe(
      '15 Mordad 1403',
    );

    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');

    // 20 Mordad 1403 is 2024-08-10 on the Gregorian calendar.
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual(['2024-08-10']);
    expect(emitted?.[0]?.[0]).not.toContain('1403');
  });

  it('honors an explicit valueFormat', async () => {
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate, valueFormat: 'jalali-object' },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual([{ year: 1403, month: 5, day: 20 }]);
  });

  it('honors displayFormat', () => {
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate, displayFormat: { weekday: true } },
    });
    // 2024-08-05 (15 Mordad 1403) is a Monday.
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).toBe(
      'Monday, 15 Mordad 1403',
    );
  });

  it('updates the displayed value after a selection, closing the popover', async () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate } });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).toBe(
      '20 Mordad 1403',
    );
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
});

describe('DatePicker (defaultDate)', () => {
  it('defaults to today when defaultDate is omitted', () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en' } });
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).not.toBe('');
  });

  it('shows the placeholder with an empty value when defaultDate is null', () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate: null } });
    const input = wrapper.get('[role="combobox"]').element as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Select a date');
  });

  it('opens on today’s month when defaultDate is null, with nothing selected', async () => {
    const wrapper = mount(DatePicker, { props: { locale: 'en', defaultDate: null } });
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.find('[data-selected]').exists()).toBe(false);
  });
});

describe('DatePicker (dropdown variant)', () => {
  it('renders three selects reflecting the initial date', () => {
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate, variant: 'dropdown' },
    });
    expect((wrapper.get('[aria-label="Year"]').element as HTMLSelectElement).value).toBe('1403');
    expect((wrapper.get('[aria-label="Month"]').element as HTMLSelectElement).value).toBe('5');
    expect((wrapper.get('[aria-label="Day"]').element as HTMLSelectElement).value).toBe('15');
  });

  it('emits the Gregorian-equivalent value when a field changes', async () => {
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate, variant: 'dropdown' },
    });
    await wrapper.get('[aria-label="Day"]').setValue('20');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual(['2024-08-10']);
  });

  it('clamps the day when switching to a shorter month', async () => {
    // Mordad (month 5) has 31 days; day 31 does not exist in a 30-day month.
    const wrapper = mount(DatePicker, {
      props: { locale: 'en', defaultDate: { ...defaultDate, day: 31 }, variant: 'dropdown' },
    });
    await wrapper.get('[aria-label="Month"]').setValue('7'); // Mehr, 30 days
    expect((wrapper.get('[aria-label="Day"]').element as HTMLSelectElement).value).toBe('30');
  });
});
