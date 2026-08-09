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
    expect(wrapper.get('[data-jalali-calendar-title-month]').text()).toBe('Mordad');
    expect(wrapper.get('[data-jalali-calendar-title-year]').text()).toBe('1403');
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
    expect(wrapper.get('[data-jalali-calendar-title-month]').text()).toBe('Shahrivar');
    await wrapper.get('[data-jalali-calendar-nav="previous"]').trigger('click');
    await wrapper.get('[data-jalali-calendar-nav="previous"]').trigger('click');
    expect(wrapper.get('[data-jalali-calendar-title-month]').text()).toBe('Tir');
  });

  it('renders Persian month names and digits in the fa locale', () => {
    const wrapper = mount(Calendar, {
      props: { system: 'jalali', locale: 'fa', value: selectedDate },
    });
    expect(wrapper.get('[data-jalali-calendar-title-month]').text()).toBe('مرداد');
    expect(wrapper.get('[data-jalali-calendar-title-year]').text()).toBe('۱۴۰۳');
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

  describe('quickNav (default on)', () => {
    it('opens the month grid when the month title is clicked, and picking a month returns to the day grid', async () => {
      const wrapper = mount(Calendar, {
        props: { system: 'jalali', locale: 'en', value: selectedDate },
      });
      await wrapper.get('[data-jalali-calendar-title-month]').trigger('click');
      expect(wrapper.find('[data-jalali-calendar-months]').exists()).toBe(true);
      const months = wrapper.findAll('[data-jalali-calendar-month]');
      await months[7]!.trigger('click'); // Aban, index 7
      expect(wrapper.find('[data-jalali-calendar-months]').exists()).toBe(false);
      expect(wrapper.get('[data-jalali-calendar-title-month]').text()).toBe('Aban');
    });

    it('opens the year grid when the year title is clicked, and picking a year moves to the month grid', async () => {
      const wrapper = mount(Calendar, {
        props: { system: 'jalali', locale: 'en', value: selectedDate },
      });
      await wrapper.get('[data-jalali-calendar-title-year]').trigger('click');
      expect(wrapper.find('[data-jalali-calendar-years]').exists()).toBe(true);
      const years = wrapper.findAll('[data-jalali-calendar-year]');
      await years[0]!.trigger('click');
      expect(wrapper.find('[data-jalali-calendar-months]').exists()).toBe(true);
    });

    it('does not render clickable title buttons when quickNav is false', () => {
      const wrapper = mount(Calendar, {
        props: { system: 'jalali', locale: 'en', value: selectedDate, quickNav: false },
      });
      expect(wrapper.find('button[data-jalali-calendar-title-month]').exists()).toBe(false);
      expect(wrapper.find('button[data-jalali-calendar-title-year]').exists()).toBe(false);
    });
  });
});
