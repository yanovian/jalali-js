// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import type { CalendarEvent } from 'jalali-js';
import { mount } from '@vue/test-utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import EventCalendar from './EventCalendar.vue';

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
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

const demoEvents: CalendarEvent[] = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
  {
    id: 'meeting',
    title: 'Meeting',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
  },
];

describe('EventCalendar', () => {
  it('renders the seeded month and event titles', () => {
    const wrapper = mount(EventCalendar, {
      props: {
        locale: 'en',
        initialDisplayedMonth: { year: 1403, month: 5 },
        events: demoEvents,
      },
    });
    expect(wrapper.text()).toContain('Mordad');
    expect(wrapper.findAll('[data-jalali-eventcalendar-event]').map((n) => n.text())).toEqual(
      expect.arrayContaining(['Workshop', 'Meeting']),
    );
  });

  it('emits eventClick and dayClick', async () => {
    const wrapper = mount(EventCalendar, {
      props: {
        locale: 'en',
        initialDisplayedMonth: { year: 1403, month: 5 },
        events: demoEvents,
      },
    });
    const workshop = wrapper
      .findAll('[data-jalali-eventcalendar-event]')
      .find((n) => n.text() === 'Workshop')!;
    await workshop.trigger('click');
    expect(wrapper.emitted('eventClick')?.[0]?.[0]).toMatchObject({
      id: 'workshop',
      title: 'Workshop',
    });
    await wrapper.get('[aria-label="15 Mordad 1403"]').trigger('click');
    expect(wrapper.emitted('dayClick')?.[0]?.[0]).toMatchObject({
      year: 1403,
      month: 5,
      day: 15,
    });
  });

  it('renders week and day views', async () => {
    const wrapper = mount(EventCalendar, {
      props: {
        locale: 'en',
        view: 'week',
        initialDate: { year: 1403, month: 5, day: 15 },
        events: demoEvents,
      },
    });
    expect(wrapper.find('[data-view="week"]').exists()).toBe(true);
    expect(wrapper.find('[data-jalali-eventcalendar-timed]').exists()).toBe(true);
    await wrapper.setProps({ view: 'day' });
    expect(wrapper.find('[data-view="day"]').exists()).toBe(true);
  });
});
