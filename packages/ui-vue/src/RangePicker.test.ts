// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { mount } from '@vue/test-utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import RangePicker from './RangePicker.vue';

let originalTz: string | undefined;
beforeAll(() => {
  originalTz = process.env.TZ;
  process.env.TZ = 'UTC';
});
afterAll(() => {
  process.env.TZ = originalTz;
});

beforeEach(() => {
  // Fakes only Date, not setTimeout/setInterval/etc, since faking those too can hang other
  // async machinery (the same reason packages/react's Calendar.test.tsx does this).
  vi.useFakeTimers({ toFake: ['Date'] });
  // 2024-08-05 is 15 Mordad 1403 on the Jalali calendar.
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

// 15 Mordad 1403 is 2024-08-05. All in Mordad (month 5), which has 31 days, so 10/15/20 all
// fall in the same month for a simple single-screen test.
const defaultRange = {
  start: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 10 },
  end: { precision: 'date' as const, system: 'jalali' as const, year: 1403, month: 5, day: 20 },
};

describe('RangePicker', () => {
  it('is empty and closed until the input is clicked', () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en', defaultRange } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('shows the seeded range once opened', async () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en', defaultRange } });
    expect((wrapper.get('[role="combobox"]').element as HTMLInputElement).value).toBe(
      '10 Mordad 1403 – 20 Mordad 1403',
    );
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('marks the seeded range’s endpoints and the days between them', async () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en', defaultRange } });
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('[aria-label="10 Mordad 1403"]').attributes('data-range-start')).toBe('');
    expect(wrapper.get('[aria-label="20 Mordad 1403"]').attributes('data-range-end')).toBe('');
    expect(wrapper.get('[aria-label="15 Mordad 1403"]').attributes('data-in-range')).toBe('');
    expect(wrapper.get('[aria-label="9 Mordad 1403"]').attributes('data-in-range')).toBeUndefined();
    expect(
      wrapper.get('[aria-label="21 Mordad 1403"]').attributes('data-in-range'),
    ).toBeUndefined();
  });

  it('picks a range with two clicks: start, then end', async () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en' } });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="10 Mordad 1403"]').trigger('click');
    // Still open: only the start is set.
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();

    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    // 10 and 20 Mordad 1403 are 2024-07-31 and 2024-08-10 (Gregorian ISO, the default format).
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual([{ start: '2024-07-31', end: '2024-08-10' }]);
  });

  it('restarts the range when the second click is before the first', async () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en' } });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');
    await wrapper.get('[aria-label="10 Mordad 1403"]').trigger('click');
    // Restarted, not completed: the popover is still open and nothing has been emitted.
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.get('[aria-label="10 Mordad 1403"]').attributes('data-range-start')).toBe('');

    await wrapper.get('[aria-label="15 Mordad 1403"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
  });

  it('allows a single-day range (clicking the same day twice)', async () => {
    const wrapper = mount(RangePicker, { props: { locale: 'en' } });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="10 Mordad 1403"]').trigger('click');
    await wrapper.get('[aria-label="10 Mordad 1403"]').trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual([{ start: '2024-07-31', end: '2024-07-31' }]);
  });

  it('honors an explicit valueFormat', async () => {
    const wrapper = mount(RangePicker, {
      props: { locale: 'en', valueFormat: 'jalali-object' },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[aria-label="10 Mordad 1403"]').trigger('click');
    await wrapper.get('[aria-label="20 Mordad 1403"]').trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[0]).toEqual([
      { start: { year: 1403, month: 5, day: 10 }, end: { year: 1403, month: 5, day: 20 } },
    ]);
  });

  it('closes the popover on Escape', async () => {
    const wrapper = mount(RangePicker, {
      props: { locale: 'en' },
      attachTo: document.body,
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    await wrapper.get('[data-jalali-datepicker-root]').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
