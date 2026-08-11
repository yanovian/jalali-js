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

  it('starts Jalali weekday headers on Saturday and Gregorian on Sunday', () => {
    const jalali = mount(Calendar, {
      props: { system: 'jalali', locale: 'en', value: selectedDate },
    });
    expect(jalali.findAll('[data-jalali-calendar-weekday]').map((node) => node.text())).toEqual([
      'Sat',
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
    ]);

    const fa = mount(Calendar, {
      props: { system: 'jalali', locale: 'fa', value: selectedDate },
    });
    expect(fa.findAll('[data-jalali-calendar-weekday]')[0]!.text()).toBe('ش');

    const gregorian = mount(Calendar, {
      props: {
        system: 'gregorian',
        locale: 'en',
        value: {
          precision: 'date',
          system: 'gregorian',
          year: 2024,
          month: 8,
          day: 5,
        },
      },
    });
    expect(gregorian.findAll('[data-jalali-calendar-weekday]').map((node) => node.text())).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
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

  describe('selection rules', () => {
    it('renders blocked days disabled, with data-disabled, and rejects clicks on them', async () => {
      const wrapper = mount(Calendar, {
        props: {
          system: 'jalali',
          locale: 'en',
          value: selectedDate,
          rules: { minDate: { year: 1403, month: 5, day: 10 } },
        },
      });
      const blocked = wrapper.get('[aria-label="9 Mordad 1403"]');
      expect(blocked.attributes('aria-disabled')).toBe('true');
      expect(blocked.attributes('data-disabled')).toBe('');
      await blocked.trigger('click');
      expect(wrapper.emitted('select')).toBeUndefined();

      const allowed = wrapper.get('[aria-label="10 Mordad 1403"]');
      expect(allowed.attributes('aria-disabled')).toBeUndefined();
      expect(allowed.attributes('data-disabled')).toBeUndefined();
      await allowed.trigger('click');
      expect(wrapper.emitted('select')).toHaveLength(1);
    });

    it('blocks listed weekdays', () => {
      // 1403-05-15 is a Monday (weekday index 1); so is 1403-05-08.
      const wrapper = mount(Calendar, {
        props: {
          system: 'jalali',
          locale: 'en',
          value: selectedDate,
          rules: { disabledWeekdays: [1] },
        },
      });
      expect(wrapper.get('[aria-label="8 Mordad 1403"]').attributes('aria-disabled')).toBe('true');
      expect(
        wrapper.get('[aria-label="9 Mordad 1403"]').attributes('aria-disabled'),
      ).toBeUndefined();
    });
  });

  describe('holidays', () => {
    const farvardin1403 = {
      system: 'jalali' as const,
      locale: 'en' as const,
      initialDisplayedMonth: { year: 1403, month: 1 },
      showHolidays: true,
    };

    it('wires holiday tip and aria name when showHolidays is on', async () => {
      const wrapper = mount(Calendar, { props: farvardin1403 });
      const nowruz = wrapper.get('[aria-label="1 Farvardin 1403. Nowruz"]');
      expect(nowruz.attributes('data-holiday')).toBe('');
      expect(nowruz.attributes('data-jalali-day-tip')).toBe('Nowruz');
      expect(wrapper.get('[data-jalali-calendar-tip]').text()).toBe('');
      await nowruz.trigger('mouseenter');
      expect(wrapper.get('[data-jalali-calendar-tip]').text()).toBe('Nowruz');
      expect(
        wrapper.get('[aria-label="5 Farvardin 1403"]').attributes('data-jalali-day-tip'),
      ).toBeUndefined();
    });

    it('marks blocked holidays closed in tip and aria', async () => {
      const wrapper = mount(Calendar, { props: { ...farvardin1403, blockHolidays: true } });
      const nowruz = wrapper.get('[aria-label="1 Farvardin 1403. Nowruz · Closed"]');
      expect(nowruz.attributes('aria-disabled')).toBe('true');
      expect(nowruz.attributes('data-jalali-day-tip')).toBe('Nowruz · Closed');
      await nowruz.trigger('mouseenter');
      expect(wrapper.get('[data-jalali-calendar-tip]').text()).toBe('Nowruz · Closed');
      await nowruz.trigger('click');
      expect(wrapper.emitted('select')).toBeUndefined();

      await wrapper.get('[aria-label="5 Farvardin 1403"]').trigger('click');
      expect(wrapper.emitted('select')).toHaveLength(1);
    });
  });
});
