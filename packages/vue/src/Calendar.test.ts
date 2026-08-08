// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { mount } from '@vue/test-utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Calendar from './Calendar.vue';

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

const selectedDate = {
  precision: 'date' as const,
  system: 'jalali' as const,
  year: 1403,
  month: 5,
  day: 15,
};

describe('Calendar', () => {
  it('opens on the selected date’s month and shows the English month name and year', () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
    });
    expect(wrapper.text()).toContain('Mordad 1403');
  });

  it('marks the selected day and the current day with their data attributes', () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
    });
    const selected = wrapper.get('[data-selected]');
    expect(selected.text()).toBe('15');
    expect(selected.attributes('data-today')).toBe('');
  });

  it('emits select with the clicked day as a full CalendarDate', async () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
    });
    const cell = wrapper.get('[aria-label="1 Mordad 1403"]');
    await cell.trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual([
      { precision: 'date', system: 'jalali', year: 1403, month: 5, day: 1 },
    ]);
  });

  it('moves to the next and previous month on nav button clicks', async () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
    });
    await wrapper.get('[data-jalali-calendar-nav="next"]').trigger('click');
    expect(wrapper.text()).toContain('Shahrivar 1403');
    await wrapper.get('[data-jalali-calendar-nav="previous"]').trigger('click');
    await wrapper.get('[data-jalali-calendar-nav="previous"]').trigger('click');
    expect(wrapper.text()).toContain('Tir 1403');
  });

  it('renders Persian month names and digits in the fa locale', () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'fa', value: selectedDate },
    });
    expect(wrapper.text()).toContain('مرداد ۱۴۰۳');
  });

  it('renders custom day cells through the day scoped slot', () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
      slots: {
        day: '<span class="custom-day">{{ params.cell.date.day }}</span>',
      },
    });
    expect(wrapper.find('.custom-day').exists()).toBe(true);
    expect(wrapper.find('[data-jalali-calendar-day]').exists()).toBe(false);
  });
});
